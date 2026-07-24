/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Rate limiting with Upstash Redis (sliding window).
 *
 * In production (Vercel serverless), each cold-start instance would otherwise
 * have its own in-memory Map — effective rate-limiting per-instance, not
 * per-user globally. Upstash Redis provides global state across all instances.
 *
 * Falls back to the in-memory implementation when Redis env vars are not set
 * so local dev and CI work without any extra configuration.
 *
 * Setup:
 *   1. Create a Redis DB at https://console.upstash.com
 *   2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local
 *      and to Vercel environment variables.
 */

// ─── Shared result type (same shape for both implementations) ───────────────

export interface RateLimitResult {
    success: boolean;
    remaining: number;
}

// ─── In-memory fallback (dev / CI / no Redis) ───────────────────────────────

interface InMemoryOptions {
    interval: number;               // Time window in ms
    uniqueTokenPerInterval: number; // Max tracked unique tokens before eviction
}

class InMemoryRateLimiter {
    private tokenCache = new Map<string, number[]>();
    private readonly interval: number;
    private readonly maxTokens: number;

    constructor(options: InMemoryOptions) {
        this.interval = options.interval;
        this.maxTokens = options.uniqueTokenPerInterval;
    }

    async limit(limit: number, token: string): Promise<RateLimitResult> {
        const now = Date.now();
        const timestamps = (this.tokenCache.get(token) ?? []).filter(
            (ts) => now - ts < this.interval,
        );

        if (timestamps.length >= limit) {
            return { success: false, remaining: 0 };
        }

        // Evict oldest token when the map is full
        if (this.tokenCache.size >= this.maxTokens && !this.tokenCache.has(token)) {
            const oldest = this.tokenCache.keys().next().value;
            if (oldest) this.tokenCache.delete(oldest);
        }

        timestamps.push(now);
        this.tokenCache.set(token, timestamps);
        return { success: true, remaining: limit - timestamps.length };
    }
}

// ─── Upstash Redis implementation ───────────────────────────────────────────

const isRedisConfigured =
    !!process.env.UPSTASH_REDIS_REST_URL &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN;

// Lazy-build Redis limiters to avoid import-time failures when env vars are absent.
async function buildRedisLimiter(prefix: string, requests: number, window: string) {
    const { Redis } = await import('@upstash/redis');
    const { Ratelimit } = await import('@upstash/ratelimit');
    type Duration = Parameters<typeof Ratelimit.slidingWindow>[1];

    const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, window as Duration),
        analytics: true,
        prefix,
    });
}

// ─── Unified limiter wrapper ─────────────────────────────────────────────────

interface LimiterConfig {
    prefix: string;
    requests: number;          // Max requests per window
    window: string;            // e.g. "1 m", "1 h"
    inMemoryInterval: number;  // ms equivalent for fallback
    inMemoryMaxTokens: number;
}

class UnifiedRateLimiter {
    private readonly config: LimiterConfig;
    private fallback: InMemoryRateLimiter;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private redisLimiter: any | null = null;

    constructor(config: LimiterConfig) {
        this.config = config;
        this.fallback = new InMemoryRateLimiter({
            interval: config.inMemoryInterval,
            uniqueTokenPerInterval: config.inMemoryMaxTokens,
        });
    }

    async check(token: string): Promise<RateLimitResult> {
        if (!isRedisConfigured) {
            return this.fallback.limit(this.config.requests, token);
        }

        try {
            if (!this.redisLimiter) {
                this.redisLimiter = await buildRedisLimiter(
                    this.config.prefix,
                    this.config.requests,
                    this.config.window,
                );
            }
            const { success, remaining } = await this.redisLimiter.limit(token);
            return { success, remaining };
        } catch (err) {
            // Redis unavailable → degrade gracefully to in-memory
            console.warn('[rate-limit] Redis error, falling back to in-memory:', err);
            return this.fallback.limit(this.config.requests, token);
        }
    }
}

// ─── Rate limiters for each use case ────────────────────────────────────────

/**
 * AI chat: 10 requests per minute per user.
 * Usage: const { success } = await chatRateLimiter.check(`chat:${userId}`);
 */
export const chatRateLimiter = new UnifiedRateLimiter({
    prefix: 'rl:chat',
    requests: 10,
    window: '1 m',
    inMemoryInterval: 60 * 1000,
    inMemoryMaxTokens: 500,
});

/**
 * AI greeting: 5 requests per hour per user.
 * Usage: const { success } = await greetingRateLimiter.check(`greet:${userId}`);
 */
export const greetingRateLimiter = new UnifiedRateLimiter({
    prefix: 'rl:greeting',
    requests: 5,
    window: '1 h',
    inMemoryInterval: 60 * 60 * 1000,
    inMemoryMaxTokens: 500,
});
