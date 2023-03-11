import express, { Request, Response } from 'express';
import { CustomSession, DocUpdateData } from './interfaces/general';
import { updateDocument, updateMultipleDocuments } from './mongoCom/general';
import sendJsonResponse, { updateSessionAndRespond } from './ts/responses';

const updatePostRouter = express.Router();

updatePostRouter.post('/', updatePost);

async function updatePost(
  req: Request & { session: CustomSession },
  res: Response
) {
  if (req.session.user) {
    if (req.body.dataToChange && Object.keys(req.body.dataToChange)) {
      const result = await updatePostData(req.body);
      await updateSessionAndRespond(result, req, res);
      return;
    }
    sendJsonResponse(res, 200, false, false, 'There is no new data');
    return;
  }

  sendJsonResponse(res, 200, false, false, 'You are not logged in');
}

export default updatePostRouter;

async function updatePostData(data: DocUpdateData) {
  // update main post in posts collection
  const resultMain = await updateMainPostData(data);
  // const newDataKey = Object.keys(data.dataToChange)[0];
  // const newDataValue = data.dataToChange[newDataKey];

  // update secondary posts in users posts
  if (!resultMain) {
    return false;
  }

  const newData = JSON.parse(JSON.stringify(data));
  newData.collection = 'Users';
  newData.documentToChange.keyType = 'posts.Id';
  newData.dataToChange = {
    'posts.$': data.dataToChange,
  };

  const resultSec = await updateSecondaryPostData(newData);
  if (!resultSec) {
    return false;
  }
  // update secondary posts in users favorites
  newData.documentToChange.keyType = 'favorites.Id';
  newData.dataToChange = {
    'favorites.$': data.dataToChange,
  };
  const resultFav = await updateSecondaryPostData(newData);

  if (!resultFav) {
    return false;
  }
  return true;
}

async function updateMainPostData(data: DocUpdateData) {
  const result = await updateDocument(data);
  return result;
}

async function updateSecondaryPostData(data: DocUpdateData) {
  const result = await updateMultipleDocuments(data);
  return result;
}
