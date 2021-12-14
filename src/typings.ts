import { Snowflake, User } from 'discord.js';
import { ObjectID } from 'mongodb';

declare module 'discord-akairo' {
  interface AkairoClient {
    commandHandler: CommandHandler;
    listenerHandler: ListenerHandler;
    inhibitorHandler: InhibitorHandler;
    pendingChecker: pendingChecker; // Figure out wtf this even is to typescript
  }
}
export interface pendingChecker {
  next(): number;
  exec(): void;
  stop(): void;
  start(): void;
}
export interface foodObject {
  url: string;
  averageVote: number;
  userID: string;
  discordInline: string;
  username: string;
  index?: number;
  guildID: string;
  _id: ObjectID;
}
export interface vote {
  user: Snowflake;
  vote: number;
}
export interface pendingFood {
  messageID: string;
  guildID: string;
  postTime: Date;
  votes: vote[];
}
export interface guildSettings {
  _id: ObjectID;
  prefix: string;
  webhookID: string;
  webhookToken: string;
  guildID: string;
  submissionID: string;
  pornID: string;
  hellID: string;
}
