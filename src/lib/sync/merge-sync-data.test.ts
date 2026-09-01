import { describe, expect, it } from "vitest";
import { mergeSyncRecords } from "./merge-sync-data";

describe("mergeSyncRecords", () => {
    it("retains local records when the server is empty", () => {
        const local = [{ id: "bookmark-1" }];
        expect(mergeSyncRecords(local, [], "bookmark")).toEqual(local);
    });

    it("lets the server win duplicate bookmarks while retaining local-only data", () => {
        expect(mergeSyncRecords(
            [{ id: "1", note: "local" }, { id: "2" }],
            [{ id: "1", note: "server" }],
            "bookmark",
        )).toEqual([{ id: "1", note: "server" }, { id: "2" }]);
    });

    it("treats missions on different dates as separate completions", () => {
        expect(mergeSyncRecords(
            [{ id: "daily", completedAt: "2026-01-01" }],
            [{ id: "daily", completedAt: "2026-01-02" }],
            "mission",
        )).toHaveLength(2);
    });

    it("deduplicates intentions by calendar date", () => {
        expect(mergeSyncRecords(
            [{ intentionDate: "2026-01-01", intentionText: "local" }],
            [{ intentionDate: "2026-01-01", intentionText: "server" }],
            "intention",
        )).toEqual([{ intentionDate: "2026-01-01", intentionText: "server" }]);
    });
});
