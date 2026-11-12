/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import { afterDismissed, afterShown, emptyState, NUDGE_STORAGE_KEY, pickNudge, readNudgeState, writeNudgeState } from "./login-nudge";

const NOW = 1_800_000_000_000;
const DAY = 86_400_000;

describe("login nudge", () => {
    beforeEach(() => localStorage.clear());

    it("asks nothing of a guest whose habit is not formed yet", () => {
        for (const streakDays of [0, 3, 6]) expect(pickNudge({ streakDays }, emptyState(), NOW)).toBeNull();
    });

    it("asks at 7, 14 and 30 days, each once", () => {
        let state = emptyState();
        const asked: string[] = [];
        for (const [streakDays, daysLater] of [[7, 0], [7, 2], [14, 3], [14, 5], [30, 6], [45, 8]] as const) {
            const pick = pickNudge({ streakDays }, state, NOW + daysLater * DAY);
            if (pick) { asked.push(pick); state = afterShown(state, pick, NOW + daysLater * DAY); }
        }
        expect(asked).toEqual(["streak7", "streak14", "streak30"]);
    });

    it("asks about the biggest thing first, and does not then ask about the smaller ones", () => {
        let state = emptyState();
        expect(pickNudge({ streakDays: 31 }, state, NOW)).toBe("streak30");
        state = afterShown(state, "streak30", NOW);
        expect(pickNudge({ streakDays: 31 }, state, NOW + 2 * DAY)).toBeNull();
    });

    it("shows at most one a day", () => {
        const state = afterShown(emptyState(), "streak7", NOW);
        expect(pickNudge({ streakDays: 14 }, state, NOW + DAY - 1)).toBeNull();
        expect(pickNudge({ streakDays: 14 }, state, NOW + DAY)).toBe("streak14");
    });

    it("backs off longer each time it is dismissed: 3 days, a week, then a month", () => {
        let state = emptyState();
        const waits: number[] = [];
        for (let i = 0; i < 4; i++) {
            state = afterDismissed(state, NOW);
            waits.push((state.snoozedUntil - NOW) / DAY);
        }
        expect(waits).toEqual([3, 7, 30, 30]);
    });

    it("keeps its state across reloads, and tolerates a damaged or older value", () => {
        writeNudgeState(afterShown(emptyState(), "streak30", NOW));
        expect(readNudgeState().shown).toEqual(["streak30", "streak14", "streak7"]);

        localStorage.setItem(NUDGE_STORAGE_KEY, "{broken");
        expect(readNudgeState()).toEqual(emptyState());
        // Ids from the earlier 3-day version are ignored rather than trusted.
        localStorage.setItem(NUDGE_STORAGE_KEY, JSON.stringify({ shown: ["streak3", "level3", "streak14"], dismissals: "x", snoozedUntil: null }));
        expect(readNudgeState()).toEqual({ shown: ["streak14"], dismissals: 0, snoozedUntil: 0 });
    });
});
