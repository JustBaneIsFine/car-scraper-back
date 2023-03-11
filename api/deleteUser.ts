import express, { Request, Response } from 'express';
import { CustomSession } from './interfaces/general';

const deleteUserRouter = express.Router();

deleteUserRouter.post('/', deleteUser);

async function deleteUser(
  req: Request & { session: CustomSession },
  res: Response
) {}

export default deleteUserRouter;
