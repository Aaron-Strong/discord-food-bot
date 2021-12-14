interface Config {
  token: string;
  owner: string;
  mongo_url: string;
  prefix: string;
  admins: string[];
  voteTimeInMinutes: number;
  azureBlob: {
    connectionString: string;
    containerName: string;
  };
}

export const config: Config = {
  token: process.env.discord_token, // discord bot token
  owner: '162908463561834496', // bot owner
  mongo_url: process.env.mongo_url, // mongoDB connection url
  prefix: process.env.prefix || '.', // command prefix
  admins: ['162908463561834496', '166965009186816001', '210531463932674050'], // server admins account IDs
  voteTimeInMinutes: 60 * 6, // 6 hours
  azureBlob: {
    connectionString: process.env.azureBlobConnectionString,
    containerName: process.env.azureBlobContainerName,
  },
};
