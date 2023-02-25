import express, { Request, Response } from 'express';
import { CustomSession } from './interfaces/general';

const router = express.Router();

/* GET home page. */
router.get('/', loginCheck);

async function loginCheck(
  req: Request & { session: CustomSession },
  res: Response
) {
  if (req.session.user) {
    res.status(200);
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(200);
    res.json({ loggedIn: false, user: false });
  }
}
export default router;
