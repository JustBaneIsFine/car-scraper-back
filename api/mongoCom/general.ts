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
    collection: 'Users' | 'UsersCars' | 'Sessions';
    searchType: 'username' | 'Id';
    searchValue: string;
    data: any;
    searchType2?: string;
    searchValue2?: string;
    setType?: 'post' | 'favorite';
  }
) {
  const filter = { [data.searchType]: data.searchValue };
  const setData = { $set: data.data };

  if (data.setType === 'post') {
    setData.$set = { 'posts.$': data.data };
  } else if (data.setType === 'favorite') {
    setData.$set = { 'favorites.$': data.data };
  }

  if (data.searchType2 && data.searchValue2 && data.setType) {
    filter[data.searchType2] = data.searchValue2;
  }

  const item = await client
    .db(database)
    .collection(data.collection)
    .updateOne(filter, setData);

  return item;
}
export async function updateDocument(data: {
  collection: 'Users' | 'UsersCars' | 'Sessions';
  searchType: 'username' | 'Id' | 'posts.Id' | 'favorites.Id';
  searchValue: string;
  data: any;
  searchType2?: string;
  searchValue2?: string;
  setType?: 'post' | 'favorite';
}) {
  const result = await mainCommFunc(updateDocumentFunc, data);
  return result;
}
// -multiple documents
async function updateDocumentsFunc(
  client: MongoClient,
  data: {
    collection: 'Users' | 'UsersCars' | 'Sessions';
    searchType: 'username' | 'Id';
    searchValue: string;
    data: any;
    searchType2?: string;
    searchValue2?: string;
    setType?: 'post' | 'favorite';
  }
) {
  const filter = { [data.searchType]: data.searchValue };
  const setData = { $set: data.data };

  if (data.setType === 'post') {
    setData.$set = { 'posts.$': data.data };
  } else if (data.setType === 'favorite') {
    setData.$set = { 'favorites.$': data.data };
  }

  if (data.searchType2 && data.searchValue2 && data.setType) {
    filter[data.searchType2] = data.searchValue2;
  }

  const item = await client
    .db(database)
    .collection(data.collection)
    .updateMany(filter, setData);

  return item;
}
export async function updateDocuments(data: {
  collection: 'Users' | 'UsersCars' | 'Sessions';
  searchType: 'username' | 'Id' | 'posts.Id' | 'favorites.Id';
  searchValue: string;
  data: any;
  searchType2?: string;
  searchValue2?: string;
  setType?: 'post' | 'favorite';
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
  // this function adds a whole object to an array
  // it takes a CarObject and pushes it to the posts or favorites fields
  const filter = { [data.searchType]: data.searchValue };
  let setData;
  if (data.setType === 'post') {
    setData = { $push: { 'posts.$': data.data } };
  } else {
    setData = { $push: { 'favorites.$': data.data } };
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
  setType?: 'post' | 'favorite';
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
  const deleteValue = data.deleteKey === 'post' ? 'posts.$' : 'favorites.$';

  const item = await client
    .db(database)
    .collection(data.collection)
    .updateOne(
      {
        [data.searchType]: data.searchValue,
        [deleteKey]: data.deleteValue,
      },
      { $pull: deleteValue }
    );

  if (!item.modifiedCount) return false;
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
  const deleteValue = data.deleteKey === 'post' ? 'posts.$' : 'favorites.$';

  const item = await client
    .db(database)
    .collection(data.collection)
    .updateOne(
      {
        [data.searchType]: data.searchValue,
        [deleteKey]: data.deleteValue,
      },
      { $pull: deleteValue }
    );

  if (!item.modifiedCount) return false;
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
//
//
//
//
//
//
//
//
// async function createUserComm(
//   client: MongoClient,
//   data: UserBasic
// ): Promise<ObjectId | false> {
//   const result = await client.db(database).collection(userColl).insertOne(data);
//   if (!result) {
//     return false;
//   }
//   return result.insertedId;
// }

// async function findUserComm(
//   client: MongoClient,
//   id: string
// ): Promise<false | UserUnsafeFull> {
//   const item = await client
//     .db(database)
//     .collection(userColl)
//     .findOne({ _id: id });
//   if (!item) {
//     return false;
//   }

//   const userObject: UserUnsafeFull = {
//     username: item.username,
//     password: item.password,
//     email: item.email,
//     joinDate: item.joinDate,
//     favorites: item.favorites,
//     posts: item.posts,
//     userImageUrl: item.userImageUrl,
//   };
//   return userObject;
// }

// // async function createSessionComm(
// //   client: MongoClient,
// //   id: string
// // ): Promise<false | ObjectId> {
// //   const result = await client
// //     .db(database)
// //     .collection('Sessions')
// //     .insertOne({ sessionId: id });
// //   if (!result) {
// //     return false;
// //   }
// //   return result.insertedId;
// // }

// async function deleteSessionComm(client: MongoClient, id: string) {
//   const deletion = await client
//     .db(database)
//     .collection('Session')
//     .deleteOne({ _id: id });
//   if (deletion.acknowledged) {
//     return true;
//   }
//   return false;
// }

// async function deleteUserComm(client: MongoClient, user: string) {
//   const deletion = await client
//     .db(database)
//     .collection(userColl)
//     .deleteOne({ username: user });
//   if (deletion.acknowledged) {
//     return true;
//   }
//   return false;
// }

// async function findSessionComm(
//   client: MongoClient,
//   id: string
// ): Promise<false | UserSafeFull> {
//   const item = await client
//     .db(database)
//     .collection('Sessions')
//     .findOne({ _id: id });
//   if (!item) {
//     return false;
//   }
//   const userObject: UserSafeFull = {
//     username: item.username,
//     email: item.email,
//     joinDate: item.joinDate,
//     favorites: item.favorites,
//     posts: item.posts,
//     userImageUrl: item.userImageUrl,
//   };
//   return userObject;
// }

// async function findUserByNameComm(
//   client: MongoClient,
//   user: string
// ): Promise<false | UserUnsafeFull> {
//   const item = await client
//     .db(database)
//     .collection(userColl)
//     .findOne({ username: user });
//   if (!item) {
//     return false;
//   }

//   const userObject: UserUnsafeFull = {
//     username: item.username,
//     password: item.password,
//     email: item.email,
//     joinDate: item.joinDate,
//     favorites: item.favorites,
//     posts: item.posts,
//     userImageUrl: item.userImageUrl,
//   };

//   return userObject;
// }

// async function updateDocumentComm(client: MongoClient, data: DocUpdateData) {
//   const item = await client
//     .db(database)
//     .collection(data.collection)
//     .updateOne(
//       {
//         [data.documentToChange.keyType]: data.documentToChange.keySearchValue,
//       },
//       {
//         $set: data.dataToChange,
//       }
//     );
//   console.log('updated: result_____', item);
//   console.log(
//     'sent request to mongo:____',
//     {
//       [data.documentToChange.keyType]: data.documentToChange.keySearchValue,
//     },
//     {
//       $set: data.dataToChange,
//     }
//   );

//   return item;
// }
//  const filter = { "mainKey.id": mainKeyId };
// const update = { $set: { "mainKey.$": newObject } };
// async function updateMultipleDocumentsComm(
//   client: MongoClient,
//   data: DocUpdateData
// ) {
//   const item = await client
//     .db(database)
//     .collection(data.collection)
//     .updateMany(
//       {
//         [data.documentToChange.keyType]: data.documentToChange.keySearchValue,
//       },
//       {
//         $set: data.dataToChange,
//       }
//     );
//   console.log(item, 'updated: result');

//   return item;
// }

// async function addToFavoritesComm(
//   client: MongoClient,
//   data: { user: string; data: CarObject }
// ) {
//   const item = await client
//     .db(database)
//     .collection(userColl)
//     .updateOne({ username: data.user }, { $push: { favorites: data.data } });
//   console.log('result from update', item);
//   if (item && item.modifiedCount) {
//     return true;
//   }
//   return false;
// }

// async function addToPostsCollComm(
//   client: MongoClient,
//   data: { user: string; data: CarObject }
// ) {
//   const item = await client.db(database).collection(CarsColl).insertOne(data);
//   console.log('result from update', item);
//   if (item.insertedId) {
//     return true;
//   }
//   return false;
// }

// async function deleteFromUserPostsComm(
//   client: MongoClient,
//   data: { user: string; dataId: string }
// ) {
//   const item = await client
//     .db(database)
//     .collection(userColl)
//     .updateOne(
//       { username: data.user },
//       {
//         $pull: {
//           posts: {
//             Id: data.dataId,
//           },
//         },
//       }
//     );
//   console.log(item);
//   if (item && item.modifiedCount) {
//     return true;
//   }
//   return false;
// }

// async function deleteFromPostsCollComm(client: MongoClient, dataId: string) {
//   const item = await client.db(database).collection(CarsColl).updateOne(
//     { Id: dataId },
//     {
//       $pull: {},
//     }
//   );
//   console.log(item);
//   if (item && item.modifiedCount) {
//     return true;
//   }
//   return false;
// }

// async function addToUserPostsComm(
//   client: MongoClient,
//   data: { user: string; data: CarObject }
// ) {
//   const item = await client
//     .db(database)
//     .collection(userColl)
//     .updateOne({ username: data.user }, { $push: { posts: data.data } });
//   console.log('result from update', item);
//   if (item && item.modifiedCount) {
//     return true;
//   }
//   return false;
// }

// async function deleteFromFavoritesComm(
//   client: MongoClient,
//   data: { user: string; dataId: string }
// ) {
//   const item = await client
//     .db(database)
//     .collection(userColl)
//     .updateOne(
//       { username: data.user },
//       {
//         $pull: {
//           favorites: {
//             Id: data.dataId,
//           },
//         },
//       }
//     );
//   console.log(item);
//   if (item && item.modifiedCount) {
//     return true;
//   }
//   return false;
// }

// export async function updateMultipleDocuments(data: DocUpdateData) {
//   const result = await mainComm(updateMultipleDocumentsComm, data);
//   if (result && result.modifiedCount) {
//     return true;
//   }
//   return false;
// }

// export async function createUser(data: UserUnsafeFull) {
//   const result = await mainComm(createUserComm, data);
//   return result;
// }

// export async function findUser(itemId: string) {
//   const result = await mainComm(findUserComm, itemId);
//   return result;
// }

// // export async function createSession(id: string) {
// //   const result = await mainComm(createSessionComm, id);
// //   return result;
// // }

// export async function findSession(id: string) {
//   const result = await mainComm(findSessionComm, id);
//   return result;
// }

// export async function findUserByNam(username: string) {
//   const result = await mainComm(findUserByNameComm, username);

//   return result;
// }

// export async function deleteSession(id: string) {
//   const result = await mainComm(deleteSessionComm, id);
//   return result;
// }

// export async function deleteUser(user: string) {
//   const result = await mainComm(deleteUserComm, user);
//   return result;
// }

// export async function addToFavorites(user: string, data: CarObject) {
//   const result = await mainComm(addToFavoritesComm, { user, data });
//   return result;
// }

// export async function deleteFromFavorites(user: string, dataId: string) {
//   const result = await mainComm(deleteFromFavoritesComm, { user, dataId });
//   return result;
// }

// export async function addToPostsColl(user: string, data: CarObject) {
//   const result = await mainComm(addToPostsCollComm, { user, data });
//   return result;
// }

// export async function addToUserPosts(user: string, data: CarObject) {
//   const result = await mainComm(addToUserPostsComm, { user, data });
//   return result;
// }

// export async function deleteFromPostsColl(user: string, dataId: string) {
//   const result = await mainComm(deleteFromPostsCollComm, { user, dataId });
//   return result;
// }

// export async function deleteFromUserPosts(user: string, dataId: string) {
//   const result = await mainComm(deleteFromUserPostsComm, { user, dataId });
//   return result;
// }

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
