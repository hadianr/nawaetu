import { describe, expect, it } from "vitest";
import { answersFromSessions, pruneUsage, readUsage, USAGE_WINDOW_MS } from "./mentor-usage";
import { USER_MESSAGES } from "./mentor-messages";

const now = Date.UTC(2026, 10, 17, 12, 0, 0);
const hour = 60 * 60 * 1000;

describe("mentor usage window", () => {
    it("keeps answers from the last 24 hours and drops older ones, in any order", () => {
        expect(pruneUsage([now - 25 * hour, now - hour, now - 23 * hour], now)).toEqual([now - 23 * hour, now - hour]);
        expect(pruneUsage([now - USAGE_WINDOW_MS], now)).toEqual([]);
    });

    it("does not depend on the clock day: 23:00 and 00:30 are 90 minutes apart, not a new day", () => {
        const late = Date.UTC(2026, 10, 17, 23, 0);
        const after = Date.UTC(2026, 10, 18, 0, 30);
        expect(pruneUsage([late], after)).toEqual([late]);
    });

    it("reads the stored list, as text or as an object, and ignores junk", () => {
        expect(readUsage(JSON.stringify({ answers: [now - hour, "x", null] }), now)).toEqual([now - hour]);
        expect(readUsage({ answers: [now - hour] }, now)).toEqual([now - hour]);
        expect(readUsage("not json", now)).toEqual([]);
        expect(readUsage(undefined, now)).toEqual([]);
    });

    it("carries over today's old-format count as answers given now, and drops other days", () => {
        const today = new Date(now).toDateString();
        expect(readUsage({ date: today, count: 3 }, now)).toEqual([now, now, now]);
        expect(readUsage({ date: "Mon Jan 01 2001", count: 9 }, now)).toEqual([]);
    });

    it("counts a question from saved chats only when its answer is a real one", () => {
        const sessions = [{
            messages: [
                { role: "user", content: "a", timestamp: now - 3 * hour },
                { role: "assistant", content: "Jawaban nyata", timestamp: now - 3 * hour },
                { role: "user", content: "b", timestamp: now - 2 * hour },
                { role: "assistant", content: USER_MESSAGES.en.busy, timestamp: now - 2 * hour },
                { role: "user", content: "c", timestamp: now - 30 * hour },
                { role: "assistant", content: "Terlalu lama", timestamp: now - 30 * hour },
                { role: "user", content: "d", timestamp: now - hour },
            ],
        }];
        expect(answersFromSessions(sessions, now)).toEqual([now - 3 * hour]);
    });
});
