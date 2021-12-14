import { Command } from "discord-akairo";
import { Message } from "discord.js";

class PingCommand extends Command {
  constructor() {
    super("ping", {
      aliases: ["ping", "hello"],
      category: "util",
      description: {
        content: "Pings the server, duh?",
        usage: "",
        example: ["ping"],
      },
    });
  }

  async exec(message: Message) {
    const sent = await message.util.reply("Pong!");
    const timeone = sent.editedAt || sent.createdAt;
    const timetwo = message.editedAt || message.createdAt;
    const timeDiff = timeone.valueOf() - timetwo.valueOf();
    return message.util.reply(
      `\nPong!
      \n🔂 **RTT**: ${timeDiff} ms
      \n💟 **Heartbeat**: ${Math.round(this.client.ws.ping)} ms`,
    );
  }
}

module.exports = PingCommand;
