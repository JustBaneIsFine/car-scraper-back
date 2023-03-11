import express, { Request, Response } from 'express';
import { CustomSession } from './interfaces/general';

const deletePostRouter = express.Router();

deletePostRouter.post('/', deletePost);

async function deletePost(
  req: Request & { session: CustomSession },
  res: Response
) {}

export default deletePostRouter;
