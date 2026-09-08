import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchSurahSegments, findActiveWordIndex } from "@/lib/quran/quran-segments-api";

describe("Quran segment adapter", () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
    });

    it("normalizes valid segments and ignores malformed payload entries", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
            audio_file: {
                timestamps: [
                    {
                        verse_key: "1:1",
                        timestamp_from: 100,
                        segments: [[1, 90, 140], [2, 150, 180], [3, 200]],
                    },
                    null,
                ],
            },
        }))));

        await expect(fetchSurahSegments(1, 7)).resolves.toEqual({
            "1:1": [[1, 0, 40], [2, 50, 80]],
        });
    });

    it("falls back for an unsupported reciter without fetching", async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        await expect(fetchSurahSegments(2, 2)).resolves.toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("finds the active word with binary search", () => {
        const segments: [number, number, number][] = [[1, 0, 40], [2, 50, 80]];

        expect(findActiveWordIndex(segments, 20)).toBe(1);
        expect(findActiveWordIndex(segments, 60)).toBe(2);
        expect(findActiveWordIndex(segments, 45)).toBe(-1);
    });
});
