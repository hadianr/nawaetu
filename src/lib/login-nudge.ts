/**
 * When to invite a guest to sign in. Guests keep every feature, so the invitation has to earn its place: it
 * appears when the guest has something worth protecting (a streak, a level), never before, never twice for the
 * same reason, and it backs off when it is dismissed. All state is on the device; nothing is sent anywhere.
 */

export const NUDGE_STORAGE_KEY = "nawaetu_login_nudge";

export type NudgeId = "streak3" | "streak7" | "level3";

export interface Stakes {
    streakDays: number;
    level: number;
}

export interface NudgeState {
    shown: NudgeId[];
    dismissals: number;
    /** Nothing is shown before this time (ms since epoch). */
    snoozedUntil: number;
}

const DAY_MS = 86_400_000;

/** Most meaningful first: a guest who reached 7 days is asked about that, not about 3. */
const TRIGGERS: Array<{ id: NudgeId; met: (stakes: Stakes) => boolean; covers: NudgeId[] }> = [
    { id: "streak7", met: (s) => s.streakDays >= 7, covers: ["streak3"] },
    { id: "streak3", met: (s) => s.streakDays >= 3, covers: [] },
    { id: "level3", met: (s) => s.level >= 3, covers: [] },
];

export const emptyState = (): NudgeState => ({ shown: [], dismissals: 0, snoozedUntil: 0 });

/** The invitation to show now, or null. At most one is chosen, and only outside a snooze. */
export function pickNudge(stakes: Stakes, state: NudgeState, now: number): NudgeId | null {
    if (now < state.snoozedUntil) return null;
    return TRIGGERS.find((trigger) => !state.shown.includes(trigger.id) && trigger.met(stakes))?.id ?? null;
}

/** Showing one counts as seen for the lesser ones it covers, and keeps the next one at least a day away. */
export function afterShown(state: NudgeState, id: NudgeId, now: number): NudgeState {
    const covers = TRIGGERS.find((trigger) => trigger.id === id)?.covers ?? [];
    return { ...state, shown: [...new Set([...state.shown, id, ...covers])], snoozedUntil: Math.max(state.snoozedUntil, now + DAY_MS) };
}

/** Each dismissal waits longer than the last: 3 days, a week, then a month. */
export function afterDismissed(state: NudgeState, now: number): NudgeState {
    const dismissals = state.dismissals + 1;
    const days = dismissals === 1 ? 3 : dismissals === 2 ? 7 : 30;
    return { ...state, dismissals, snoozedUntil: now + days * DAY_MS };
}

export function readNudgeState(): NudgeState {
    try {
        const parsed = JSON.parse(localStorage.getItem(NUDGE_STORAGE_KEY) ?? "null");
        if (!parsed || typeof parsed !== "object") return emptyState();
        return {
            shown: Array.isArray(parsed.shown) ? parsed.shown.filter((id: unknown): id is NudgeId => id === "streak3" || id === "streak7" || id === "level3") : [],
            dismissals: Number.isFinite(parsed.dismissals) ? Number(parsed.dismissals) : 0,
            snoozedUntil: Number.isFinite(parsed.snoozedUntil) ? Number(parsed.snoozedUntil) : 0,
        };
    } catch {
        return emptyState();
    }
}

export function writeNudgeState(state: NudgeState): void {
    try {
        localStorage.setItem(NUDGE_STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Storage blocked: the invitation may repeat, which is the safe direction to fail in.
    }
}
