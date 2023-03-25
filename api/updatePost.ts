import express, { Request, Response } from 'express';
import { CustomSession, DocUpdateData } from './interfaces/general';
import loginCheck from './middleware/loginCheck';
import { updateDocument, updateDocuments } from './mongoCom/general';
import sendJsonResponse, { updateSessionAndRespond } from './ts/responses';

const updatePostRouter = express.Router();

updatePostRouter.post('/', loginCheck, updatePost);

async function updatePost(
  req: Request & { session: CustomSession },
  res: Response
) {
  if (req.body.dataToChange && Object.keys(req.body.dataToChange)) {
    const result = await updatePostData(req.body);
    if (!result) {
      sendJsonResponse(res, 200, false, false, 'Failed to update data');
      return;
    }
    await updateSessionAndRespond(result, req, res);
    return;
  }
  sendJsonResponse(res, 200, false, false, 'There is no new data');
}

export default updatePostRouter;

async function updatePostData(data: DocUpdateData) {
  // update main post in posts collection
  const resultMain = await updateMainPostData(data);

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

  const updatedUserPosts = await updateSecondaryPostData(newData);
  if (!updatedUserPosts) {
    return false;
  }
  // update secondary posts in users favorites
  newData.documentToChange.keyType = 'favorites.Id';
  newData.dataToChange = {
    'favorites.$': data.dataToChange,
  };
  const updatedUserFavorites = await updateSecondaryPostData(newData);

  if (!updatedUserFavorites) {
    return false;
  }
  return true;
}

async function updateMainPostData(data: DocUpdateData) {
  const result = await updateDocument({
    collection: data.collection,
    searchType: data.documentToChange.keyType,
    searchValue: data.documentToChange.keySearchValue,
    data: data.dataToChange,
  });

  return result;
}

async function updateSecondaryPostData(data: DocUpdateData) {
  const result = await updateDocuments({
    collection: data.collection,
    searchType: data.documentToChange.keyType,
    searchValue: data.documentToChange.keySearchValue,
    data: data.dataToChange,
  });
  return result;
}
