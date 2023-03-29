import express, { Request, Response } from 'express';
import { CustomSession, DocUpdateData } from './interfaces/general';
import loginCheck from './middleware/loginCheck';
import {
  addObjectToDocument,
  deleteFromArray,
  updateDocument,
} from './mongoCom/general';
import sendJsonResponse, { updateSessionAndRespond } from './ts/responses';

const updateUserRouter = express.Router();

updateUserRouter.post('/', loginCheck, updateHandler);

async function updateHandler(
  req: Request & { session: CustomSession } & { body: DocUpdateData },
  res: Response
) {
  if (req.session.user) {
    if (req.body.data && Object.keys(req.body.data).length) {
      if (req.body.modifyType === 'user') {
        // modify user data
        const updatedUser = await updateUserData(
          req.session.user.username,
          req.body.data
        );
        await updateSessionAndRespond(updatedUser, req, res);
        return;
      }
      if (req.body.modifyType === 'favorites') {
        if (req.body.updateType === 'push') {
          // add carObjects to favorites
          const addedUserData = await addObjectToDocument({
            collection: 'Users',
            searchType: 'username',
            searchValue: req.session.user.username,
            setType: 'favorite',
            data: req.body.data,
          });
          if (addedUserData !== false) {
            await updateSessionAndRespond(true, req, res);
            return;
          }
          sendJsonResponse(
            res,
            200,
            false,
            false,
            'failed to push to favorites'
          );
        }
        if (req.body.updateType === 'delete') {
          // delete carObjects from favorites
          const deletedUserData = await deleteFromArray({
            collection: 'Users',
            searchType: 'username',
            searchValue: req.session.user.username,
            deleteKey: 'favorite',
            deleteValue: req.body.data,
          });
          await updateSessionAndRespond(deletedUserData, req, res);
          return;
        }
      }
      sendJsonResponse(res, 200, false, false, 'unsupported modifier type');
      return;
    }
    sendJsonResponse(res, 200, false, false, 'There is no data');
    return;
  }
  sendJsonResponse(res, 200, false, false, 'You are not logged in');
}

async function updateUserData(username: string, data: object) {
  const result = await updateDocument({
    collection: 'Users',
    searchType: 'username',
    searchValue: username,
    data,
  });
  if (result) {
    return true;
  }
  return false;
}

export default updateUserRouter;
