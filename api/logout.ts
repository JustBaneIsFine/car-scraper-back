import express, { Request, Response } from 'express';
import { CustomSession } from './interfaces/general';
import { deleteSession } from './mongoCom/general';

const logoutRouter = express.Router();

logoutRouter.get('', logOut);

export async function logOut(
  req: Request & { session: CustomSession },
  res: Response
) {
  if (req.session.user) {
    const deleted = await deleteSession(req.session.user.username);
    if (!deleted) {
      res.json({
        success: false,
        error: 'failed to delete session',
        loggedIn: true,
      });
    }
    req.session.destroy((error) => {
      console.log(error);
    });
    res.status(200);
    res.json({ success: true, error: false, loggedIn: false });
  } else {
    res.status(200);
    res.send({
      success: false,
      error: 'you were not logged in',
      loggedIn: false,
    });
  }
}
export default logoutRouter;
