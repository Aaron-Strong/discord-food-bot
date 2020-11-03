import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { TextChannel } from "discord.js";
import { Collection } from "discord.js";
import { ObjectID } from "mongodb";
import { config } from "../config";
import { insert } from "../db";

class MergeCommand extends Command {
  constructor() {
    super("merge", {
      aliases: ["merge"],
    });
  }
  async exec(message: Message) {
    if (!config.admins.includes(message.author.id)) return;
    await this.merge(message);
  }
  async merge(message: Message) {
    let submissionsChannel = <TextChannel>(
      message.guild.channels.cache.get(config.channels.submissions)
    );
    const foodPornChannel = <TextChannel>(
      message.guild.channels.cache.get(config.channels.porn)
    );
    const foodHellChannel = <TextChannel>(
      message.guild.channels.cache.get(config.channels.hell)
    );
    const cacheChannel = <TextChannel>(
      message.guild.channels.cache.get(config.channels.cache)
    );

    await submissionsChannel.fetch().then((fetched: TextChannel) => {
      submissionsChannel = fetched;
    });
    let messages: Collection<string, Message>;
    await submissionsChannel.messages.fetch().then((fetched) => {
      messages = fetched;
    });
    while (messages) {
      await submissionsChannel.messages.fetch().then((fetched) => {
        messages = fetched;
      });
      message = messages.first();
      if (!message) return;
      console.log("message:", message.content);
      let isImage =
        message.attachments.size != 0 ||
        message.content.includes(`https://`) ||
        message.content.includes(`http://`) ||
        message.content.includes(`www.`);

      if (message.pinned) {
        return;
      }
      if (!isImage) {
        await message.delete();
        continue;
      }
      const upvotes = message.reactions.cache
        .filter((a) => a.emoji.name == "👍🏿")
        .map((reaction) => reaction.count)[0];
      const downvotes = message.reactions.cache
        .filter((a) => a.emoji.name == "👎🏿")
        .map((reaction) => reaction.count)[0];

      let targetChannel: TextChannel;
      if (upvotes > downvotes) targetChannel = foodPornChannel;
      else targetChannel = foodHellChannel;
      let url: string;
      if (message.attachments.size != 0) {
        await cacheChannel.send(message.attachments.first());
        url = cacheChannel.lastMessage.attachments.first().url;
      } else {
        const urls = message.content.match(/\bhttps?:\/\/\S+/gi);
        url = urls[0];
      }

      console.log("URL:", url);
      let embed = {
        embed: {
          color: 1925289,
          image: {
            url: url,
          },
          author: {
            name: message.author.username,
            icon_url: message.author.avatarURL(),
          },
          fields: [
            {
              name:
                upvotes > downvotes
                  ? "🥳 Foodporn Poggers!"
                  : "💩 Shitty Food 💩",
              value: `Post received 👍🏿 x ${upvotes - 1}, 👎🏿 x ${downvotes - 1}`,
              //value: `Post received 👍🏿 x 0, 👎🏿 x 7`,
              inline: false,
            },
          ],
        },
      };

      let postedFoodMessage = await targetChannel.send(embed);
      await insert({
        url: url,
        upvotes: upvotes,
        downvotes: downvotes,
        userID: message.author.id,
        discordInline: postedFoodMessage.url,
        username: message.author.username,
        _id: new ObjectID(),
      });
      console.log("URL:", url);
      message.delete();
      await new Promise((r) => setTimeout(r, 1000));
    }
    console.log("Finished merging!");
    submissionsChannel.send("Finished merging!");
    return;
  }
}

module.exports = MergeCommand;
