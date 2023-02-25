import { MongoClient, ObjectId } from 'mongodb';
import {
  SessionUserDB,
  UserInterface,
  UserInterfaceDB,
} from '../interfaces/user';
import getURI from './uri';

const database = 'Car-Scraper';
const userCollection = 'Users';
const uri = getURI();

async function mainComm<ArgType, ReturnType>(
  funcToRun: (arg1: MongoClient, arg2: ArgType) => ReturnType,
  data?: any
): Promise<ReturnType | false> {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const result = await funcToRun(client, data);
    return result;
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
  return false;
}

async function createUserComm(
  client: MongoClient,
  data: UserInterface
): Promise<ObjectId | false> {
  const result = await client
    .db(database)
    .collection(userCollection)
    .insertOne(data);
  if (!result) {
    return false;
  }
  return result.insertedId;
}

async function findUserComm(
  client: MongoClient,
  id: string
): Promise<false | UserInterfaceDB> {
  const item = await client
    .db(database)
    .collection(userCollection)
    .findOne({ _id: id });
  if (!item) {
    return false;
  }
  return item as UserInterfaceDB;
}

async function createSessionComm(
  client: MongoClient,
  id: string
): Promise<false | ObjectId> {
  const result = await client
    .db(database)
    .collection('Sessions')
    .insertOne({ sessionId: id });
  if (!result) {
    return false;
  }
  return result.insertedId;
}

async function deleteSessionComm(client: MongoClient, user: string) {
  const deletion = await client
    .db(database)
    .collection('Session')
    .deleteOne({ username: user });
  if (deletion.acknowledged) {
    return true;
  }
  return false;
}

async function deleteUserComm(client: MongoClient, user: string) {
  const deletion = await client
    .db(database)
    .collection(userCollection)
    .deleteOne({ username: user });
  if (deletion.acknowledged) {
    return true;
  }
  return false;
}

async function findSessionComm(
  client: MongoClient,
  id: string
): Promise<false | SessionUserDB> {
  const item = await client
    .db(database)
    .collection('Sessions')
    .findOne({ sessionId: id });
  if (!item) {
    return false;
  }
  return item as SessionUserDB;
}

async function findUserByNameComm(
  client: MongoClient,
  user: string
): Promise<false | UserInterfaceDB> {
  const item = await client
    .db(database)
    .collection(userCollection)
    .findOne({ username: user });
  if (!item) {
    return false;
  }

  return item as UserInterfaceDB;
}
export async function createUser(data: UserInterface) {
  const result = await mainComm(createUserComm, data);
  return result;
}

export async function findUser(itemId: string) {
  const result = await mainComm(findUserComm, itemId);
  return result;
}

export async function createSession(id: string) {
  const result = await mainComm(createSessionComm, id);
  return result;
}

export async function findSession(id: string) {
  const result = await mainComm(findSessionComm, id);
  return result;
}

export async function findUserByName(username: string) {
  const result = await mainComm(findUserByNameComm, username);

  return result;
}

export async function deleteSession(user: string) {
  const result = await mainComm(deleteSessionComm, user);
  return result;
}

export async function deleteUser(user: string) {
  const result = await mainComm(deleteUserComm, user);
  return result;
}
