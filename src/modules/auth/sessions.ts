import { eq, sql } from "drizzle-orm";
import { getDb, type Tx } from "@/db/client";
import { clients, credentials, sessions, users } from "@/db/schema";
import { normaliseEmail } from "@/modules/shared/email";
import { Forbidden, Validation } from "@/modules/shared/errors";
import type { Actor } from "./actor";
import { getDummyHash, hashPassword, verifyPassword } from "./password";
import { hashToken, newToken } from "./tokens";

export const IDLE_TIMEOUT_MS = 8 * 60 * 60 * 1000;
export const LAST_SEEN_THROTTLE_MS = 60 * 1000;

export type SessionResult =
  | { status: "none" }
  | { status: "expired" }
  | { status: "inactive" }
  | { status: "active"; actor: Actor };

// Sets (or replaces) a user's password and ends all their sessions in the same transaction (AD-5).
export async function setPassword(tx: Tx, userId: string, password: string): Promise<void> {
  const passwordHash = await hashPassword(password);
  // A transaction of its own, or a savepoint inside the caller's.
  await tx.transaction(async (inner) => {
    await inner
      .insert(credentials)
      .values({ userId, passwordHash })
      .onConflictDoUpdate({ target: credentials.userId, set: { passwordHash } });
    await inner.delete(sessions).where(eq(sessions.userId, userId));
  });
}

export function toActor(row: { userId: string; role: "staff" | "contact"; clientId: string | null }): Actor {
  if (row.role === "staff") return { userId: row.userId, role: "staff" };
  if (!row.clientId) throw new Error("A contact without a client.");
  return { userId: row.userId, role: "contact", clientId: row.clientId };
}

export function isActive(row: { userStatus: string; clientStatus: string | null }): boolean {
  return row.userStatus === "active" && (row.clientStatus === null || row.clientStatus === "active");
}

export const accountColumns = {
  userId: users.id,
  role: users.role,
  clientId: users.clientId,
  userStatus: users.status,
  clientStatus: clients.status,
};

// Checks email and password and starts a session. Unknown emails and wrong passwords cost the same
// argon2 work and give the same error; the inactive message is shown only after a correct password.
export async function login(email: string, password: string, now = new Date()): Promise<{ token: string; actor: Actor }> {
  const db = getDb();
  const [row] = await db
    .select({ ...accountColumns, passwordHash: credentials.passwordHash })
    .from(users)
    .leftJoin(clients, eq(clients.id, users.clientId))
    .leftJoin(credentials, eq(credentials.userId, users.id))
    .where(eq(sql`lower(${users.email})`, normaliseEmail(email)));

  const passwordHash = row?.passwordHash ?? (await getDummyHash());
  const passwordOk = await verifyPassword(passwordHash, password);
  if (!row?.passwordHash || !passwordOk) throw new Validation("login.incorrect");
  if (!isActive(row)) throw new Forbidden("login.inactive");

  const token = await db.transaction((tx) => startSession(tx, row.userId, now));
  return { token, actor: toActor(row) };
}

// Starts a session for a user whose password was just checked or set, and records the login time.
// Returns the cookie token; only its hash is stored.
export async function startSession(tx: Tx, userId: string, now: Date): Promise<string> {
  const token = newToken();
  await tx.insert(sessions).values({ tokenHash: hashToken(token), userId, createdAt: now, lastSeenAt: now });
  await tx
    .update(credentials)
    .set({ previousLoginAt: sql`${credentials.lastLoginAt}`, lastLoginAt: now })
    .where(eq(credentials.userId, userId));
  return token;
}

// Looks up the session for a cookie token at time `now`. Refused sessions (idle, or user or client
// inactive) are deleted, so the stale cookie matches nothing afterwards. lastSeenAt is written at
// most once per LAST_SEEN_THROTTLE_MS.
export async function resolveSession(token: string | undefined, now: Date): Promise<SessionResult> {
  if (!token) return { status: "none" };
  const db = getDb();
  const [row] = await db
    .select({ ...accountColumns, sessionId: sessions.id, lastSeenAt: sessions.lastSeenAt })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .leftJoin(clients, eq(clients.id, users.clientId))
    .where(eq(sessions.tokenHash, hashToken(token)));
  if (!row) return { status: "none" };

  const idleMs = now.getTime() - row.lastSeenAt.getTime();
  if (idleMs > IDLE_TIMEOUT_MS || !isActive(row)) {
    await db.delete(sessions).where(eq(sessions.id, row.sessionId));
    return { status: idleMs > IDLE_TIMEOUT_MS ? "expired" : "inactive" };
  }
  if (idleMs >= LAST_SEEN_THROTTLE_MS) {
    await db.update(sessions).set({ lastSeenAt: now }).where(eq(sessions.id, row.sessionId));
  }
  return { status: "active", actor: toActor(row) };
}

// Deletes the session server-side. A missing or unknown token is a no-op.
export async function logout(token: string | undefined): Promise<void> {
  if (!token) return;
  await getDb().delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}
