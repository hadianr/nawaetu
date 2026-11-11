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
