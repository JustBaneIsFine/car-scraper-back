import date from 'date-and-time';
import { generateHash, passMatches } from './ts/hashing';
import { UserSafeFull, UserUnsafeFull } from './interfaces/general';
import { createNewUser, findUserByName } from './mongoCom/general';

const now = new Date();

export async function handleRegister(
  username: string,
  email: string,
  password: string
): Promise<{
  error: string | false;
  user: UserSafeFull | false;
}> {
  if (!(await findUserByName(username))) {
    console.log('user already exists');
    return { error: 'user already exists', user: false };
  }
  const newHash = await generateHash(password);

  const newUser: UserUnsafeFull = {
    username,
    email,
    password: newHash,
    joinDate: date.format(now, 'YYYY/MM/DD HH:mm:ss'),
    favorites: [],
    posts: [],
    userImageUrl: '',
  };

  const userCreated = await createNewUser(newUser);
  if (!userCreated) {
    console.log('failed to create user');
    return { error: 'failed to create user', user: false };
  }

  const { password: ignore, ...userObjectSafe } = newUser;
  return { error: false, user: userObjectSafe };
}
export async function handleLogin(
  username: string,
  email: string,
  password: string
) {
  const userObject = await findUserByName(username);
  if (!userObject) {
    console.log('no such user');
    return false;
  }

  const passCheck = await passMatches(password, userObject.password);
  const { password: ignore, ...userObjectSafe } = userObject;
  return { passGood: passCheck, user: userObjectSafe };
}
