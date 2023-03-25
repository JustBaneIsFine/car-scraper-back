import { NextFunction, Request, Response } from 'express';
import { CustomSession } from '../interfaces/general';

export default function validateInput(
  req: Request & { session: CustomSession },
  res: Response,
  next: NextFunction
) {
  const name = req.body.username;
  const pass = req.body.password;
  const userTrimmed = name ? name.trim() : '';
  const passTrimmed = pass ? pass.trim() : '';

  if (usernameIsValid(userTrimmed, res) && passwordIsValid(passTrimmed, res)) {
    req.body.username = userTrimmed;
    req.body.password = passTrimmed;
    next();
    return;
  }
  // respond with error
  res.json({ false: 'ff' });
}

function usernameIsValid(username: string, res: Response) {
  const userLengthValid = checkLengthUsername(username);
  if (userLengthValid === true) {
    return true;
  }
  res.status(401);
  res.json(userLengthValid);
  return false;
}
function passwordIsValid(password: string, res: Response) {
  const x = password ? password.trim() : '';
  const passLengthValid = checkLengthPass(x);
  if (passLengthValid === true) {
    return true;
  }
  res.status(401);
  res.json(passLengthValid);
  return false;
}

function checkLengthPass(pass: string) {
  if (pass.length < 8) {
    return { error: 'password is too short' };
  }
  if (pass.length > 25) {
    return { error: 'password is too long' };
  }
  return true;
}
function checkLengthUsername(name: string) {
  if (name.length < 3) {
    return { error: 'username is too short' };
  }
  if (name.length > 20) {
    return { error: 'username is too long' };
  }
  return true;
}
