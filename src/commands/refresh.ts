import { Command } from "discord-akairo";
import { Message } from "discord.js";

class IntervalCommand extends Command {
  constructor() {
    super("refresh", {
      aliases: ["refresh"],
      category: "util",
      description: {
        content:
          "Manually checks if food has been in food_submissions too long",
        usage: "",
        example: ["refresh"],
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
  }
}

module.exports = IntervalCommand;
