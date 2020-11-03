import { AkairoClient } from "discord-akairo";
import { User } from "discord.js";
import { MongoClient } from "mongodb";
import { config } from "./config";
import { COLLECTIONS, DBNAME, FOODTYPE } from "./enums";
import { foodObject, pendingFood } from "./typings";

export async function insert(foodObject: foodObject) {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log("Mongo Connected");

  const foodDB = mongo.db("food");
  foodObject.upvotes -= 1;
  foodObject.downvotes -= 1;
  const collection =
    foodObject.upvotes > foodObject.downvotes
      ? foodDB.collection("foodPorn")
      : foodDB.collection("foodHell");
  await collection.insertOne(foodObject);

  console.log("Added a new foodObject to " + collection.collectionName);
  await mongo.close();
}

// Find Logic For Mongo Food DB
export async function findFood(foodType: FOODTYPE, userID?: string) {
  let foodArray: foodObject[] = [];
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log("Mongo Connected - Find Food");
  const foodDB = mongo.db(DBNAME.FOOD);
  let query = userID ? { userID: userID } : {};
  console.log("MONGO FOODTYPE", foodType);
  if (foodType == FOODTYPE.HELL || foodType === FOODTYPE.ALL) {
    console.log("TRYING TO QUERY FOODHELL");
    let foodCollection = foodDB.collection(COLLECTIONS.HELL);
    let foodCursor = foodCollection.find(query);
    foodArray = foodArray.concat(await foodCursor.toArray());
    foodArray.sort((a, b) => {
      ``;
      return b.downvotes - a.downvotes;
    });
  }

  if (foodType == FOODTYPE.PORN || foodType === FOODTYPE.ALL) {
    console.log("TRYING TO QUERY FOODPORN");
    let foodCollection = foodDB.collection(COLLECTIONS.PORN);
    let foodCursor = foodCollection.find(query);
    foodArray = foodArray.concat(await foodCursor.toArray());
    foodArray.sort((a, b) => {
      return b.upvotes - a.upvotes;
    });
  }
  foodArray.forEach((food) => {
    console.log("FOOD:", food.url);
  });
  await mongo.close();
  //if (foodArray.length === 0) return foodArray;
  foodArray.map((food, index) => {
    // Add the iterator index to the food object so that pagination embed can display it
    food.index = index;
  });
  return foodArray;
}

export async function foodExists(collectionName: COLLECTIONS, url: string) {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log("Mongo Connected - Food Exists");

  const foodDB = mongo.db("food");
  const collection = foodDB.collection(collectionName);
  const query = { url: url };
  let cursor = collection.find(query);
  let foodArr = [];
  foodArr = await cursor.toArray();
  await mongo.close();
  if (foodArr.length === 0) return false;
  console.log("FoodExist returned true:", foodArr);
  return true;
}

export async function AddUsername(
  collectionName: COLLECTIONS,
  food: foodObject
) {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log("Mongo Connected - Add Username");

  const foodDB = mongo.db("food");
  const collection = foodDB.collection(collectionName);
  const query = { _id: food._id };
  await collection.updateOne(query, { $set: { username: food.username } });
  await mongo.close();
}

export async function insertPending(messageID: string) {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log("Mongo Connected - Add Pending");
  const postTime = new Date(Date.now());
  postTime.setMinutes(postTime.getMinutes() + config.voteTimeInMinutes); // Add x amount of minutes to the postTime so we give users time to vote
  const pendingFood: pendingFood = {
    messageID: messageID,
    postTime: postTime,
  };

  const foodDB = mongo.db("food");
  const collection = foodDB.collection(COLLECTIONS.PENDING);
  await collection.insertOne(pendingFood);
  await mongo.close();
}

export async function findAllPending() {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log("Mongo Connected - Find All Pending");
  const foodDB = mongo.db("food");
  const collection = foodDB.collection(COLLECTIONS.PENDING);

  const cursor = collection.find();
  let pendingFood: pendingFood[] = await cursor.toArray();
  await mongo.close();
  return pendingFood;
}

export async function pendingDelete(messageID: string) {
  const mongo = await MongoClient.connect(config.mongo_url);
  console.log("Mongo Connected - Delete Pending");
  const foodDB = mongo.db("food");
  const collection = foodDB.collection(COLLECTIONS.PENDING);
  const query = { messageID: messageID };
  const result = await collection.deleteMany(query);
  console.log(result.deletedCount);
  await mongo.close();
}
