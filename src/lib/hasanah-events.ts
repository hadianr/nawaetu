import { dhikrMilestones } from "@/data/dhikrMilestones";
import { STREAK_MILESTONES } from "@/data/streak-milestones";
import type { ProgressionSource } from "@/core/repositories/progression.repository";

export interface HasanahEventInput {
    kind: string;
    key: string;
    amount: number;
    localDate: string;
}

export interface ValidatedHasanahEvent {
    source: ProgressionSource;
    sourceId: string;
    hasanah: number;
    localDate: string;
    countsForStreak: boolean;
    /** "once": the first award stands. "raise": the amount may grow during the day (reading time). */
    mode: "once" | "raise";
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_DAY = /^\d{4}-(?:[1-9]|[12]\d|30)$/;

/**
 * The server decides what each kind of award is worth. A client only says what happened; it can never
 * choose the amount, so a modified app cannot mint points. Every id ends with ":<local date>" except the
 * lifetime awards (milestones), which are unique for ever and are not a day of activity.
 */
export function validateHasanahEvent(input: HasanahEventInput): ValidatedHasanahEvent | null {
    const { kind, key, amount, localDate } = input;
    if (!DATE.test(localDate) || typeof key !== "string" || key.length > 40 || !Number.isInteger(amount) || amount < 0) return null;

    const daily = (source: ProgressionSource, valid: boolean, mode: "once" | "raise" = "once"): ValidatedHasanahEvent | null =>
        valid ? { source, sourceId: `${kind}:${key}:${localDate}`, hasanah: amount, localDate, countsForStreak: true, mode } : null;

    switch (kind) {
        case "taraweh": return daily("mission", YEAR_DAY.test(key) && amount === 15);
        case "fasting": return daily("mission", YEAR_DAY.test(key) && amount === 20);
        case "lailatul": return daily("mission", YEAR_DAY.test(key) && amount === 50);
        case "khatamah": return daily("mission", /^\d{4}-(?:[1-9]|[12]\d|30)$/.test(key) && amount > 0 && amount % 20 === 0 && amount <= 600);
        case "sirah_quiz": return daily("mission", key === "daily" && amount > 0 && amount % 10 === 0 && amount <= 200);
        case "dhikr_completion": return daily("dhikr", /^(?:[1-9]|1\d|20)$/.test(key) && amount === 50);
        case "quran_time": return daily("quran", key === "time" && amount <= 600, "raise");
        case "dhikr_milestone": {
            const milestone = dhikrMilestones.find((item) => String(item.target) === key);
            return milestone && amount === milestone.reward
                ? { source: "dhikr", sourceId: `dhikr_milestone:${key}`, hasanah: amount, localDate, countsForStreak: false, mode: "once" }
                : null;
        }
        case "streak_milestone": {
            const milestone = STREAK_MILESTONES.find((item) => String(item.days) === key);
            return milestone && amount === milestone.xp
                ? { source: "streak_milestone", sourceId: `streak_milestone:${key}`, hasanah: amount, localDate, countsForStreak: false, mode: "once" }
                : null;
        }
        default: return null;
    }
}
