import { MongoClient, WithId } from 'mongodb';
import { CarObject, UserUnsafeFull } from '../interfaces/general';
import getURI from './uri';

const database = 'Car-Scraper';
const userColl = 'Users';
const CarsColl = 'UsersCars';
const uri = getURI();

// Main communication Function
async function mainCommFunc<ReturnType, ArgType>(
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

// Create functions
async function createNewDocument(
  client: MongoClient,
  data: { collection: 'Users' | 'UsersCars'; data: CarObject | UserUnsafeFull }
) {
  const result = await client
    .db(database)
    .collection(data.collection)
    .insertOne(data.data);
  if (!result) {
    return false;
  }
  return result.insertedId;
}
export async function createNewUser(data: UserUnsafeFull) {
  const newData = { collection: userColl, data };
  const result = await mainCommFunc(createNewDocument, newData);
  return result;
}
export async function createNewCarPost(data: CarObject) {
  const newData = { collection: CarsColl, data };
  const result = await mainCommFunc(createNewDocument, newData);
  return result;
}

// Read/Find functions
async function findDocument(
  client: MongoClient,
  data:
    | {
        collection: 'Users' | 'Sessions';
        searchType: 'username' | 'posts.id' | 'favorites.id';
        searchValue: string;
      }
    | {
        collection: 'UsersCars';
        searchType: 'Id';
        searchValue: string;
      }
) {
  if (data.collection === 'Users' || data.collection === 'Sessions') {
    const item = await client
      .db(database)
      .collection<UserUnsafeFull>(data.collection)
      .findOne({ [data.searchType]: data.searchValue });

    if (!item) return false;
    const object = extractUserObject(item);
    return object;
  }

  const item = await client
    .db(database)
    .collection<CarObject>(data.collection)
    .findOne({ [data.searchType]: data.searchValue });

  if (!item) return false;
  const object = extractCarObject(item);
  return object;
}

export async function findUserByName(
  username: string
): Promise<false | UserUnsafeFull> {
  const result = (await mainCommFunc(findDocument, {
    collection: 'Users',
    searchType: 'username',
    searchValue: username,
  })) as UserUnsafeFull | false;

  return result;
}
export async function findSessionByUsername(
  client: MongoClient,
  username: string
) {
  const result = await mainCommFunc(findDocument, {
    collection: 'Sessions',
    searchType: 'session.user.username',
    searchValue: username,
  });
  return result;
}
export async function findCarPost(
  client: MongoClient,
  id: string,
  type: 'Id' | 'PostedBy'
) {
  const result = await mainCommFunc(findDocument, {
    collection: CarsColl,
    searchType: type,
    searchValue: id,
  });
  return result;
}

// Update functions
// -single document
async function updateDocumentFunc(
  client: MongoClient,
  data: {
    collection: 'Users' | 'UsersCars';
    searchType: 'username' | 'Id';
    searchValue: string;
    data: any;
  }
) {
  const filter = { [data.searchType]: data.searchValue };
  const setData = { $set: data.data };
  console.log('filter and set data for single', filter, setData);
  const item = await client
    .db(database)
    .collection(data.collection)
    .updateOne(filter, setData);

  return item;
}
export async function updateDocument(data: {
  collection: 'Users' | 'UsersCars';
  searchType: 'username' | 'Id';
  searchValue: string;
  data: any;
}) {
  const result = await mainCommFunc(updateDocumentFunc, data);
  return result;
}
// -multiple documents
async function updateDocumentsFunc(
  client: MongoClient,
  data: {
    collection: 'Users' | 'Sessions';
    searchType: 'post' | 'favorite';
    searchValue: string;
    data: any;
  }
) {
  const searchType = data.searchType === 'post' ? 'posts.Id' : 'favorites.Id';
  const filter = { [searchType]: data.searchValue };
  const setData = convertToMongoSetData(data.searchType, data.data);

  const item = await client
    .db(database)
    .collection(data.collection)
    .updateMany(filter, setData);

  return item;
}
export async function updateDocuments(data: {
  collection: 'Users' | 'Sessions';
  searchType: 'post' | 'favorite';
  searchValue: string;
  data: any;
}) {
  const result = await mainCommFunc(updateDocumentsFunc, data);
  return result;
}

// - add object to array
async function addObjectToArrayFunc(
  client: MongoClient,
  data: {
    collection: 'Users' | 'Sessions';
    searchType: 'username' | 'session.user.username';
    searchValue: string;
    data: any;
    setType: 'post' | 'favorites';
  }
) {
  const filter = { [data.searchType]: data.searchValue };
  let setData;
  if (data.setType === 'post') {
    setData = { $push: { posts: data.data } };
  } else {
    setData = { $push: { favorites: data.data } };
  }

  const item = await client
    .db(database)
    .collection(data.collection)
    .updateMany(filter, setData);

  return item;
}

export async function addObjectToDocument(data: {
  collection: 'Users' | 'UsersCars' | 'Sessions';
  searchType: 'username' | 'Id';
  searchValue: string;
  data: any;
  searchType2?: string;
  searchValue2?: string;
  setType: 'post' | 'favorite';
}) {
  const result = await mainCommFunc(addObjectToArrayFunc, data);
  return result;
}

// Delete
async function deleteDocumentFunc(
  client: MongoClient,
  data: {
    collection: 'Users' | 'UsersCars' | 'Sessions';
    searchType: 'username' | 'Id';
    searchValue: string;
    searchType2?: 'favorites.Id' | 'posts.Id';
    searchValue2?: string;
    deleteType?: 'post' | 'favorite';
  }
) {
  const filter = { [data.searchType]: data.searchValue };
  if (data.searchType2 && data.searchValue2) {
    filter[data.searchType2] = data.searchValue2;
  }

  const item = await client
    .db(database)
    .collection(data.collection)
    .deleteOne(filter);

  if (!item.deletedCount) return false;
  return true;
}
async function deleteMultipleDocumentsFunc(
  client: MongoClient,
  data: {
    collection: 'Users' | 'UsersCars' | 'Sessions';
    searchType: 'username' | 'Id';
    searchValue: string;
    searchType2?: 'favorites.Id' | 'posts.Id';
    searchValue2?: string;
    deleteType?: 'post' | 'favorite';
  }
) {
  const item = await client
    .db(database)
    .collection(data.collection)
    .deleteMany({ [data.searchType]: data.searchValue });

  if (!item.deletedCount) return false;
  return true;
}
export async function deleteDocument(data: {
  collection: 'Users' | 'UsersCars' | 'Sessions';
  searchType: 'username' | 'Id';
  searchValue: string;
  searchType2?: 'favorites.Id' | 'posts.Id';
  searchValue2?: string;
  deleteType?: 'post' | 'favorite';
}) {
  const result = await mainCommFunc(deleteDocumentFunc, data);
  return result;
}

export async function deleteMultipleDocuments(data: {
  collection: 'Users' | 'UsersCars' | 'Sessions';
  searchType: 'username' | 'Id';
  searchValue: string;
  searchType2?: 'favorites.Id' | 'posts.Id';
  searchValue2?: string;
  deleteType?: 'post' | 'favorite';
}) {
  const result = await mainCommFunc(deleteMultipleDocumentsFunc, data);
  return result;
}
// -delete from array
async function deleteFromArrayFunc(
  client: MongoClient,
  data: {
    collection: 'Users' | 'UsersCars' | 'Sessions';
    searchType: 'username' | 'session.user.username';
    searchValue: string;
    deleteKey: 'post' | 'favorite';
    deleteValue: string;
  }
) {
  const deleteKey = data.deleteKey === 'post' ? 'posts.Id' : 'favorites.Id';
  const deleteThis =
    data.deleteKey === 'post'
      ? { posts: { Id: data.deleteValue } }
      : { favorites: { Id: data.deleteValue } };

  const item = await client
    .db(database)
    .collection(data.collection)
    .updateOne(
      {
        [data.searchType]: data.searchValue,
        [deleteKey]: data.deleteValue,
      },
      { $pull: deleteThis }
    );

  if (!item.modifiedCount && item.matchedCount) return false;
  return true;
}
async function deleteFromArrayMultipleFunc(
  client: MongoClient,
  data: {
    collection: 'Users' | 'UsersCars' | 'Sessions';
    searchType: 'username' | 'session.user.username';
    searchValue: string;
    deleteKey: 'post' | 'favorite';
    deleteValue: string;
  }
) {
  const deleteKey = data.deleteKey === 'post' ? 'posts.Id' : 'favorites.Id';
  const deleteThis =
    data.deleteKey === 'post'
      ? { posts: { Id: data.deleteValue } }
      : { favorites: { Id: data.deleteValue } };
  const item = await client
    .db(database)
    .collection(data.collection)
    .updateOne(
      {
        [deleteKey]: data.deleteValue,
      },
      { $pull: deleteThis }
    );

  if (!item.modifiedCount && item.matchedCount) return false;
  return true;
}
export async function deleteFromArray(data: {
  collection: 'Users' | 'UsersCars' | 'Sessions';
  searchType: 'username' | 'session.user.username';
  searchValue: string;
  deleteKey: 'post' | 'favorite';
  deleteValue: string;
}) {
  const result = await mainCommFunc(deleteFromArrayFunc, data);
  return result;
}

export async function deleteFromArrayMultiple(data: {
  collection: 'Users' | 'UsersCars' | 'Sessions';
  searchType: 'username' | 'session.user.username';
  searchValue: string;
  deleteKey: 'post' | 'favorite';
  deleteValue: string;
}) {
  const result = await mainCommFunc(deleteFromArrayMultipleFunc, data);
  return result;
}

export function extractUserObject(data: WithId<UserUnsafeFull>) {
  const userObject: UserUnsafeFull = {
    username: data.username,
    password: data.password,
    email: data.email,
    joinDate: data.joinDate,
    favorites: data.favorites,
    posts: data.posts,
    userImageUrl: data.userImageUrl,
  };
  return userObject;
}

export function extractCarObject(data: WithId<CarObject>) {
  const carObject: CarObject = {
    CarName: data.CarName,
    CarCC: data.CarCC,
    CarFuel: data.CarFuel,
    CarKM: data.CarKM,
    CarPrice: data.CarPrice,
    CarYear: data.CarYear,
    PostedBy: data.PostedBy,
    Href: data.Href,
    ImageUrl: data.ImageUrl,
    Id: data.Id,
  };
  return carObject;
}

function convertToMongoSetData(
  type: 'post' | 'favorite' | 'user',
  someData: { [key: string]: string }
) {
  let dataType: string | object;

  if (type !== 'user') {
    dataType = type === 'post' ? 'posts.$.' : 'favorites.$.';
  } else {
    return { $set: someData };
  }

  const dataKeys: string[] = Object.keys(someData);
  const setDatax: { $set: { [key: string]: string } } = { $set: {} };

  dataKeys.forEach((key) => {
    const newKey = `${dataType}${key}`;
    setDatax.$set[newKey] = someData[key];
  });
  return setDatax;
}
