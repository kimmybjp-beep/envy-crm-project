import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string) {
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, KEY_LENGTH);

  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}
