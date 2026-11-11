import { describe, expect, it } from "vitest";
import { isValidDonationAmount, normalizeMayarStatus } from "./payments";

describe("normalizeMayarStatus", () => {
    it.each([
        ["paid", "settlement"], ["SETTLED", "settlement"], ["success", "settlement"], [true, "settlement"],
        ["unpaid", "pending"], ["created", "pending"], ["pending", "pending"],
        ["expired", "expired"], ["cancelled", "failed"], [false, "failed"], [undefined, "failed"],
    ])("reads %s as %s", (input, expected) => {
        expect(normalizeMayarStatus(input)).toBe(expected);
    });
});

describe("isValidDonationAmount", () => {
    it("accepts whole amounts from 5,000 up to the cap", () => {
        expect(isValidDonationAmount(5000)).toBe(true);
        expect(isValidDonationAmount(100_000_000)).toBe(true);
    });
    it("rejects fractions, strings, too small and too large", () => {
        for (const bad of [4999, 5000.5, "10000", null, 100_000_001, NaN]) expect(isValidDonationAmount(bad)).toBe(false);
    });
});
