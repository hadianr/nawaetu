import { guestHeaders } from "@/lib/guest-secret-client";

const KEY = "nawaetu_intention_pending";

export interface PendingIntention {
    userToken: string;
    text: string;
    date: string; // YYYY-MM-DD, the user's own day
}

export function savePendingIntention(pending: PendingIntention): void {
    try {
        localStorage.setItem(KEY, JSON.stringify(pending));
    } catch {
        // Storage blocked: nothing more can be kept.
    }
}

export function readPendingIntention(): PendingIntention | null {
    try {
        const raw = localStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && typeof parsed.text === "string" && typeof parsed.date === "string" && typeof parsed.userToken === "string" ? parsed : null;
    } catch {
        return null;
    }
}

export function clearPendingIntention(): void {
    try {
        localStorage.removeItem(KEY);
    } catch {
        // ignore
    }
}

export interface FlushResult {
    sent: boolean;
    points: number;
    date?: string;
}

/**
 * Sends an intention that was written offline. It stays saved when the request does not get through or
 * the server is busy, and is dropped only when the server refuses it for good (a bad request).
 */
export async function flushPendingIntention(): Promise<FlushResult> {
    const pending = readPendingIntention();
    if (!pending) return { sent: false, points: 0 };

    try {
        const response = await fetch("/api/intentions/daily", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...guestHeaders() },
            body: JSON.stringify({
                user_token: pending.userToken,
                intention_text: pending.text,
                intention_date: pending.date,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }),
        });
        if (response.status === 429 || response.status >= 500) return { sent: false, points: 0 };

        const data = await response.json().catch(() => null);
        if (response.ok && data?.success) {
            clearPendingIntention();
            return { sent: true, points: Number(data.data?.intention_points_earned) || 0, date: pending.date };
        }
        clearPendingIntention(); // refused for good (empty text, too long): retrying cannot help
        return { sent: false, points: 0 };
    } catch {
        return { sent: false, points: 0 };
    }
}
