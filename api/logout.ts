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
      res.json({ error: 'failed to delete session' });
    }
    req.session.destroy((error) => {
      console.log(error);
    });
    res.status(200);
    res.json({ loggedIn: false });
  } else {
    res.status(200);
    res.send({ loggedIn: 'you were not logged in' });
  }
}
export default logoutRouter;
