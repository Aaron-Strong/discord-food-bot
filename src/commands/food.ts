import { AkairoClient, Command } from 'discord-akairo';
import { ButtonInteraction, DMChannel, InteractionWebhook, Message, MessageActionRow, MessageAttachment, MessageButton, MessagePayload, TextChannel, WebhookClient } from 'discord.js';
import { config } from '../config';
import { findGuild, getPendingVoters, insertPending, pendingVoterPush } from '../db';
import { uploadFood } from '../Azure/blobs';
import { APIMessage } from 'discord-api-types';

class FoodCommand extends Command {
  client: AkairoClient;

  constructor() {
    super('foodscan', {
      category: 'auto',
    });
  }

  condition(message: Message) {
    return true;
  }

  async exec(message: Message) {
    if (message.channel.type != 'GUILD_TEXT') return;
    const guildSettings = await findGuild(message.guild.id);
    if (guildSettings == null) return;
    if (message.channelId !== guildSettings.submissionID) {
      return false;
    }
    let isImage =
      message.attachments.size != 0 ||
      message.content.includes(`https://`) ||
      message.content.includes(`http://`) ||
      message.content.includes(`www.`);
    if (!isImage) {
      console.log(isImage);
      console.log(message.content);
      message.delete();
      return false;
    }


    let url: string = undefined;
    if (message.attachments.size != 0) {
      url = await uploadFood(message.attachments.first());
    }
    else {
      url = message.content.match(/\bhttps?:\/\/\S+/gi)[0];
      if (!url) return false;
    }
    let targetChannel = message.channel as TextChannel;
    const webhookClient = new WebhookClient({ id: guildSettings.webhookID, token: guildSettings.webhookToken });
    // let webhook = await targetChannel.createWebhook('Some-username')
    // const webhookClient = new WebhookClient(webhook);

    const starRow = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('star_1')
          .setLabel('⭐')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('star_2')
          .setLabel('⭐⭐')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('star_3')
          .setLabel('⭐⭐⭐')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('star_4')
          .setLabel('⭐⭐⭐⭐')
          .setStyle('PRIMARY'),
      );
    const starRow2 = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('star_5')
          .setLabel('⭐⭐⭐⭐⭐')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('star_0')
          .setLabel('💩')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('???')
          .setLabel('❓❓❓')
          .setStyle('PRIMARY'),
      );

    const avatarUrl = message.author.avatarURL({ format: 'png', dynamic: true });
    const username = message.author.username;
    let response: APIMessage = await webhookClient.send({ username: username, avatarURL: avatarUrl, files: [url], components: [starRow, starRow2] });
    let botMessage = await message.channel.messages.fetch(response.id)
    message.delete();
    await insertPending(botMessage.id, message.guild.id);
    const collector = botMessage.createMessageComponentCollector({ componentType: "BUTTON" });
    let votes = await getPendingVoters(botMessage.id);
    collector.on('collect', async interaction => {
      if (interaction.customId == '???') {
        if (votes.some(vote => vote.user === interaction.user.id)){
          let average = parseFloat((votes.reduce((a, b) => a + b.vote, 0) / votes.length).toPrecision(2));
          if (isNaN(average)) {
            average = 0;
          }
          interaction.reply({ content: `${votes.length} ${votes.length == 1 ? 'person has' : 'people have'} voted. The average rating is ${average}`, ephemeral: true });
        }
        else {
          interaction.reply({content: `You have to vote before seeing the results!`, ephemeral: true});
        }
      }
      else if (votes.some(vote => vote.user === interaction.member.user.id))
        interaction.reply({ content: "You already voted!", ephemeral: true });
      else {
        await pendingVoterPush(botMessage.id, { user: interaction.member.user.id, vote: parseInt(interaction.customId.split('_')[1]) });
        interaction.reply({ content: `Successfully Voted!`, ephemeral: true });
        votes = await getPendingVoters(botMessage.id);
      }
    });
    return true;
  }
}

module.exports = FoodCommand;