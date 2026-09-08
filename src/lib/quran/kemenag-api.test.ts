import { beforeEach, describe, expect, it, vi } from "vitest";

import { getKemenagVerse, searchVerses } from "@/lib/quran/kemenag-api";

const fetchWithTimeoutMock = vi.fn();

vi.mock("@/lib/utils/fetch", () => ({
    fetchWithTimeout: (...args: unknown[]) => fetchWithTimeoutMock(...args),
}));

function makeResponse(data: unknown, ok = true): Response {
    return new Response(JSON.stringify(data), { status: ok ? 200 : 500 });
}

describe("Kemenag Quran API adapter", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("maps valid search results and ignores malformed entries", async () => {
        fetchWithTimeoutMock.mockResolvedValueOnce(makeResponse({
            search: {
                query: "allah",
                total_results: 2,
                current_page: 1,
                total_pages: 1,
                results: [
                    {
                        verse_key: "1:1",
                        verse_id: 1,
                        text: "بِسْمِ اللَّهِ",
                        translations: [{ text: "Dengan nama Allah" }],
                        words: [{ text: "بِسْمِ" }],
                    },
                    null,
                ],
            },
        }));

        await expect(searchVerses("allah")).resolves.toMatchObject({
            query: "allah",
            total_results: 2,
            results: [{
                verse_key: "1:1",
                verse_id: 1,
                text_uthmani: "بِسْمِ اللَّهِ",
                translation: "Dengan nama Allah",
            }],
        });
    });

    it("rejects an invalid single-verse payload", async () => {
        fetchWithTimeoutMock.mockResolvedValueOnce(makeResponse({ data: {} }));

        await expect(getKemenagVerse(1, 1)).rejects.toThrow("Invalid verse response");
    });
});
