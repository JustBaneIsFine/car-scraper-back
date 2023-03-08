import express, { Request, Response } from 'express';
import { CustomSession, DocUpdateData } from './interfaces/general';
import {
  findUserByName,
  updateDocument,
  updateMultipleDocuments,
} from './mongoCom/general';

const updateUserRouter = express.Router();

updateUserRouter.post('/', updateHandler);

async function updateHandler(
  req: Request & { session: CustomSession } & { body: DocUpdateData },
  res: Response
) {
  if (req.session.user) {
    if (req.body.collection === 'Users') {
      const userData = await updateUserData(req.body);

      if (userData) {
        const result = await updateCurrentUserSession(req);
        if (result) {
          res.status(200);
          res.json({ success: true, error: false, user: result });
          return;
        }
        res.status(200);
        res.json({ success: false, error: 'failed to update user data' });
        return;
      }
    } else if (req.body.collection === 'UserCars') {
      const updatedAllInstances = await updatePostData(req.body);

      if (updatedAllInstances) {
        const userObject = await findUserByName(req.session.user.username);
        if (userObject) {
          const { password, ...userObjectSafe } = userObject;
          await updateCurrentUserSession(req);
          res.status(200);
          res.json({ success: true, user: userObjectSafe });
          return;
        }
      }
      res.status(200);
      res.json({ success: false, error: 'error updating post data' });
      return;
    }
    res.status(200);
    res.json({ success: false, error: 'wrong mongo collection data' });
  } else {
    res.status(200);
    res.json({ loggedIn: false, user: false });
  }
}
export default updateUserRouter;

async function updateUserData(data: DocUpdateData) {
  // takes the raw values and updates the data
  const result = await updateDocument(data);
  if (result) {
    return true;
  }
  return false;
}

async function updatePostData(data: DocUpdateData) {
  // update main post in posts collection
  const resultMain = await updateMainPostData(data);

  // update secondary posts in users posts
  if (resultMain) {
    const newData = JSON.parse(JSON.stringify(data));
    newData.collection = 'Users';
    newData.documentToChange.keyType = 'posts.Id';
    newData.dataToChange.dataType = `posts.$.${data.dataToChange.dataType}`;

    const resultSec = await updateSecondaryPostData(newData);
    if (resultSec) {
      // update secondary posts in users favorites
      newData.documentToChange.keyType = 'favorites.Id';
      newData.dataToChange.dataType = `favorites.$.${data.dataToChange.dataType}`;
      const resultFav = await updateSecondaryPostData(newData);

      if (resultFav) {
        return true;
      }
      return false;
    }
  }
  return false;
}

async function updateMainPostData(data: DocUpdateData) {
  const result = await updateDocument(data);
  if (result) {
    return true;
  }
  return false;
}

async function updateSecondaryPostData(data: DocUpdateData) {
  const result = await updateMultipleDocuments(data);
  if (result) {
    return true;
  }
  return false;
}

async function updateCurrentUserSession(
  req: Request & { session: CustomSession }
) {
  if (req.session.user) {
    const updatedUser = await findUserByName(req.session.user.username);
    if (updatedUser) {
      const { password, ...safeUserObject } = updatedUser;
      req.session.user = safeUserObject;
      return safeUserObject;
    }
    return false;
  }
  return false;
}
