import { createHash, randomBytes } from "node:crypto";

// 256 random bits, for the session cookie and setup links; only the SHA-256 is stored (AD-5).
export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
