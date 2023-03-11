import { NextFunction, Request, Response } from 'express';
import { CustomSession } from '../interfaces/general';

export default async function loginCheck(
  req: Request & { session: CustomSession },
  res: Response,
  next: NextFunction
) {
  if (req.session.user) {
    next();
  } else {
    res.status(200);
    res.json({ loggedIn: false, user: false });
  }
}
