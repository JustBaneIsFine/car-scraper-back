import express, { Request, Response } from 'express';
import { CustomSession } from './interfaces/general';
import loginCheck from './middleware/loginCheck';

const logoutRouter = express.Router();

logoutRouter.get('', loginCheck, logOut);

export async function logOut(
  req: Request & { session: CustomSession },
  res: Response
) {
  req.session.destroy((x) => {
    console.log(x);
  });
  res.status(200);
  res.json({ success: true, error: false, loggedIn: false });
}
export default logoutRouter;
