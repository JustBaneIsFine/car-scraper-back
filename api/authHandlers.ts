import date from 'date-and-time';
import { generateHash, passMatches } from './ts/hashing';
import { UserSafeFull, UserUnsafeFull } from './interfaces/general';
import { createUser, findUserByName } from './mongoCom/general';

const now = new Date();

export async function handleRegister(
  username: string,
  email: string,
  password: string
): Promise<false | UserSafeFull> {
  if (await findUserByName(username)) {
    console.log('user already exists');
    return false;
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

  const userCreated = await createUser(newUser);
  if (!userCreated) {
    console.log('failed to create user');
    return false;
  }
  const userObject = await findUserByName(username);
  if (userObject) {
    const { password: ignore, ...userObjectSafe } = userObject;
    return userObjectSafe as UserSafeFull;
  }
  console.log('user object is false');
  return false;
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
