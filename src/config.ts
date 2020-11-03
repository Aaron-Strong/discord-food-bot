interface Config {
  token: string;
  owner: string;
  mongo_url: string;
  prefix: string;
  admins: string[];
  channels: {
    submissions: string;
    porn: string;
    hell: string;
    cache: string;
  };
  voteTimeInMinutes: number;
}

export const config: Config = {
  token: process.env.discord_token, // discord bot token
  owner: "162908463561834496", // bot owner
  mongo_url: process.env.mongo_url, // mongoDB connection url
  prefix: process.env.prefix || ".", // command prefix
  admins: ["162908463561834496", "166965009186816001", "210531463932674050"], // server admins account IDs
  channels: {
    submissions: "618870966168322048", // Channel to post and vote on food
    porn: "737050530882257058", // Channel to send the food who's upvotes > downvotes
    hell: "737050551304585317", // Channel to send the rest of the 'food'
    cache: "737050592962281492", // Channel to save a copy of the food image to avoid paying for image hosting. You can hide this from your users.
  },
  voteTimeInMinutes: 180,
};
