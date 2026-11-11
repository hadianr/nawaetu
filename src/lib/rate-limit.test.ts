import { describe, expect, it } from "vitest";
import { paymentRateLimiter, syncRateLimiter } from "./rate-limit";

describe("sync and payment rate limiters", () => {
    it("lets a user sync 30 times a minute and refuses the 31st", async () => {
        const results = [];
        for (let i = 0; i < 31; i++) results.push((await syncRateLimiter.check("sync:test-user-a")).success);
        expect(results.slice(0, 30).every(Boolean)).toBe(true);
        expect(results[30]).toBe(false);
    });

    it("counts each user separately", async () => {
        for (let i = 0; i < 30; i++) await syncRateLimiter.check("sync:test-user-b");
        expect((await syncRateLimiter.check("sync:test-user-b")).success).toBe(false);
        expect((await syncRateLimiter.check("sync:test-user-c")).success).toBe(true);
    });

    it("allows 5 payment links per window", async () => {
        const results = [];
        for (let i = 0; i < 6; i++) results.push((await paymentRateLimiter.check("payment:a@example.com")).success);
        expect(results).toEqual([true, true, true, true, true, false]);
    });
});
