import { describe, expect, it } from "vitest";
import { HISTORY_EVENTS, getHistoryEventsForMonth } from "./history-events";
import { getHadithById } from "./hadiths";
import { getSirahSectionById } from "./sirah";

describe("history events", () => {
    it.each(HISTORY_EVENTS)("$id links to a library hadith and a sirah text that states its date", (event) => {
        const hadith = getHadithById(event.hadithId);
        expect(hadith?.hadeethEncId).toBeDefined();
        expect(hadith?.translationEn).toBeTruthy();

        const months = { 9: "Ramadhan", 10: "Syaw+al" } as Record<number, string>;
        const text = getSirahSectionById(event.dateSourceSectionId)!.content.join(" ");
        const date = new RegExp(`${event.hijriDay ? `${event.hijriDay} ` : ""}${months[event.hijriMonth]}\\s+${event.hijriYear} H`);
        expect(text).toMatch(date);

        if (event.sirah) {
            expect(getSirahSectionById(event.sirah.sectionId)?.chapterSlug).toBe(event.sirah.chapterSlug);
        }
    });

    it("lists events by Hijri month", () => {
        expect(getHistoryEventsForMonth(9).map((e) => e.id)).toEqual(["badr"]);
        expect(getHistoryEventsForMonth(10).map((e) => e.id)).toEqual(["khandaq", "hunayn"]);
        expect(getHistoryEventsForMonth(1)).toEqual([]);
    });
});
