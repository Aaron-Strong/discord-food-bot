import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { TextChannel } from "discord.js";
import { User } from "discord.js";
import { ObjectID } from "mongodb";
import { config } from "../config";
import { insert } from "../db";
interface Args {
  url: string;
  user: User;
  upvotes: number;
  downvotes: number;
}
class ManualCommand extends Command {
  constructor() {
    super("man", {
      aliases: ["manual", "man"],
      category: "food",
      args: [
        {
          id: "url",
          type: "string",
        },
        {
          id: "user",
          type: "user",
        },
        {
          id: "upvotes",
          type: "number",
        },
        {
          id: "downvotes",
          type: "number",
        },
      ],
      description: {
        content: "Makes a manual food post from the bot",
        usage: "<image_url> <user_to_post_as> <upvotes> <downvotes>",
        example: ["man https://i.imgur.com/oqvXUGe.png mehdi 1 9"],
      },
    });
  }

  async exec(message: Message, args: Args) {
    if (!config.admins.includes(message.author.id)) {
      return message.util.reply("yy nice try");
    }
    let embed = {
      embed: {
        color: 1925289,
        image: {
          url: args.url,
        },
        author: {
          name: args.user.username,
          icon_url: args.user.avatarURL(),
        },
        fields: [
          {
            name:
              args.upvotes > args.downvotes
                ? "🥳 Foodporn Poggers!"
                : "💩 Shitty Food 💩",
            value: `Post received 👍🏿 x ${args.upvotes}, 👎🏿 x ${args.downvotes}`,
            //value: `Post received 👍🏿 x 0, 👎🏿 x 7`,
            inline: false,
          },
        ],
      },
    };

    const foodPornChannel = <TextChannel>(
      message.guild.channels.cache.get(config.channels.porn)
    );
    const foodHellChannel = <TextChannel>(
      message.guild.channels.cache.get(config.channels.hell)
    );
    let targetChannel: TextChannel;
    if (args.upvotes > args.downvotes) targetChannel = foodPornChannel;
    else targetChannel = foodHellChannel;
    let postedFoodMessage = await targetChannel.send(embed);
    await insert({
      url: args.url,
      upvotes: args.upvotes + 1,
      downvotes: args.downvotes + 1,
      userID: args.user.id,
      discordInline: postedFoodMessage.url,
      username: args.user.username,
      _id: new ObjectID(),
    });
    console.log(args.url);
    return message.util.reply("Manually added some food");
  }
}

module.exports = ManualCommand;
