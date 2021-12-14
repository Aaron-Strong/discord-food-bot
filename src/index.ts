import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
//import mongoose from "mongoose";
import { config } from './config';
import { pendingChecker } from './typings';
import * as http from 'http';
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
        intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'GUILD_BANS', 'GUILD_EMOJIS_AND_STICKERS','GUILD_WEBHOOKS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING' ],
        partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
        allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
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



const server = http.createServer((request, response) => {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("Hello World!");
});

const port = process.env.PORT || 1337;
server.listen(port);

console.log("Ping server running at http://localhost:%d", port);