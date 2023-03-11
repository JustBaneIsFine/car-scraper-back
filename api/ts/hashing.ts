import bcrypt from 'bcrypt';

export async function generateHash(password: string) {
  return bcrypt.hash(password, 10);
}

export async function passMatches(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
