import { AkairoClient } from 'discord-akairo';
import { Snowflake, User } from 'discord.js';
import { MongoClient } from 'mongodb';
import { config } from './config';
import { COLLECTIONS, DBNAME, FOODTYPE } from './enums';
import { foodObject, pendingFood, guildSettings, vote } from './typings';

export async function insert(foodObject: foodObject) {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log('Mongo Connected');

  const foodDB = mongo.db('food');
  const collection =
    foodObject.averageVote >= 3.5
      ? foodDB.collection('foodPorn')
      : foodDB.collection('foodHell');
  await collection.insertOne(foodObject);

  console.log('Added a new foodObject to ' + collection.collectionName);
  await mongo.close();
}

// // Find Logic For Mongo Food DB
// export async function findFood(
//   foodType: FOODTYPE,
//   guildID: string,
//   userID?: string
// ) {
//   let foodArray: foodObject[] = [];
//   const mongo = await MongoClient.connect(config.mongo_url);
//   console.log('Mongo Connected - Find Food');
//   const foodDB = mongo.db(DBNAME.FOOD);
//   let query = userID
//     ? { userID: userID, guildID: guildID }
//     : { guildID: guildID };
//   console.log('MONGO FOODTYPE', foodType);
//   if (foodType == FOODTYPE.HELL || foodType === FOODTYPE.ALL) {
//     console.log('TRYING TO QUERY FOODHELL');
//     let foodCollection = foodDB.collection(COLLECTIONS.HELL);
//     let foodCursor = foodCollection.find(query);
//     foodArray = foodArray.concat(await foodCursor.toArray());
//     foodArray.sort((a, b) => {
//       return b.downvotes - a.downvotes;
//     });
//   }

//   if (foodType == FOODTYPE.PORN || foodType === FOODTYPE.ALL) {
//     console.log('TRYING TO QUERY FOODPORN');
//     let foodCollection = foodDB.collection(COLLECTIONS.PORN);
//     let foodCursor = foodCollection.find(query);
//     foodArray = foodArray.concat(await foodCursor.toArray());
//     foodArray.sort((a, b) => {
//       return b.upvotes - a.upvotes;
//     });
//   }
//   foodArray.forEach((food) => {
//     console.log('FOOD:', food.url);
//   });
//   await mongo.close();
//   //if (foodArray.length === 0) return foodArray;
//   foodArray.map((food, index) => {
//     // Add the iterator index to the food object so that pagination embed can display it
//     food.index = index;
//   });
//   return foodArray;
// }

export async function foodExists(collectionName: COLLECTIONS, url: string) {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log('Mongo Connected - Food Exists');

  const foodDB = mongo.db('food');
  const collection = foodDB.collection(collectionName);
  const query = { url: url };
  let cursor = collection.find(query);
  let foodArr = [];
  foodArr = await cursor.toArray();
  await mongo.close();
  if (foodArr.length === 0) return false;
  console.log('FoodExist returned true:', foodArr);
  return true;
}

export async function AddUsername(
  collectionName: COLLECTIONS,
  food: foodObject
) {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log('Mongo Connected - Add Username');

  const foodDB = mongo.db('food');
  const collection = foodDB.collection(collectionName);
  const query = { _id: food._id };
  await collection.updateOne(query, { $set: { username: food.username } });
  await mongo.close();
}

export async function insertPending(messageID: string, guildID: string) {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log('Mongo Connected - Add Pending');
  const postTime = new Date(Date.now());
  postTime.setMinutes(postTime.getMinutes() + config.voteTimeInMinutes); // Add x amount of minutes to the postTime so we give users time to vote
  const pendingFood: pendingFood = {
    messageID: messageID,
    postTime: postTime,
    guildID: guildID,
    votes: []
  };
  const foodDB = mongo.db('food');
  const collection = foodDB.collection(COLLECTIONS.PENDING);
  await collection.insertOne(pendingFood);
  await mongo.close();
}

export async function findAllPending() {
  console.log('Mongo Connected - Find All Pending');
  const mongo = await MongoClient.connect(config.mongo_url);
  const foodDB = mongo.db('food');
  const collection = foodDB.collection(COLLECTIONS.PENDING);

  const cursor = collection.find();
  let pendingFood: pendingFood[] = await cursor.toArray();
  await mongo.close();
  return pendingFood;
}

export async function pendingDelete(messageID: string) {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log('Mongo Connected - Delete Pending');
  const foodDB = mongo.db('food');
  const collection = foodDB.collection(COLLECTIONS.PENDING);
  const query = { messageID: messageID };
  const result = await collection.deleteMany(query);
  console.log(`Deleted ${result.deletedCount} posts from pending collection`);
  await mongo.close();
}

export async function pendingVoterPush(messageID: Snowflake, vote: vote) {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log('Mongo Connected - Update Pending');
  const foodDB = mongo.db('food');
  const collection = foodDB.collection(COLLECTIONS.PENDING);
  const query = { messageID: messageID };
  const push = { $push: { votes: vote} };
  const result = await collection.updateOne(query, push);
  console.log(
    `Added vote ${vote.vote} from ${vote.user} to ${messageID}'s voters array`
  );
  await mongo.close();
}

export async function getPendingVoters(messageID: Snowflake) {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log('Mongo Connected - Get Pending Voters');
  const foodDB = mongo.db('food');
  const collection = foodDB.collection(COLLECTIONS.PENDING);
  const query = { messageID: messageID };
  const cursor = collection.find(query);
  const pendingFood: pendingFood[] = await cursor.toArray();
  await mongo.close();
  return pendingFood[0].votes;
}

export async function guildInit(guildSettings: guildSettings) {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log('Mongo Connected - Init Guild');
  const foodDB = mongo.db('food');
  const collection = foodDB.collection(COLLECTIONS.GUILDS);
  await collection.insertOne(guildSettings);
  console.log(`Added ${guildSettings.guildID} to the guild db`);
  await mongo.close();
}

export async function findGuild(guildID: string): Promise<guildSettings> {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log('Mongo Connected - Finding Guild');
  const foodDB = mongo.db('food');
  const collection = foodDB.collection(COLLECTIONS.GUILDS);
  const query = { guildID: guildID };
  const guild: guildSettings = await collection.findOne(query);
  await mongo.close();

  return guild;
}
