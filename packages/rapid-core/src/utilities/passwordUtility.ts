import bcrypt from "bcryptjs";

/**
 * Generates password hash.
 * @param password
 * @param salt
 * @returns
 */
export async function generatePasswordHash(password: string, salt?: number | string): Promise<string> {
  if (!salt) {
    salt = 10;
  }
  const passwordHash = await bcrypt.hash(password, salt);
  return passwordHash;
}

/**
 * Validates the password against the hash.
 * @param password
 * @param passwordHash
 * @returns
 */
export async function validatePassword(password: string, passwordHash: string): Promise<boolean> {
  const isMatch = await bcrypt.compare(password || "", passwordHash || "");
  return isMatch;
}
