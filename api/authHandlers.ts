import { generateHash, passMatches } from './hashing';
import { UserInterface, UserInterfaceDB } from './interfaces/user';
import { createUser, findUserByName } from './mongoCom/general';

export async function handleRegister(
  username: string,
  email: string,
  password: string
): Promise<false | UserInterfaceDB> {
  if (await findUserByName(username)) {
    console.log('user already exists');
    return false;
  }
  const newHash = await generateHash(password);

  const newUser: UserInterface = {
    username,
    email,
    password: newHash,
  };

  const userCreated = await createUser(newUser);
  if (!userCreated) {
    console.log('failed to create user');
    return false;
  }
  const userObject = await findUserByName(username);
  if (userObject) {
    userObject.password = '';
    return userObject;
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
  return { passGood: passCheck, user: userObject };
}
