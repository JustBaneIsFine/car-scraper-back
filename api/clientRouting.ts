import express, { Request, Response } from 'express';
import path from 'path';

const returnIndexRouter = express.Router();

/* GET home page. */
returnIndexRouter.get('/', returnIndex);

async function returnIndex(req: Request, res: Response) {
  res.sendFile(path.join(__dirname, 'assets', 'index.html'));
}
export default returnIndexRouter;
