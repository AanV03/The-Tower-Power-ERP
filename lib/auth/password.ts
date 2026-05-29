import bcrypt from "bcryptjs";

const PASSWORD_RULES = [
  (value: string) => value.length >= 8,
  (value: string) => /[A-Z]/.test(value),
  (value: string) => /[0-9]/.test(value),
  (value: string) => /[^A-Za-z0-9]/.test(value),
];

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isPasswordValid(password: string) {
  return PASSWORD_RULES.every((rule) => rule(password));
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string | null | undefined) {
  if (!hash) {
    return false;
  }

  return bcrypt.compare(password, hash);
}
