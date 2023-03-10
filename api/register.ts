import express, { Request, Response } from 'express';
import { handleRegister } from './authHandlers';
import { CustomSession } from './interfaces/general';
import { loginCheckMid } from './login';

const registerRouter = express.Router();

registerRouter.post('/', loginCheckMid, register);

async function register(
  req: Request & { session: CustomSession },
  res: Response
) {
  const { username } = req.body;
  const { password } = req.body;
  const { email } = req.body;
  const handled = await handleRegister(username, email, password);
  if (handled) {
    req.session.user = handled;
    res.status(200);
    res.json({ success: true, error: false, user: handled });
  } else {
    res.status(200);
    res.json({ success: false, error: 'username is taken' });
  }
}
export default registerRouter;
