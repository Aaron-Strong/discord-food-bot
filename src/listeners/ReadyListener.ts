import { AkairoClient } from "discord-akairo";
import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import { TextChannel } from "discord.js";
import { ObjectID } from "mongodb";
import { config } from "../config";
import { findAllPending, insert, pendingDelete } from "../db";
import { doSomething } from "../helpers";

class ReadyListener extends Listener {
  constructor() {
    super("ready", {
      emitter: "client",
      event: "ready",
    });
  }

  async exec() {
    console.log("I'm ready!");
    console.log(`Logged in as ${this.client.user.tag}!`);
    this.client.user.setActivity("Busy downvoting your crap food...");
    this.client.pendingChecker = doSomething(pendingCheck);
  }
}

async function pendingCheck(client: AkairoClient) {
  console.log("Pending check running...");
  const pendingArray = await findAllPending();
  if (pendingArray.length === 0) return;
  const currentTime = new Date(Date.now());

  pendingArray.forEach(async (message) => {
    if (message.postTime.getTime() <= currentTime.getTime()) {
      console.log("Executing pending chech on ", message.messageID);
      postFood(message.messageID, client);
    }
  });
}

async function postFood(messageID: string, client: AkairoClient) {
  let FoodSubs = <TextChannel>(
    client.channels.cache.get(config.channels.submissions)
  );
  let message: Message;
  try {
    message = await FoodSubs.messages.fetch(messageID);
  } catch (error) {
    if (error.code == 10008) {
      console.error("Some twat deleted his foodpost");
      return;
    }
  }
  if (message == null) return;
  const foodPornChannel = <TextChannel>(
    message.guild.channels.cache.get(config.channels.porn)
  );
  const foodHellChannel = <TextChannel>(
    message.guild.channels.cache.get(config.channels.hell)
  );

  const cacheChannel = <TextChannel>(
    message.guild.channels.cache.get(config.channels.cache)
  );

  const upvotes = message.reactions.cache
    .filter((a) => a.emoji.name == "👍🏿")
    .map((reaction) => reaction.count)[0];
  const downvotes = message.reactions.cache
    .filter((a) => a.emoji.name == "👎🏿")
    .map((reaction) => reaction.count)[0];

  let targetChannel: TextChannel;
  if (upvotes > downvotes) targetChannel = foodPornChannel;
  else targetChannel = foodHellChannel;
  let url: string = "";
  if (message.attachments.size != 0) {
    await cacheChannel.send(message.attachments.first());
    url = cacheChannel.lastMessage.attachments.first().url;
  } else {
    const urls = message.content.match(/\bhttps?:\/\/\S+/gi);
    if (!url) {
      return;
    }
    url = urls[0];
  }

  if (url === "") {
    return;
  }
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
            upvotes > downvotes ? "🥳 Foodporn Poggers!" : "💩 Shitty Food 💩",
          value: `Post received 👍🏿 x ${upvotes - 1}, 👎🏿 x ${downvotes - 1}`,
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
  console.log(url);
  await pendingDelete(messageID);
  return await message.delete();
}

module.exports = ReadyListener;
