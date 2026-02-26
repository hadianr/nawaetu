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

import { LRUCache } from 'lru-cache';

// Simple in-memory rate limiter using LRU cache
// For production with multiple servers, use Upstash Redis or similar

interface RateLimitOptions {
    interval: number; // Time window in milliseconds
    uniqueTokenPerInterval: number; // Max unique tokens (users/IPs)
}

export class RateLimiter {
    private tokenCache: LRUCache<string, number[]>;
    private interval: number;

    constructor(options: RateLimitOptions) {
        this.interval = options.interval;
        this.tokenCache = new LRUCache({
            max: options.uniqueTokenPerInterval,
            ttl: options.interval,
        });
    }

    async check(limit: number, token: string): Promise<{ success: boolean; remaining: number }> {
        const now = Date.now();
        const tokenKey = token;
        const timestamps = this.tokenCache.get(tokenKey) || [];

        // Filter out timestamps outside the current window
        const validTimestamps = timestamps.filter((timestamp) => now - timestamp < this.interval);

        if (validTimestamps.length >= limit) {
            return {
                success: false,
                remaining: 0,
            };
        }

        // Add current timestamp
        validTimestamps.push(now);
        this.tokenCache.set(tokenKey, validTimestamps);

        return {
            success: true,
            remaining: limit - validTimestamps.length,
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
