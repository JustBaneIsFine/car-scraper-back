import express, { NextFunction, Request, Response } from 'express';
import { handleLogin } from './authHandlers';
import { CustomSession } from './interfaces/general';

const loginRouter = express.Router();

loginRouter.post('/', loginCheckMid, loginHandler);

async function loginHandler(
  req: Request & { session: CustomSession },
  res: Response
) {
  const { username } = req.body;
  const { password } = req.body;
  const { email } = req.body;
  const handled = await handleLogin(username, email, password);

  if (handled !== false) {
    if (handled.passGood === true) {
      req.session.user = handled.user;
      res.status(200);
      res.json({ success: true, user: handled.user });
    } else {
      res.status(200);
      res.json({
        success: false,
        error: 'username/password combination is wrong',
      });
    }
  } else {
    res.status(200);
    res.json({
      success: false,
      error: 'username/password combination is wrong',
    });
  }
}

export async function loginCheckMid(
  req: Request & { session: CustomSession },
  res: Response,
  next: NextFunction
) {
  if (req.session.user) {
    res.status(200);
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    next();
  }
}

// export async function loginCheck(
//   req: Request & { session: CustomSession },
//   res: Response
// ) {
//   if (req.session.user) {
//     res.status(200);
//     res.json({
//       loggedIn: true,
//       user: req.session.user,
//     });
//   } else {
//     res.status(200);
//     res.json({ loggedIn: false, user: false });
//   }
// }

export default loginRouter;
