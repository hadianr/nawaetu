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

type FetchInit = RequestInit & { next?: unknown };

type FetchWithTimeoutOptions = {
    timeoutMs?: number;
};

export async function fetchWithTimeout(
    input: RequestInfo | URL,
    init: FetchInit = {},
    options: FetchWithTimeoutOptions = {}
) {
    const { timeoutMs = 8000 } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const signal = init.signal && "any" in AbortSignal
        ? (AbortSignal as typeof AbortSignal & { any: (signals: AbortSignal[]) => AbortSignal }).any([init.signal, controller.signal])
        : controller.signal;

    try {
        return await fetch(input, { ...init, signal });
    } finally {
        clearTimeout(timeoutId);
    }
}
