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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getVerseTafsir } from "@/lib/quran/tafsir-api";

const storageMock = {
    getOptional: vi.fn(),
    set: vi.fn(),
    remove: vi.fn()
};

vi.mock("@/core/infrastructure/storage", () => ({
    getStorageService: () => storageMock
}));

const fetchWithTimeoutMock = vi.fn();
vi.mock("@/lib/utils/fetch", () => ({
    fetchWithTimeout: (...args: unknown[]) => fetchWithTimeoutMock(...args)
}));

const makeResponse = (data: unknown, ok = true) =>
    new Response(JSON.stringify(data), { status: ok ? 200 : 500 });

describe("getVerseTafsir", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns cached tafsir when entry is fresh and version matches", async () => {
        const cached = {
            data: { short: "cached", long: "cached long" },
            ts: Date.now(),
            v: 1
        };
        storageMock.getOptional.mockReturnValueOnce(JSON.stringify(cached));

        const result = await getVerseTafsir(1, 1, "id");

        expect(result).toEqual(cached.data);
        expect(fetchWithTimeoutMock).not.toHaveBeenCalled();
    });

    it("fetches and caches when cached entry is expired", async () => {
        const cached = {
            data: { short: "old", long: "old" },
            ts: Date.now() - 8 * 24 * 60 * 60 * 1000,
            v: 1
        };
        storageMock.getOptional.mockReturnValueOnce(JSON.stringify(cached));
        fetchWithTimeoutMock.mockResolvedValueOnce(
            makeResponse({ data: { tafsir: { id: { short: "new", long: "new long" } } } })
        );

        const result = await getVerseTafsir(2, 5, "id");

        expect(result).toEqual({ short: "new", long: "new long" });
        expect(fetchWithTimeoutMock).toHaveBeenCalledTimes(1);
        expect(storageMock.set).toHaveBeenCalledWith(
            expect.stringContaining("quran_tafsir_id_2:5"),
            expect.any(String)
        );
    });

    it("fetches when cached entry version mismatches", async () => {
        const cached = {
            data: { short: "old", long: "old" },
            ts: Date.now(),
            v: 0
        };
        storageMock.getOptional.mockReturnValueOnce(JSON.stringify(cached));
        fetchWithTimeoutMock.mockResolvedValueOnce(
            makeResponse({ data: { tafsir: { id: { short: "fresh", long: "fresh long" } } } })
        );

        const result = await getVerseTafsir(3, 7, "id");

        expect(result).toEqual({ short: "fresh", long: "fresh long" });
        expect(fetchWithTimeoutMock).toHaveBeenCalledTimes(1);
    });

    it("fetches and caches English tafsir previews", async () => {
        storageMock.getOptional.mockReturnValueOnce(null);
        fetchWithTimeoutMock.mockResolvedValueOnce(
            makeResponse({ tafsir: { text: "<p>Summary</p><p>Full explanation</p>" } })
        );

        await expect(getVerseTafsir(2, 255, "en")).resolves.toEqual({
            short: "Summary",
            long: "<p>Summary</p><p>Full explanation</p>",
        });
        expect(storageMock.set).toHaveBeenCalledWith(
            expect.stringContaining("quran_tafsir_en_2:255"),
            expect.any(String),
        );
    });

    it("returns null for unavailable, empty, or malformed tafsir responses", async () => {
        storageMock.getOptional.mockReturnValueOnce("not-json");
        fetchWithTimeoutMock.mockResolvedValueOnce(makeResponse({ data: {} }));
        await expect(getVerseTafsir(4, 1)).resolves.toBeNull();

        storageMock.getOptional.mockReturnValueOnce(null);
        fetchWithTimeoutMock.mockResolvedValueOnce(makeResponse({ tafsir: { text: "" } }));
        await expect(getVerseTafsir(4, 1, "en")).resolves.toBeNull();

        storageMock.getOptional.mockReturnValueOnce(null);
        fetchWithTimeoutMock.mockResolvedValueOnce(makeResponse({}, false));
        await expect(getVerseTafsir(4, 1)).resolves.toBeNull();
    });

    it("supports legacy cache entries without metadata", async () => {
        const cached = { short: "legacy", long: "legacy long" };
        storageMock.getOptional.mockReturnValueOnce(JSON.stringify(cached));

        await expect(getVerseTafsir(5, 1)).resolves.toEqual(cached);
        expect(fetchWithTimeoutMock).not.toHaveBeenCalled();
    });
});
