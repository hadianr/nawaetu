import { describe, expect, it } from "vitest";
import { DATED_HISTORY_EVENTS, HISTORY_EVENTS, UNDATED_HISTORY_EVENTS, getHistoryEventsForMonth } from "./history-events";
import { getSirahSectionById } from "./sirah";

const MONTH_PATTERNS: Record<number, string> = { 9: "Ramadhan", 10: "Syaw+al" };

describe("history events", () => {
    it.each(DATED_HISTORY_EVENTS)("$id has a date stated in the app's sirah text", (event) => {
        const text = getSirahSectionById(event.dateSourceSectionId!)!.content.join(" ");
        const day = event.hijriDay ? `${event.hijriDay} ` : "";
        expect(text).toMatch(new RegExp(`${day}${MONTH_PATTERNS[event.hijriMonth!]}\\s+${event.hijriYear} H`));
    });

    it.each(HISTORY_EVENTS)("$id ships its hadith in both languages with HadeethEnc credit", (event) => {
        expect(event.titleId && event.titleEn && event.lessonId && event.lessonEn).toBeTruthy();
        expect(event.hadith.arabic && event.hadith.translation && event.hadith.translationEn).toBeTruthy();
        expect(Number.isInteger(event.hadith.hadeethEncId)).toBe(true);
        if (event.sirah) expect(getSirahSectionById(event.sirah.sectionId)?.chapterSlug).toBe(event.sirah.chapterSlug);
    });

    it("keeps the timeline in order and undated events without any date", () => {
        const order = DATED_HISTORY_EVENTS.map((e) => e.hijriYear! * 100 + e.hijriMonth! + (e.hijriDay ?? 0) / 100);
        expect(order).toEqual([...order].sort((a, b) => a - b));
        for (const e of UNDATED_HISTORY_EVENTS) expect(e.hijriMonth ?? e.hijriDay ?? e.dateSourceSectionId).toBeUndefined();
        expect(new Set(HISTORY_EVENTS.map((e) => e.id)).size).toBe(HISTORY_EVENTS.length);
    });

    it("lists dated events by Hijri month", () => {
        expect(getHistoryEventsForMonth(9).map((e) => e.id)).toEqual(["badr"]);
        expect(getHistoryEventsForMonth(10).map((e) => e.id)).toEqual(["uhud", "khandaq", "hunayn"]);
        expect(getHistoryEventsForMonth(1)).toEqual([]);
    });
});
