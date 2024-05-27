import * as crypto from 'crypto';

const SECRET_KEY = process.env.ENCRYPTION_KEY;
const SECRET_KEY_PASSWORD = process.env.ENCRYPTION_KEY_PASSWORD;

export function encryptPassword(password: string): string {
  const cipher = crypto.createCipher('aes256', String(SECRET_KEY_PASSWORD));
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export async function decryptPassword(password: string): Promise<string> {
  const decipher = crypto.createDecipher('aes256', String(SECRET_KEY_PASSWORD));
  let decrypted = decipher.update(String(password), 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return await decrypted;
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  const decryptedPassword = await decryptPassword(hashedPassword);
  return password === decryptedPassword;
}
