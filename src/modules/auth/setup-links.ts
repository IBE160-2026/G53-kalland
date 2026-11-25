import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb, requireEnv, type Tx } from "@/db/client";
import { clients, setupLinks, users } from "@/db/schema";
import { Forbidden, NotFound, Validation } from "@/modules/shared/errors";
import type { Actor } from "./actor";
import { accountColumns, isActive, setPassword, startSession, toActor } from "./sessions";
import { hashToken, newToken } from "./tokens";

// Single-use setup links (FR-4, AD-5): the app sends no email, so staff hand the link over themselves.
export const SETUP_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 1024;

// The message keys a setup link can end with. Used, expired, cancelled and unknown links all read the same (S8).
export const SETUP_LINK_EXPIRED = "login.expired";
export const PASSWORD_TOO_SHORT = "setPassword.tooShort";
export const PASSWORD_TOO_LONG = "setPassword.tooLong";

export type SetupLink = { url: string; expiresAt: Date };

// Unused, not cancelled and not expired at `now`.
function isOpen(now: Date) {
  return and(isNull(setupLinks.usedAt), isNull(setupLinks.cancelledAt), gt(setupLinks.expiresAt, now));
}

// Makes a new link for the user and cancels every earlier unused one, in the caller's transaction
// (accounts calls it when it creates a user). The token is returned only inside the URL; only its
// hash is stored. Throws NotFound for an unknown user.
export async function issueSetupLink(tx: Tx, userId: string, now = new Date()): Promise<SetupLink> {
  const token = newToken();
  const expiresAt = new Date(now.getTime() + SETUP_LINK_TTL_MS);
  // A transaction of its own, or a savepoint inside the caller's.
  await tx.transaction(async (inner) => {
    // Locks the user's row, so two links issued at once cannot both stay valid.
    const [user] = await inner.select({ id: users.id }).from(users).where(eq(users.id, userId)).for("update");
    if (!user) throw new NotFound();
    await inner
      .update(setupLinks)
      .set({ cancelledAt: now })
      .where(and(eq(setupLinks.userId, userId), isNull(setupLinks.usedAt), isNull(setupLinks.cancelledAt)));
    await inner.insert(setupLinks).values({ userId, tokenHash: hashToken(token), createdAt: now, expiresAt });
  });
  return { url: `${new URL(requireEnv("APP_ORIGIN")).origin}/setup/${token}`, expiresAt };
}

// Whether the link can still be used. Reads only: opening the page never uses it up.
export async function isSetupLinkValid(token: string, now = new Date()): Promise<boolean> {
  const [row] = await getDb()
    .select({ id: setupLinks.id })
    .from(setupLinks)
    .where(and(eq(setupLinks.tokenHash, hashToken(token)), isOpen(now)));
  return row !== undefined;
}

// Sets the password from a link and logs the user in, in one transaction: the link is used up, the
// password stored (ending all the user's sessions) and a new session started. A password of the wrong
// length, or an inactive user or client, leaves the link unused. Using the link is a conditional
// update, so of two parallel submits only one succeeds; the other reads as expired.
export async function redeemSetupLink(
  token: string,
  password: string,
  now = new Date(),
): Promise<{ token: string; actor: Actor }> {
  if (password.length < PASSWORD_MIN_LENGTH) throw new Validation(PASSWORD_TOO_SHORT);
  if (password.length > PASSWORD_MAX_LENGTH) throw new Validation(PASSWORD_TOO_LONG);
  const tokenHash = hashToken(token);

  return getDb().transaction(async (tx) => {
    const [row] = await tx
      .select({ ...accountColumns, linkId: setupLinks.id })
      .from(setupLinks)
      .innerJoin(users, eq(users.id, setupLinks.userId))
      .leftJoin(clients, eq(clients.id, users.clientId))
      .where(and(eq(setupLinks.tokenHash, tokenHash), isOpen(now)));
    if (!row) throw new Validation(SETUP_LINK_EXPIRED);
    if (!isActive(row)) throw new Forbidden("login.inactive");

    const used = await tx
      .update(setupLinks)
      .set({ usedAt: now })
      .where(and(eq(setupLinks.id, row.linkId), isOpen(now)))
      .returning({ id: setupLinks.id });
    if (used.length === 0) throw new Validation(SETUP_LINK_EXPIRED);

    await setPassword(tx, row.userId, password);
    return { token: await startSession(tx, row.userId, now), actor: toActor(row) };
  });
}
