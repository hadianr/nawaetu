import { afterEach, describe, expect, it, vi } from "vitest";

const redisUsed = vi.hoisted(() => ({ built: 0 }));

vi.mock("@upstash/redis", () => ({
    Redis: class { constructor() { redisUsed.built++; } },
}));
vi.mock("@upstash/ratelimit", () => ({
    Ratelimit: class {
        static slidingWindow() { return {}; }
        constructor(public options: Record<string, unknown>) { redisUsed.built++; }
        async limit() { return { success: true, remaining: 1 }; }
    },
}));

describe("rate limiters when Redis is configured", () => {
    afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); redisUsed.built = 0; });

    it("keep the busy sync limiters off Redis and send the cross-instance ones to it", async () => {
        vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
        vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
        vi.resetModules();
        const limits = await import("./rate-limit");

        await limits.syncRateLimiter.check("sync:u1");
        await limits.intentionRateLimiter.check("intention:t1");
        expect(redisUsed.built).toBe(0);

        await limits.paymentRateLimiter.check("payment:a@example.com");
        expect(redisUsed.built).toBeGreaterThan(0);
    });

    it("do not ask Redis to record analytics on every check", async () => {
        vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
        vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
        vi.resetModules();
        const created: Array<Record<string, unknown>> = [];
        vi.doMock("@upstash/ratelimit", () => ({
            Ratelimit: class {
                static slidingWindow() { return {}; }
                constructor(options: Record<string, unknown>) { created.push(options); }
                async limit() { return { success: true, remaining: 1 }; }
            },
        }));
        const limits = await import("./rate-limit");
        await limits.chatRateLimiter.check("chat:u1");
        expect(created[0].analytics).toBe(false);
    });
});
