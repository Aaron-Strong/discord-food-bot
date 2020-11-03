import { Command } from "discord-akairo";
import { Message } from "discord.js";

class IntervalCommand extends Command {
  constructor() {
    super("interval", {
      aliases: ["interval"],
      category: "util",
      description: {
        content: "Displays the time till food_submissions is refreshed",
        usage: "",
        example: ["interval"],
      },
    });
  }

  async exec(message: Message) {
    let intervalTimerInMinutes = Math.round(
      this.client.pendingChecker.next() / 1000 / 60
    );
    console.log(intervalTimerInMinutes);
    return message.util.reply(
      `Next refresh in ${intervalTimerInMinutes} minutes!`
    );
  }
}

module.exports = IntervalCommand;
