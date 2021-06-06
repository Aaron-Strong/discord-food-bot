import { AkairoClient } from 'discord-akairo';
import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { TextChannel } from 'discord.js';
import { ObjectID } from 'mongodb';
import { config } from '../config.dev';
import { findAllPending, findGuild, insert, pendingDelete } from '../db';
import { recursion } from '../Helpers/Recursion';
import { postFood } from '../Helpers/PostFood';

class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready',
    });
  }

  async exec() {
    console.log("I'm ready!");
    console.log(`Logged in as ${this.client.user.tag}!`);
    this.client.user.setActivity('Busy downvoting your crap food...');
    this.client.pendingChecker = recursion(() => pendingCheck(this.client));
  }
}

async function pendingCheck(client: AkairoClient) {
  console.log('Pending check running...');
  const pendingArray = await findAllPending();
  if (pendingArray.length === 0) return;
  const currentTime = new Date(Date.now());

  pendingArray.forEach(async (message) => {
    if (message.postTime.getTime() <= currentTime.getTime()) {
      console.log(
        'Attempting to post message from PENDING with ID: ',
        message.messageID
      );
      const guildSettings = await findGuild(message.guildID);
      await postFood(message.messageID, client, guildSettings);
    }
  });
}

module.exports = ReadyListener;
