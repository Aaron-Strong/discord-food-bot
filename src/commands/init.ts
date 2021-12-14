import { Command } from 'discord-akairo';
import { Message, WebhookClient } from 'discord.js';
import { TextChannel } from 'discord.js';
import { User } from 'discord.js';
import { ObjectID } from 'mongodb';
import { config } from '../config';
import { guildInit, insert } from '../db';
import { guildSettings } from '../typings';
interface Args {
  submissionsChannel: TextChannel;
  pornChannel: TextChannel;
  hellChannel: TextChannel;
}
class InitCommand extends Command {
  constructor() {
    super('init', {
      aliases: ['initalise', 'initialize'],
      category: 'init',
      args: [
        {
          id: 'submissionsChannel',
          type: 'textChannel',
        },
        {
          id: 'pornChannel',
          type: 'textChannel',
        },
        {
          id: 'hellChannel',
          type: 'textChannel',
        },
      ],
      description: {
        content: `
        Initalises the bot.
        <Requires Admin Perms>
        Run this before anything else.
        The bot requires 3 ready made text channels:
        one for submissions,
        one for good posts,
        and one for bad posts.`,
        usage: ' <#submissionsChannel> <#goodChannel> <#badChannel>',
        example: ['.init @foodSubmissions @foodHeaven @foodHell'],
      },
    });
  }

  async exec(message: Message, args: Args) {
    console.log('Test');
    if (!config.admins.includes(message.author.id)) {
      return message.util.reply('yy nice try');
    }

    const submissionsChannel = args.submissionsChannel;
    const pornChannel = args.pornChannel;
    const hellChannel = args.hellChannel;

    let webhook = await submissionsChannel.createWebhook('Food Submissions')
    const webhookClient = new WebhookClient(webhook);

    const guildSettings: guildSettings = {
      _id: new ObjectID(),
      prefix: '.',
      webhookID: webhook.id,
      webhookToken: webhook.token,
      guildID: message.guild.id,
      submissionID: submissionsChannel.id,
      pornID: pornChannel.id,
      hellID: hellChannel.id,
    };
    guildInit(guildSettings);
    return message.util.reply('Initialisation Complete');
  }
}

module.exports = InitCommand;
