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

// Retry helper with exponential backoff for API calls

export interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxRetries: 2,
    initialDelay: 1000, // 1 second
    maxDelay: 5000, // 5 seconds max
    backoffMultiplier: 2,
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Don't retry on certain errors
            if (shouldNotRetry(error)) {
                throw error;
            }

            // Don't delay on last attempt
            if (attempt < opts.maxRetries) {
                const delay = Math.min(
                    opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
                    opts.maxDelay
                );

                await sleep(delay);
            }
        }
    }

    throw lastError || new Error('Retry failed');
}

/**
 * Determine if an error should not be retried
 */
function shouldNotRetry(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';

    // Don't retry validation errors or auth errors
    if (
        message.includes('tidak boleh kosong') ||
        message.includes('terlalu panjang') ||
        message.includes('api key') ||
        message.includes('unauthorized') ||
        message.includes('forbidden')
    ) {
        return true;
    }

    return false;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
