import { describe, expect, it } from "vitest";
import { mergeBookmarks, mergeMissions, mergeTodayActivity, missionKey, bookmarkKey } from "./merge";

const none = { upserts: new Set<string>(), deletes: new Set<string>() };
const TODAY = "2026-11-11";

describe("mergeMissions", () => {
    it("adds a mission another device completed", () => {
        const merged = mergeMissions([], [{ missionId: "fajr_prayer", completedDate: TODAY, hasanahEarned: 75 }], none, TODAY);
        expect(merged).toEqual([{ id: "fajr_prayer", completedAt: TODAY, hasanahEarned: 75 }]);
    });

    it("drops a mission another device undid", () => {
        const local = [{ id: "fajr_prayer", completedAt: `${TODAY}T05:00:00.000Z`, hasanahEarned: 75 }];
        expect(mergeMissions(local, [], none, TODAY)).toEqual([]);
    });

    it("keeps a completion made here that is still queued", () => {
        const local = [{ id: "fajr_prayer", completedAt: `${TODAY}T05:00:00.000Z`, hasanahEarned: 75 }];
        const pending = { upserts: new Set([missionKey("fajr_prayer", TODAY)]), deletes: new Set<string>() };
        expect(mergeMissions(local, [], pending, TODAY)).toHaveLength(1);
    });

    it("does not bring back a mission undone here that the server still has", () => {
        const pending = { upserts: new Set<string>(), deletes: new Set([missionKey("fajr_prayer", TODAY)]) };
        const merged = mergeMissions([], [{ missionId: "fajr_prayer", completedDate: TODAY, hasanahEarned: 75 }], pending, TODAY);
        expect(merged).toEqual([]);
    });

    it("leaves history older than the window untouched", () => {
        const old = { id: "fajr_prayer", completedAt: "2026-01-01", hasanahEarned: 25 };
        expect(mergeMissions([old], [], none, TODAY)).toEqual([old]);
    });

    it("keeps a record the server cannot hold, such as an id no longer in the catalogue", () => {
        const legacy = { id: "retired_mission_xyz", completedAt: TODAY, hasanahEarned: 10 };
        expect(mergeMissions([legacy], [], none, TODAY)).toEqual([legacy]);
    });

    it("keeps this device's exact completion time when both sides have the mission", () => {
        const local = [{ id: "fajr_prayer", completedAt: `${TODAY}T05:12:00.000Z`, hasanahEarned: 75 }];
        const merged = mergeMissions(local, [{ missionId: "fajr_prayer", completedDate: TODAY, hasanahEarned: 75 }], none, TODAY);
        expect(merged).toEqual(local);
    });
});

describe("mergeBookmarks", () => {
    const row = (verseId: number) => ({
        key: `2:${verseId}`, surahId: 2, surahName: "Al-Baqarah", verseId, verseText: "x", translationText: null, note: null, tags: null,
        createdAt: "2026-11-01T00:00:00Z", updatedAt: "2026-11-01T00:00:00Z",
    });

    it("adds a bookmark from another device and drops one deleted there", () => {
        const local = [{ id: "2:1", surahId: 2, verseId: 1 }];
        const merged = mergeBookmarks(local, [row(255)], none);
        expect(merged.map((bookmark) => bookmark.id)).toEqual(["2:255"]);
    });

    it("keeps an unsent local edit and an unsent delete", () => {
        const local = [{ id: "2:1", surahId: 2, verseId: 1, note: "mine" }];
        const upserts = new Set([bookmarkKey(2, 1)]);
        expect(mergeBookmarks(local, [row(1)], { upserts, deletes: new Set() })[0]).toMatchObject({ note: "mine" });
        expect(mergeBookmarks([], [row(1)], { upserts: new Set(), deletes: new Set([bookmarkKey(2, 1)]) })).toEqual([]);
    });
});

describe("mergeTodayActivity", () => {
    it("takes the higher counter and the union of prayers, never erasing either device", () => {
        const local = { date: TODAY, quranAyat: 3, tasbihCount: 99, prayersLogged: ["fajr"] };
        const merged = mergeTodayActivity(local, [{ date: TODAY, quranAyat: 10, tasbihCount: 33, prayersLogged: ["dhuhr"] }], TODAY);
        expect(merged).toMatchObject({ quranAyat: 10, tasbihCount: 99 });
        expect(merged?.prayersLogged.sort()).toEqual(["dhuhr", "fajr"]);
    });

    it("starts today from the server when this device has only yesterday", () => {
        const merged = mergeTodayActivity({ date: "2026-11-10", quranAyat: 5, tasbihCount: 5, prayersLogged: [] }, [{ date: TODAY, quranAyat: 2, tasbihCount: 7, prayersLogged: ["fajr"] }], TODAY);
        expect(merged).toMatchObject({ date: TODAY, quranAyat: 2, tasbihCount: 7, prayersLogged: ["fajr"] });
    });

    it("changes nothing when the server has nothing for today", () => {
        const local = { date: TODAY, quranAyat: 1, tasbihCount: 1, prayersLogged: [] };
        expect(mergeTodayActivity(local, [], TODAY)).toBe(local);
    });
});
