import express, { Request, Response } from 'express';
import { CustomSession } from './interfaces/general';
import loginCheck from './middleware/loginCheck';
import {
  deleteDocument,
  deleteFromArray,
  deleteFromArrayMultiple,
} from './mongoCom/general';
import sendJsonResponse, { updateSessionAndRespond } from './ts/responses';

const deletePostRouter = express.Router();

deletePostRouter.post('/', loginCheck, deletePost);

async function deletePost(
  req: Request & { session: CustomSession },
  res: Response
) {
  if (req.session.user) {
    // remove post from main collection
    const updatedMainCollection = await deleteDocument({
      collection: 'UsersCars',
      searchType: 'Id',
      searchValue: req.body.data.postId,
    });
    if (!updatedMainCollection) {
      sendJsonResponse(
        res,
        200,
        false,
        false,
        'failed to delete from main collection'
      );
      return;
    }

    // remove post from user account
    const updatedAccount = await deleteFromArray({
      collection: 'Users',
      searchType: 'username',
      searchValue: req.session.user.username,
      deleteKey: 'post',
      deleteValue: req.body.postId,
    });

    if (!updatedAccount) {
      sendJsonResponse(res, 200, false, false, 'failed to delete from account');
      return;
    }

    // remove post from users favorites
    const updatedFavorites = await deleteFromArrayMultiple({
      collection: 'Users',
      searchType: 'username',
      searchValue: req.session.user.username,
      deleteKey: 'favorite',
      deleteValue: req.body.data.postId,
    });
    if (!updatedFavorites) {
      sendJsonResponse(
        res,
        200,
        false,
        false,
        'failed to delete from favorites'
      );
      return;
    }

    await updateSessionAndRespond(updatedFavorites, req, res);
  } else {
    sendJsonResponse(
      res,
      200,
      false,
      false,
      'failed to complete request, user does not exist'
    );
  }
}

export default deletePostRouter;
