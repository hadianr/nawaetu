import { createHash, timingSafeEqual } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

/**
 * A guest's hidden account is named after the device token. A token alone proves nothing once it has leaked (a URL,
 * a log), so the device also holds a random secret that it generated itself and sends with every request. The
 * server keeps only its hash and binds it the first time it sees one for an account.
 */
export const GUEST_SECRET_HEADER = "x-guest-secret";

export const hashGuestSecret = (secret: string): string => createHash("sha256").update(secret).digest("hex");

/** The secret sent with this request, or null when there is none or it is not the shape a device generates. */
export function readGuestSecret(req: Request): string | null {
    const value = req.headers?.get(GUEST_SECRET_HEADER);
    return value && value.length >= 16 && value.length <= 200 ? value : null;
}

function matches(storedHash: string | null | undefined, secret: string | null): boolean {
    if (!storedHash || !secret) return false;
    const a = Buffer.from(storedHash);
    const b = Buffer.from(hashGuestSecret(secret));
    return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Whether this request may act as the guest account.
 * - the account has a secret: the request must carry it;
 * - the account has none: a request that carries one binds it (the first device to speak for the account wins),
 *   and one that does not is an app version from before secrets and is let through.
 */
export async function guestMayAct(user: { id: string; guestSecretHash?: string | null }, secret: string | null): Promise<boolean> {
    if (user.guestSecretHash) return matches(user.guestSecretHash, secret);
    if (!secret) return true;

    const bound = await db.update(users)
        .set({ guestSecretHash: hashGuestSecret(secret) })
        .where(and(eq(users.id, user.id), isNull(users.guestSecretHash)))
        .returning({ id: users.id });
    if (bound.length > 0) return true;

    // Another request bound a secret between our read and our write: it must be this one.
    const [row] = await db.select({ hash: users.guestSecretHash }).from(users).where(eq(users.id, user.id)).limit(1);
    return matches(row?.hash, secret);
}
