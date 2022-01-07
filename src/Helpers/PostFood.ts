import { AkairoClient } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { TextChannel } from 'discord.js';
import { ObjectID } from 'mongodb';
import { uploadFood } from '../Azure/blobs';
import { config } from '../config';
import { getPendingVoters, insert, pendingDelete } from '../db';
import { guildSettings } from '../typings';

export async function postFood(
  messageID: string,
  client: AkairoClient,
  guildSettings: guildSettings
) {
  console.log('Posting food...');
  // Get
  let FoodSubs = <TextChannel>(
    client.channels.cache.get(guildSettings.submissionID)
  );
  let message: Message;
  try {
    message = await FoodSubs.messages.fetch(messageID);
  } catch (error) {
    if (error.code == 10008) {
      console.error('Some twat deleted his foodpost');
      await pendingDelete(messageID);
      return;
    }
  }
  if (message == null) {
    console.log(`Message with ID of ${messageID} not found`);
    await pendingDelete(messageID);
    return;
  }

  const foodPornChannel = <TextChannel>(
    message.guild.channels.cache.get(guildSettings.pornID)
  );
  const foodHellChannel = <TextChannel>(
    message.guild.channels.cache.get(guildSettings.hellID)
  );

  let targetChannel: TextChannel;

  let votes = await getPendingVoters(messageID);
  let votesAverage = ((votes.reduce((a, b) => a + b.vote, 0) / votes.length).toPrecision(2) || 0) as number;
  let poggers = false;
  if (votesAverage >= 3.5) {
    poggers = true;
    targetChannel = foodPornChannel;
  }
  else
    targetChannel = foodHellChannel;
  let url: string = '';
  if (message.attachments.size != 0) {
    url = await uploadFood(message.attachments.first());
  } else {
    const urls = message.content.match(/\bhttps?:\/\/\S+/gi);
    if (!urls) {
      return;
    }
    url = urls[0];
  }
  if (url === '') {
    return;
  }

  let embed = {
    color: 1925289,
    image: {
      url: url,
    },
    author: {
      name: message.author.username,
      icon_url: message.author.avatarURL(),
    },
    fields: [
      {
        name:
          poggers ? '🥳 Foodporn Poggers!' : '💩 Shitty Food 💩',
        value: `Post received an average of ${votesAverage}⭐.\n
        ${votes.length} ${votes.length == 1 ? 'user' : 'users'} voted.\n
        NFT ID: "${messageID}" minted successfully.\n
        Thank you for your contribution!`,
        inline: false,
      },
    ],
  };


  let postedFoodMessage = await targetChannel.send({ embeds: [embed] });
  await insert({
    url: url,
    averageVote: votesAverage,
    userID: message.author.id,
    discordInline: postedFoodMessage.url,
    username: message.author.username,
    guildID: message.guild.id,
    _id: new ObjectID(),
  });
  console.log(url);
  await pendingDelete(messageID);
  return await message.delete();
}
