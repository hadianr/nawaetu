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

// Simple in-memory rate limiter using native Map
// For production with multiple servers, use Upstash Redis or similar

interface RateLimitOptions {
    interval: number; // Time window in milliseconds
    uniqueTokenPerInterval: number; // Max unique tokens (users/IPs)
}

export class RateLimiter {
    private tokenCache = new Map<string, number[]>();
    private interval: number;
    private maxTokens: number;

    constructor(options: RateLimitOptions) {
        this.interval = options.interval;
        this.maxTokens = options.uniqueTokenPerInterval;
    }

    async check(limit: number, token: string): Promise<{ success: boolean; remaining: number }> {
        const now = Date.now();
        const timestamps = (this.tokenCache.get(token) || []).filter((timestamp) => now - timestamp < this.interval);

        if (timestamps.length >= limit) {
            return {
                success: false,
                remaining: 0,
            };
        }

        if (this.tokenCache.size >= this.maxTokens && !this.tokenCache.has(token)) {
            const oldestKey = this.tokenCache.keys().next().value;
            if (oldestKey) this.tokenCache.delete(oldestKey);
        }

        timestamps.push(now);
        this.tokenCache.set(token, timestamps);

        return {
            success: true,
            remaining: limit - timestamps.length,
        };
    }
}

// Rate limiters for different use cases
export const chatRateLimiter = new RateLimiter({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500, // Support 500 unique users
});

export const greetingRateLimiter = new RateLimiter({
    interval: 60 * 60 * 1000, // 1 hour
    uniqueTokenPerInterval: 500,
});
