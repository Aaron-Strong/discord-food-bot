import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { TextChannel } from "discord.js";
import { User } from "discord.js";
import { ObjectID } from "mongodb";
import { config } from "../config";
import { foodExists, insert } from "../db";
import { COLLECTIONS } from "../enums";
interface Args {
  foodMessage: Message;
}
class Sync extends Command {
  constructor() {
    super("sync", {
      aliases: ["sync", "upload", "sink"],
      category: "food",
      args: [
        {
          id: "foodMessage",
          type: "guildMessage",
        },
      ],
      description: {
        content:
          "Takes an old post you made and adds it to the leaderboard\n Right click the message, select 'Copy ID', and paste it with this command",
        usage: " <messageID>",
        example: ["sync 767052054769303652"],
      },
    });
  }

  async exec(message: Message, args: Args) {
    if (!args.foodMessage) {
      return await message.util.reply("Couldn't find a message with that ID");
    }
    if (
      ![config.channels.porn, config.channels.hell].includes(
        args.foodMessage.channel.id
      )
    ) {
      return await message.util.reply("Message ID wasn't from a food channel");
    }

    const foodPornChannel = <TextChannel>(
      message.guild.channels.cache.get(config.channels.porn)
    );
    const foodHellChannel = <TextChannel>(
      message.guild.channels.cache.get(config.channels.hell)
    );

    let imageURL = args.foodMessage.embeds[0].image.url;
    console.log(imageURL);
    let votes = args.foodMessage.embeds[0].fields[0].value
      .match(/^\d+|\d+\b|\d+(?=\w)/g)
      .map(function (v) {
        return +v;
      });
    let upvotes = votes[0];
    let downvotes = votes[1];
    console.log(args.foodMessage.embeds[0].fields[0].value);
    console.log(`UP: ${upvotes} DOWN: ${downvotes}`);
    const foodCollection =
      upvotes > downvotes ? COLLECTIONS.PORN : COLLECTIONS.HELL;
    let isDuplicate = await foodExists(foodCollection, imageURL);
    if (isDuplicate) return message.util.reply("Food already in database");
    await insert({
      url: imageURL,
      upvotes: upvotes,
      downvotes: downvotes,
      userID: message.author.id,
      discordInline: args.foodMessage.url,
      username: message.author.username,
      _id: new ObjectID(),
    });
    return message.util.reply("Sync Complete For Image: " + imageURL);
  }
}

module.exports = Sync;
