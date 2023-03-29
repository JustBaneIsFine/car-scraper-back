import express, { Request, Response } from 'express';
import { CarObject, CustomSession } from './interfaces/general';
import loginCheck from './middleware/loginCheck';
import { addObjectToDocument, createNewCarPost } from './mongoCom/general';
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

    const updatedMainCollection = await createNewCarPost(carObject);

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

    const updatedUsersPosts = await addObjectToDocument({
      collection: 'Users',
      searchType: 'username',
      searchValue: username,
      data: carObject,
      setType: 'post',
    });
    if (!updatedUsersPosts) {
      sendJsonResponse(res, 200, false, false, 'failed to update users posts');
      return;
    }
    req.session.user.posts.push(carObject);
    sendJsonResponse(res, 200, true, req.session.user, false);
    return;
  }
  sendJsonResponse(res, 200, false, false, 'Incorrect request');
}
export default newPostRouter;
