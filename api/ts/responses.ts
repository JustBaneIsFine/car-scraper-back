import { Request, Response } from 'express';
import { CustomSession, UserSafeFull } from '../interfaces/general';
import { findUserByName } from '../mongoCom/general';

export default function sendJsonResponse(
  res: Response,
  status: 200,
  success: boolean,
  user: UserSafeFull | false,
  error: string | false
) {
  res.status(200);
  res.json({ success, user, error });
}

async function updateCurrentUserSession(
  req: Request & { session: CustomSession }
) {
  if (req.session.user) {
    const updatedUser = await findUserByName(req.session.user.username);
    if (updatedUser) {
      const { password, ...safeUserObject } = updatedUser;
      req.session.user = safeUserObject;
      return safeUserObject;
    }
    return false;
  }
  return false;
}

export async function updateSessionAndRespond(
  testCase: boolean,
  req: Request & { session: CustomSession },
  res: Response
) {
  if (testCase && req.session.user) {
    const updatedUser = await updateCurrentUserSession(req);
    if (updatedUser) {
      sendJsonResponse(res, 200, true, req.session.user, false);
      return;
    }
  }
  sendJsonResponse(res, 200, false, false, 'failed to update data');
}
