import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
//import mongoose from "mongoose";
import { config } from './config.dev';
import { pendingChecker } from './typings';
//import * as foodModel from "./db";
class MyClient extends AkairoClient {
  commandHandler: CommandHandler;
  listenerHandler: ListenerHandler;
  pendingChecker: pendingChecker;
  constructor() {
    super(
      {
        ownerID: config.owner,
      },
      {
        partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
        disableMentions: 'everyone',
      }
    );

    this.commandHandler = new CommandHandler(this, {
      directory: './commands/',
      prefix: config.prefix,
      commandUtil: true,
    });
    this.listenerHandler = new ListenerHandler(this, {
      directory: './listeners/',
    });

    this.commandHandler.loadAll();
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.loadAll();
  }
}

const client = new MyClient();
console.log(config.token);
client.login(config.token);
