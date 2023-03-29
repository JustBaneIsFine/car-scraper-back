import express, { Request, Response } from 'express';
import { CustomSession } from './interfaces/general';
import loginCheck from './middleware/loginCheck';
import { updateDocument, updateDocuments } from './mongoCom/general';
import sendJsonResponse, { updateSessionAndRespond } from './ts/responses';

const updatePostRouter = express.Router();

updatePostRouter.post('/', loginCheck, updatePost);

async function updatePost(
  req: Request & { session: CustomSession },
  res: Response
) {
  if (req.body.postData && Object.keys(req.body.postData).length) {
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

async function updatePostData(data: { postId: string; postData: any }) {
  const resultMain = await updateMainPostData(data);
  if (!resultMain) {
    return false;
  }

  const updatedUserPosts = await updateUsersPostData(data);
  if (!updatedUserPosts) {
    return false;
  }

  const updatedUserFavorites = await updateFavoritesPostData(data);
  if (!updatedUserFavorites) {
    return false;
  }
  return true;
}

async function updateMainPostData(data: { postId: string; postData: any }) {
  const result = await updateDocument({
    collection: 'UsersCars',
    searchType: 'Id',
    searchValue: data.postId,
    data: data.postData,
  });
  return result;
}

async function updateUsersPostData(data: { postId: string; postData: any }) {
  const result = await updateDocuments({
    collection: 'Users',
    searchType: 'post',
    searchValue: data.postId,
    data: data.postData,
  });
  return result;
}

async function updateFavoritesPostData(data: {
  postId: string;
  postData: any;
}) {
  const result = await updateDocuments({
    collection: 'Users',
    searchType: 'favorite',
    searchValue: data.postId,
    data: data.postData,
  });
  return result;
}
