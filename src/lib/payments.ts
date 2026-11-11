import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";

export type NormalizedPaymentStatus = "settlement" | "pending" | "expired" | "failed";

/** One reading of Mayar's status words for every route, so the webhook and the sync check cannot disagree. */
export function normalizeMayarStatus(status: unknown): NormalizedPaymentStatus {
    if (typeof status === "boolean") return status ? "settlement" : "failed";
    if (typeof status !== "string") return "failed";
    const value = status.toLowerCase();
    if (["paid", "success", "settlement", "settled"].includes(value)) return "settlement";
    if (["pending", "created", "unpaid"].includes(value)) return "pending";
    if (value === "expired") return "expired";
    return "failed";
}

export const MIN_DONATION = 5000;
export const MAX_DONATION = 100_000_000;

/** A whole rupiah amount inside the allowed range; anything else would create an unusable payment link. */
export function isValidDonationAmount(amount: unknown): amount is number {
    return typeof amount === "number" && Number.isInteger(amount) && amount >= MIN_DONATION && amount <= MAX_DONATION;
}

/**
 * Marks a donation paid and credits the donor in ONE database transaction. Either both happen or neither,
 * so a failure between the two steps can no longer leave a donation marked paid and never credited. The
 * status change claims the donation first: only the caller that flips it adds the amount, so the webhook
 * and the sync check cannot both credit it. Returns false when it was already settled.
 */
export async function settleDonation(
    donation: { id: string; userId: string | null; amount: number },
    mayarId?: string,
): Promise<boolean> {
    return db.transaction(async (trx) => {
        const claimed = await trx
            .update(transactions)
            .set({ status: "settlement", ...(mayarId ? { mayarId } : {}), updatedAt: new Date() })
            .where(and(eq(transactions.id, donation.id), ne(transactions.status, "settlement")))
            .returning({ id: transactions.id });
        if (claimed.length === 0) return false;

        if (donation.userId) {
            await trx
                .update(users)
                .set({
                    isMuhsinin: true,
                    muhsininSince: sql`COALESCE(${users.muhsininSince}, now())`,
                    totalInfaq: sql`${users.totalInfaq} + ${donation.amount}`,
                })
                .where(eq(users.id, donation.userId));
        }
        return true;
    });
}
