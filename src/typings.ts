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
  upvotes: number;
  downvotes: number;
  userID: string;
  discordInline: string;
  username: string;
  index?: number;
  guildID: string;
  _id: ObjectID;
}
export interface pendingFood {
  messageID: string;
  guildID: string;
  postTime: Date;
}
export interface guildSettings {
  _id: ObjectID;
  prefix: string;
  guildID: string;
  submissionID: string;
  pornID: string;
  hellID: string;
}
