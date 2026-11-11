/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { getDailyActivityHistory } from "./analytics-utils";

describe("daily activity history", () => {
    beforeEach(() => localStorage.clear());

    it("is still there after a reload, read through the real storage layer", () => {
        const history = [{ date: "2026-11-10", quranAyat: 3 }, { date: "2026-11-11", quranAyat: 5 }];
        getStorageService().set(STORAGE_KEYS.DAILY_ACTIVITY_HISTORY, JSON.stringify(history));
        expect(getDailyActivityHistory()).toEqual(history);
    });

    it("is empty, not an error, when nothing was saved or the value is broken", () => {
        expect(getDailyActivityHistory()).toEqual([]);
        localStorage.setItem(STORAGE_KEYS.DAILY_ACTIVITY_HISTORY, "{broken");
        expect(getDailyActivityHistory()).toEqual([]);
    });
});
