import { ObjectID } from "mongodb";
import { nextTick } from "process";
import { doSomething } from "./helpers";

declare module "discord-akairo" {
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
  _id: ObjectID;
}
export interface pendingFood {
  messageID: string;
  postTime: Date;
}
