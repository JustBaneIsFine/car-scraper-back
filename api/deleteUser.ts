import express, { Request, Response } from 'express';
import { CustomSession } from './interfaces/general';
import loginCheck from './middleware/loginCheck';
import { deleteDocument } from './mongoCom/general';
import sendJsonResponse from './ts/responses';

const deleteUserRouter = express.Router();

deleteUserRouter.post('/', loginCheck, deleteUser);

async function deleteUser(
  req: Request & { session: CustomSession },
  res: Response
) {
  if (req.session.user) {
    const deletedUser = await deleteDocument({
      collection: 'Users',
      searchType: 'username',
      searchValue: req.session.user.username,
    });
    if (!deletedUser) {
      sendJsonResponse(res, 200, false, false, 'false to delete user');
    }

    req.session.destroy((error) => {
      sendJsonResponse(res, 200, false, false, 'failed to destroy session');
    });

    sendJsonResponse(res, 200, true, false, false);
  } else {
    sendJsonResponse(res, 200, false, false, 'user is not logged in');
  }
}

export default deleteUserRouter;
