import { AkairoClient, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { config } from '../config.dev';
import { findGuild, insertPending } from '../db';
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
    const guildSettings = await findGuild(message.guild.id);
    if (message.channel.id !== guildSettings.submissionID) {
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

    await message.react('👍🏿');
    await message.react('👎🏿');

    await insertPending(message.id, message.guild.id);
  }
}

module.exports = FoodCommand;
