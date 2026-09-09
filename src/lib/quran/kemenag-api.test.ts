import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    getKemenagChapter,
    getKemenagChapters,
    getKemenagVerse,
    getKemenagVerses,
    getVerseAudioUrl,
    searchVerses,
} from "@/lib/quran/kemenag-api";

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

    it("returns an empty response without calling the search API for blank queries", async () => {
        await expect(searchVerses("  ")).resolves.toEqual({
            query: "  ",
            total_results: 0,
            current_page: 1,
            total_pages: 0,
            results: [],
        });
        expect(fetchWithTimeoutMock).not.toHaveBeenCalled();
    });

    it("maps chapters and resolves a chapter by numeric id", async () => {
        fetchWithTimeoutMock.mockResolvedValueOnce(makeResponse({
            data: [{
                number: 9,
                sequence: 114,
                numberOfVerses: 129,
                name: {
                    short: "التوبة",
                    long: "At-Tawbah",
                    transliteration: { en: "At-Tawbah", id: "At-Taubah" },
                    translation: { en: "The Repentance", id: "Pengampunan" },
                },
                revelation: { arab: "Madinah", en: "Medinan", id: "Madaniyyah" },
                tafsir: { id: "tafsir" },
            }],
        }));

        const chapters = await getKemenagChapters();
        expect(chapters[0]).toMatchObject({
            id: 9,
            revelation_place: "Madinah",
            bismillah_pre: false,
            name_simple: "At-Taubah",
            translated_name_en: "The Repentance",
        });
        fetchWithTimeoutMock.mockResolvedValueOnce(makeResponse({ data: [{
            number: 9,
            sequence: 114,
            numberOfVerses: 129,
            name: {
                short: "التوبة",
                long: "At-Tawbah",
                transliteration: { en: "At-Tawbah", id: "At-Taubah" },
                translation: { en: "The Repentance", id: "Pengampunan" },
            },
            revelation: { arab: "Madinah", en: "Medinan", id: "Madaniyyah" },
            tafsir: { id: "tafsir" },
        }] }));
        await expect(getKemenagChapter("9")).resolves.toEqual(chapters[0]);
    });

    it("rejects empty chapter responses and failed chapter requests", async () => {
        fetchWithTimeoutMock.mockResolvedValueOnce(makeResponse({ data: [] }));
        await expect(getKemenagChapters()).rejects.toThrow("No chapters found");

        fetchWithTimeoutMock.mockResolvedValueOnce(makeResponse({}, false));
        await expect(getKemenagChapters()).rejects.toThrow("Failed to fetch chapters");
    });

    it("rejects a chapter id that is not present in the chapter list", async () => {
        fetchWithTimeoutMock.mockResolvedValueOnce(makeResponse({ data: [{
            number: 1,
            sequence: 1,
            numberOfVerses: 7,
            name: {
                short: "الفاتحة",
                long: "Al-Fatihah",
                transliteration: { en: "Al-Fatihah", id: "Al-Fatihah" },
                translation: { en: "The Opening", id: "Pembukaan" },
            },
            revelation: { arab: "Makkah", en: "Meccan", id: "Makkiyyah" },
        }] }));

        await expect(getKemenagChapter(114)).rejects.toThrow("Chapter 114 not found");
    });

    it("maps verses, words, translations, and audio safely", async () => {
        fetchWithTimeoutMock.mockResolvedValueOnce(makeResponse({
            verses: [{
                id: 255,
                verse_number: 255,
                verse_key: "2:255",
                text_uthmani: "آية",
                words: [
                    { transliteration: { text: "Allahu" } },
                    { transliteration: { text: "la" } },
                    null,
                ],
                translations: [{ resource_id: 33, text: "Terjemahan" }],
                audio: { url: "https://audio.test/255.mp3" },
                meta: { juz: 3 },
            }, { id: "invalid" }],
        }));

        await expect(getKemenagVerses(2, 1, 20, "id")).resolves.toMatchObject([{
            id: 255,
            verse_number: 255,
            verse_key: "2:255",
            text_uthmani: "آية",
            text_uthmani_tajweed: "آية",
            translations: [{ id: undefined, resource_id: 33, text: "Terjemahan" }],
            transliteration: "Allahu la",
            words: [{ transliteration: { text: "Allahu" } }, { transliteration: { text: "la" } }],
            audio: { url: "https://audio.test/255.mp3" },
            meta: { juz: 3 },
        }, {
            id: -1,
            verse_key: "0:0",
        }]);
    });

    it("reports malformed verse list responses with context", async () => {
        fetchWithTimeoutMock.mockResolvedValueOnce(makeResponse({ verses: [] }));
        await expect(getKemenagVerses(2)).rejects.toThrow("Surah 2 failed: No verses");

        fetchWithTimeoutMock.mockResolvedValueOnce(makeResponse({}, false));
        await expect(getKemenagVerses(3)).rejects.toThrow("Surah 3 failed: HTTP 500");
    });

    it("rethrows search failures after logging them", async () => {
        fetchWithTimeoutMock.mockRejectedValueOnce(new Error("network unavailable"));

        await expect(searchVerses("allah")).rejects.toThrow("network unavailable");
    });

    it("maps valid single verses and selects a default audio reciter", async () => {
        fetchWithTimeoutMock.mockResolvedValueOnce(makeResponse({
            data: {
                number: { inQuran: 255, inSurah: 255 },
                text: { arab: "آية" },
                translation: { id: "Terjemahan" },
                audio: { primary: "primary.mp3", secondary: ["secondary.mp3"] },
                tafsir: { id: { short: "Short", long: "Long" } },
                meta: { juz: 3 },
            },
        }));

        await expect(getKemenagVerse(2, 255)).resolves.toMatchObject({
            verse_key: "2:255",
            translation: { id: { text: "Terjemahan" } },
            tafsir: { kemenag: { short: "Short", long: "Long" } },
        });
        expect(getVerseAudioUrl(255, 7)).toContain("/128/ar.alafasy/255.mp3");
        expect(getVerseAudioUrl(255, 999)).toContain("/128/ar.alafasy/255.mp3");
    });
});
