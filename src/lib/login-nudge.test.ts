/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import { afterDismissed, afterShown, emptyState, NUDGE_STORAGE_KEY, pickNudge, readNudgeState, writeNudgeState } from "./login-nudge";

const NOW = 1_800_000_000_000;
const DAY = 86_400_000;

describe("login nudge", () => {
    beforeEach(() => localStorage.clear());

    it("asks nothing of a guest who has nothing worth protecting yet", () => {
        expect(pickNudge({ streakDays: 2, level: 2 }, emptyState(), NOW)).toBeNull();
    });

    it("asks at 3 days, then at 7, and never twice for the same reason", () => {
        let state = emptyState();
        expect(pickNudge({ streakDays: 3, level: 1 }, state, NOW)).toBe("streak3");
        state = afterShown(state, "streak3", NOW);
        expect(pickNudge({ streakDays: 3, level: 1 }, state, NOW + 2 * DAY)).toBeNull();
        expect(pickNudge({ streakDays: 7, level: 1 }, state, NOW + 2 * DAY)).toBe("streak7");
    });

    it("asks about the biggest thing first, and does not then ask about the smaller one", () => {
        let state = emptyState();
        expect(pickNudge({ streakDays: 9, level: 1 }, state, NOW)).toBe("streak7");
        state = afterShown(state, "streak7", NOW);
        expect(pickNudge({ streakDays: 9, level: 1 }, state, NOW + 2 * DAY)).toBeNull();
    });

    it("shows at most one a day", () => {
        const state = afterShown(emptyState(), "streak3", NOW);
        expect(pickNudge({ streakDays: 3, level: 5 }, state, NOW + DAY - 1)).toBeNull();
        expect(pickNudge({ streakDays: 3, level: 5 }, state, NOW + DAY)).toBe("level3");
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

    it("keeps its state across reloads, and tolerates a damaged value", () => {
        writeNudgeState(afterShown(emptyState(), "streak7", NOW));
        expect(readNudgeState().shown).toEqual(["streak7", "streak3"]);

        localStorage.setItem(NUDGE_STORAGE_KEY, "{broken");
        expect(readNudgeState()).toEqual(emptyState());
        localStorage.setItem(NUDGE_STORAGE_KEY, JSON.stringify({ shown: ["nope", "level3"], dismissals: "x", snoozedUntil: null }));
        expect(readNudgeState()).toEqual({ shown: ["level3"], dismissals: 0, snoozedUntil: 0 });
    });
});
