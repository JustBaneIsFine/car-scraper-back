import express, { Request, Response } from 'express';
import { CarObject, CustomSession } from './interfaces/general';
import loginCheck from './middleware/loginCheck';
import { addObjectToDocument } from './mongoCom/general';
import sendJsonResponse from './ts/responses';

const newPostRouter = express.Router();

newPostRouter.post('/', loginCheck, newPost);

async function newPost(
  req: Request & { session: CustomSession },
  res: Response
) {
  if (req.body.data && Object.keys(req.body.data) && req.session.user) {
    const carObject: CarObject = req.body.data;
    const { username } = req.session.user;

    // 1. Add this car post to the main collectio
    const updatedMainCollection = await addObjectToDocument({
      collection: 'UsersCars',
      searchType: 'username',
      searchValue: username,
      data: carObject,
    });
    if (!updatedMainCollection) {
      sendJsonResponse(
        res,
        200,
        false,
        false,
        'failed to update main collection'
      );
      return;
    }

    // 2. Add this car post to the users posts collection
    const updatedUsersPosts = await addObjectToDocument({
      collection: 'Users',
      searchType: 'username',
      searchValue: username,
      data: carObject,
    });
    if (!updatedUsersPosts) {
      sendJsonResponse(res, 200, false, false, 'failed to update users posts');
      return;
    }
    // 3. update the session.user.posts
    req.session.user.posts.push(carObject);
    sendJsonResponse(res, 200, true, req.session.user, false);
    return;
  }
  sendJsonResponse(res, 200, false, false, 'Incorrect request');
}
export default newPostRouter;
