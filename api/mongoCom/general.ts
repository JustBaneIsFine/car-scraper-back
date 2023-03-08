import { MongoClient, ObjectId } from 'mongodb';
import {
  DocUpdateData,
  UserBasic,
  UserSafeFull,
  UserUnsafeFull,
} from '../interfaces/general';
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
  data: UserBasic
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
): Promise<false | UserUnsafeFull> {
  const item = await client
    .db(database)
    .collection(userCollection)
    .findOne({ _id: id });
  if (!item) {
    return false;
  }

  const userObject: UserUnsafeFull = {
    username: item.username,
    password: item.password,
    email: item.email,
    joinDate: item.joinDate,
    favorites: item.favorites,
    posts: item.posts,
    userImageUrl: item.userImageUrl,
  };
  return userObject;
}

// async function createSessionComm(
//   client: MongoClient,
//   id: string
// ): Promise<false | ObjectId> {
//   const result = await client
//     .db(database)
//     .collection('Sessions')
//     .insertOne({ sessionId: id });
//   if (!result) {
//     return false;
//   }
//   return result.insertedId;
// }

async function deleteSessionComm(client: MongoClient, id: string) {
  const deletion = await client
    .db(database)
    .collection('Session')
    .deleteOne({ _id: id });
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
): Promise<false | UserSafeFull> {
  const item = await client
    .db(database)
    .collection('Sessions')
    .findOne({ _id: id });
  if (!item) {
    return false;
  }
  const userObject: UserSafeFull = {
    username: item.username,
    email: item.email,
    joinDate: item.joinDate,
    favorites: item.favorites,
    posts: item.posts,
    userImageUrl: item.userImageUrl,
  };
  return userObject;
}

async function findUserByNameComm(
  client: MongoClient,
  user: string
): Promise<false | UserUnsafeFull> {
  const item = await client
    .db(database)
    .collection(userCollection)
    .findOne({ username: user });
  if (!item) {
    return false;
  }

  const userObject: UserUnsafeFull = {
    username: item.username,
    password: item.password,
    email: item.email,
    joinDate: item.joinDate,
    favorites: item.favorites,
    posts: item.posts,
    userImageUrl: item.userImageUrl,
  };

  return userObject;
}

async function updateDocumentComm(client: MongoClient, data: DocUpdateData) {
  const item = await client
    .db(database)
    .collection(data.collection)
    .updateOne(
      {
        [data.documentToChange.keyType]: data.documentToChange.keySearchValue,
      },
      {
        $set: {
          [data.dataToChange.dataType]: data.dataToChange.newData,
        },
      }
    );
  console.log('updated: result_____', item);
  console.log(
    'sent request to mongo:____',
    {
      [data.documentToChange.keyType]: data.documentToChange.keySearchValue,
    },
    {
      set: {
        [data.dataToChange.dataType]: data.dataToChange.newData,
      },
    }
  );

  return item;
}

async function updateMultipleDocumentsComm(
  client: MongoClient,
  data: DocUpdateData
) {
  const item = await client
    .db(database)
    .collection(data.collection)
    .updateMany(
      {
        [data.documentToChange.keyType]: data.documentToChange.keySearchValue,
      },
      {
        $set: {
          [data.dataToChange.dataType]: data.dataToChange.newData,
        },
      }
    );
  console.log(item, 'updated: result');

  return item;
}

export async function updateDocument(data: DocUpdateData) {
  const result = await mainComm(updateDocumentComm, data);
  if (result && result.modifiedCount) {
    return true;
  }
  return false;
}

export async function updateMultipleDocuments(data: DocUpdateData) {
  const result = await mainComm(updateMultipleDocumentsComm, data);
  if (result && result.modifiedCount) {
    return true;
  }
  return false;
}

export async function createUser(data: UserUnsafeFull) {
  const result = await mainComm(createUserComm, data);
  return result;
}

export async function findUser(itemId: string) {
  const result = await mainComm(findUserComm, itemId);
  return result;
}

// export async function createSession(id: string) {
//   const result = await mainComm(createSessionComm, id);
//   return result;
// }

export async function findSession(id: string) {
  const result = await mainComm(findSessionComm, id);
  return result;
}

export async function findUserByName(username: string) {
  const result = await mainComm(findUserByNameComm, username);

  return result;
}

export async function deleteSession(id: string) {
  const result = await mainComm(deleteSessionComm, id);
  return result;
}

export async function deleteUser(user: string) {
  const result = await mainComm(deleteUserComm, user);
  return result;
}
