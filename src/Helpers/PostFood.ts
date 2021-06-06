import { AkairoClient } from 'discord-akairo';
import { Message } from 'discord.js';
import { TextChannel } from 'discord.js';
import { ObjectID } from 'mongodb';
import { uploadFood } from '../Azure/blobs';
import { config } from '../config.dev';
import { insert, pendingDelete } from '../db';
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

  const oldUpvotes = message.reactions.cache
    .filter((a) => a.emoji.name == '👍🏿')
    .map((reaction) => reaction.count)[0];
  const oldDownvotes = message.reactions.cache
    .filter((a) => a.emoji.name == '👎🏿')
    .map((reaction) => reaction.count)[0];

  const upvotes = message.reactions.resolve('👍🏿').count;
  const downvotes = message.reactions.resolve('👎🏿').count;
  console.log('old vs new upvotes', `${oldUpvotes} : ${upvotes}`);
  //console.log(oldUpvotes + ':' + upvotes);
  console.log('old vs new downvotes', `${oldDownvotes} : ${downvotes}`);
  //console.log(oldDownvotes + ':' + downvotes);

  let targetChannel: TextChannel;
  if (upvotes > downvotes) targetChannel = foodPornChannel;
  else targetChannel = foodHellChannel;
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
    embed: {
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
            upvotes > downvotes ? '🥳 Foodporn Poggers!' : '💩 Shitty Food 💩',
          value: `Post received 👍🏿 x ${upvotes - 1}, 👎🏿 x ${downvotes - 1}`,
          inline: false,
        },
      ],
    },
  };

  let postedFoodMessage = await targetChannel.send(embed);
  await insert({
    url: url,
    upvotes: upvotes,
    downvotes: downvotes,
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
