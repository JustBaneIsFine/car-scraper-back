import express, { Request, Response } from 'express';
import { CustomSession, DocUpdateData } from './interfaces/general';
import {
  addToFavorites,
  deleteFromFavorites,
  updateDocument,
} from './mongoCom/general';
import sendJsonResponse, { updateSessionAndRespond } from './ts/responses';

const updateUserRouter = express.Router();

updateUserRouter.post('/', updateHandler);

async function updateHandler(
  req: Request & { session: CustomSession } & { body: DocUpdateData },
  res: Response
) {
  if (req.session.user) {
    if (req.body.newData && Object.keys(req.body.newData).length) {
      // req.body.newData = modifyType : [user | favorites]; updateType: [push|delete] data: {username: 'xxx', password: 'gawg'} or {CarName: 'x' ...} or {'Id' of post}
      if (req.body.modifyType === 'user') {
        // modify user data
        const updatedUser = await updateUserData(req.body.newData);
        await updateSessionAndRespond(updatedUser, req, res);
        return;
      }
      if (req.body.modifyType === 'favorites') {
        if (req.body.updateType === 'push') {
          // add carObjects to favorites
          const addedUserData = await addToFavorites(
            req.session.user.username,
            req.body.newData
          );
          await updateSessionAndRespond(addedUserData, req, res);
          return;
        }
        if (req.body.updateType === 'delete') {
          // delete carObjects from favorites
          const deletedUserData = await deleteFromFavorites(
            req.session.user.username,
            req.body.newData // id
          );
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

async function updateUserData(data: DocUpdateData) {
  // takes the raw values and updates the data
  const result = await updateDocument(data);
  if (result) {
    return true;
  }
  return false;
}

export default updateUserRouter;
