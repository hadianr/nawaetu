import { isMentorNonAnswer } from "./mentor-messages";

/**
 * The app counts the mentor's answers over a rolling 24 hours, like the server does. No clock day is involved,
 * so it is the same for a user in Jakarta, London or anywhere else, and changing the device's timezone gains nothing.
 */
export const USAGE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Keeps the times that are still inside the window, oldest first. */
export function pruneUsage(answers: number[], now: number): number[] {
    return answers.filter((at) => at > now - USAGE_WINDOW_MS && at <= now).sort((a, b) => a - b);
}

/**
 * Reads what the app stored. Older versions stored `{ date, count }` for one calendar day; those answers are kept
 * as if given now, so an upgrade never hands out a fresh allowance.
 */
export function readUsage(raw: unknown, now: number): number[] {
    let value = raw;
    if (typeof value === "string") {
        try { value = JSON.parse(value); } catch { return []; }
    }
    if (!value || typeof value !== "object") return [];
    const stored = value as { answers?: unknown; date?: unknown; count?: unknown };
    if (Array.isArray(stored.answers)) return pruneUsage(stored.answers.filter((at): at is number => typeof at === "number"), now);
    if (stored.date === new Date(now).toDateString() && typeof stored.count === "number" && stored.count > 0) {
        return Array.from({ length: Math.min(Math.floor(stored.count), 100) }, () => now);
    }
    return [];
}

/** When each question that got a real answer was asked, from saved chats, inside the window. */
export function answersFromSessions(
    sessions: { messages?: { role: string; content: string; timestamp: number }[] }[],
    now: number,
): number[] {
    const answered: number[] = [];
    for (const session of sessions) {
        const messages = Array.isArray(session.messages) ? session.messages : [];
        messages.forEach((message, i) => {
            const reply = messages[i + 1];
            if (message.role === "user" && reply?.role === "assistant" && !isMentorNonAnswer(reply.content)) answered.push(message.timestamp);
        });
    }
    return pruneUsage(answered, now);
}
