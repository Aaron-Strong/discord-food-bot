import { AkairoClient, Command } from "discord-akairo";
import { Message } from "discord.js";
import { config } from "../config";
import { insertPending } from "../db";
class FoodCommand extends Command {
  client: AkairoClient;

  constructor() {
    super("foodscan", {
      category: "auto",
    });
  }

  condition(message: Message) {
    if (message.channel.id !== config.channels.submissions) {
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
    return true;
  }

  async exec(message: Message) {
    await message.react("👍🏿");
    await message.react("👎🏿");

    await insertPending(message.id);
  }
}

module.exports = FoodCommand;
