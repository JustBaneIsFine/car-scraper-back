import express, { Request, Response } from 'express';
import { CustomSession } from './interfaces/general';
import loginCheck from './middleware/loginCheck';

const logoutRouter = express.Router();

logoutRouter.get('', loginCheck, logOut);

export async function logOut(
  req: Request & { session: CustomSession },
  res: Response
) {
  req.session.destroy((error) => {
    res.json({
      success: false,
      error: 'failed to delete session',
      loggedIn: true,
    });
  });
  res.status(200);
  res.json({ success: true, error: false, loggedIn: false });
}
export default logoutRouter;
