import { hash, verify } from "@node-rs/argon2";

// argon2id with the library defaults (19 MiB, 2 passes), the OWASP baseline (AD-5).
export function hashPassword(password: string): Promise<string> {
  return hash(password);
}

export function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  return verify(passwordHash, password);
}

// A real hash of a random password, verified for unknown emails so they cost the same argon2 work.
// Computed at load, so even the first unknown-email login only verifies.
const dummyHash = hashPassword(crypto.randomUUID());

export function getDummyHash(): Promise<string> {
  return dummyHash;
}
