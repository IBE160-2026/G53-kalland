import { createHash, randomBytes } from "node:crypto";

// 256 random bits for the cookie; only the SHA-256 is stored (AD-5).
export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
