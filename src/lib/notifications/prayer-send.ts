import { inArray, sql } from "drizzle-orm";
import type { Message, Messaging } from "firebase-admin/messaging";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { logger } from "@/lib/logger";

/** FCM accepts at most 500 messages in one sendEach call, and 500 ids keeps the SQL lists short. */
export const BATCH_SIZE = 500;

const INVALID_TOKEN_CODES = new Set(["messaging/invalid-registration-token", "messaging/registration-token-not-registered"]);

export function buildPrayerMessage(token: string, prayer: string, copy: { title: string; body: string }, origin: string): Message {
    const { title, body } = copy;
    return {
        token,
        notification: { title, body },
        data: { type: "prayer_alert", prayer, url: "/" }, // open the home page
        // CRITICAL for iOS Safari PWA & macOS
        apns: {
            headers: { "apns-priority": "10", "apns-push-type": "alert" },
            payload: { aps: { alert: { title, body }, sound: "default", badge: 1 } },
        },
        // CRITICAL for cross-platform WebPush (Chrome, Edge, Firefox, mobile Safari PWA)
        webpush: {
            headers: { Urgency: "high", TTL: "86400" },
            notification: {
                title,
                body,
                icon: "/icon-192x192.png?v=1.5.7",
                badge: "/icon-192x192.png?v=1.5.7",
                tag: `prayer-${prayer.toLowerCase()}`,
                requireInteraction: true,
                renotify: true,
                vibrate: [200, 100, 200],
                data: { url: "/" },
            } as NonNullable<Message["webpush"]>["notification"],
            fcmOptions: { link: new URL("/", origin).toString() },
        },
        android: {
            priority: "high",
            notification: { channelId: "prayer-alerts", priority: "max", visibility: "public", defaultSound: true, defaultVibrateTimings: true },
        },
    };
}

export interface SendOutcome {
    sent: string[];
    failed: string[];
    /** The subset of `failed` whose token FCM no longer knows: those subscriptions are switched off. */
    invalid: string[];
}

const chunks = <T>(items: T[]): T[][] => {
    const out: T[][] = [];
    for (let i = 0; i < items.length; i += BATCH_SIZE) out.push(items.slice(i, i + BATCH_SIZE));
    return out;
};

/**
 * Sends many alerts with a few calls instead of one call each. A call that fails as a whole (credentials, network)
 * counts all of its messages as failed but is NOT taken as proof that their tokens are dead.
 */
export async function sendAlerts(messaging: Messaging, items: Array<{ id: string; message: Message }>): Promise<SendOutcome> {
    const outcome: SendOutcome = { sent: [], failed: [], invalid: [] };
    for (const batch of chunks(items)) {
        try {
            const { responses } = await messaging.sendEach(batch.map((item) => item.message));
            batch.forEach((item, index) => {
                const response = responses[index];
                if (response?.success) {
                    outcome.sent.push(item.id);
                    return;
                }
                outcome.failed.push(item.id);
                const code = (response?.error as { code?: string } | undefined)?.code;
                if (code && INVALID_TOKEN_CODES.has(code)) outcome.invalid.push(item.id);
            });
        } catch (error) {
            logger.error("Prayer alert batch failed", error, { route: "/api/notifications/prayer-alert" });
            outcome.failed.push(...batch.map((item) => item.id));
        }
    }
    return outcome;
}

/**
 * Records, for every subscription that was just alerted, that this prayer was sent today. One statement per batch.
 * A value that is not a JSON object (older rows were stored double-encoded) is replaced rather than extended.
 */
export async function markSent(ids: string[], prayer: string, localDate: string): Promise<void> {
    for (const batch of chunks(ids)) {
        await db.update(pushSubscriptions).set({
            lastUsedAt: new Date(),
            lastNotificationSent: sql`(CASE WHEN jsonb_typeof(${pushSubscriptions.lastNotificationSent}) = 'object' THEN ${pushSubscriptions.lastNotificationSent} ELSE '{}'::jsonb END) || jsonb_build_object(${prayer}::text, ${localDate}::text)`,
        }).where(inArray(pushSubscriptions.id, batch));
    }
}

/** Switches off subscriptions whose token FCM no longer knows. */
export async function deactivate(ids: string[]): Promise<void> {
    for (const batch of chunks(ids)) {
        await db.update(pushSubscriptions).set({ active: 0 }).where(inArray(pushSubscriptions.id, batch));
    }
}
