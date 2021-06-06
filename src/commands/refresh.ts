import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { findAllPending, findGuild } from '../db';
import { postFood } from '../Helpers/PostFood';

class IntervalCommand extends Command {
  constructor() {
    super('refresh', {
      aliases: ['refresh'],
      category: 'util',
      description: {
        content:
          'Manually checks if food has been in food_submissions too long',
        usage: '',
        example: ['refresh'],
      },
    });
  }

  async exec(message: Message) {
    let intervalTimerInMinutes = Math.round(
      this.client.pendingChecker.next() / 1000 / 60
    );
    this.client.pendingChecker.exec();
    return message.util.reply(
      `Manually Refreshed 👍🏿 Next refresh in ${intervalTimerInMinutes} minutes!`
    );

    // console.log('Pending check running...');
    // const pendingArray = await findAllPending();
    // if (pendingArray.length === 0) return;
    // const currentTime = new Date(Date.now());

    // pendingArray.forEach(async (message) => {
    //   if (message.postTime.getTime() <= currentTime.getTime()) {
    //     console.log(
    //       'Attempting to post message from PENDING with ID: ',
    //       message.messageID
    //     );
    //     const guildSettings = await findGuild(message.guildID);
    //     await postFood(message.messageID, this.client, guildSettings);
    //   }
    // });
  }
}

module.exports = IntervalCommand;
