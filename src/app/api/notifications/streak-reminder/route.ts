import { NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions, userStreakState, users } from "@/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { getMessaging } from "@/lib/notifications/firebase-admin";
import { getStreakNotificationCopy } from "@/lib/notifications/push-copy";

function parseMap(value: unknown): Record<string, string> {
  if (!value) return {};
  if (typeof value === "object") return value as Record<string, string>;
  try { return JSON.parse(String(value)); } catch { return {}; }
}

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "Reminder scheduler is not configured" }, { status: 503 });
  }
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const messaging = await getMessaging();
  if (!messaging) return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });

  const subscriptions = await db.select({
    id: pushSubscriptions.id,
    token: pushSubscriptions.token,
    timezone: pushSubscriptions.timezone,
    lastNotificationSent: pushSubscriptions.lastNotificationSent,
    userId: pushSubscriptions.userId,
    streak: userStreakState,
    settings: users.settings,
  }).from(pushSubscriptions)
    .innerJoin(userStreakState, eq(userStreakState.userId, pushSubscriptions.userId))
    .innerJoin(users, eq(users.id, pushSubscriptions.userId))
    .where(and(eq(pushSubscriptions.active, 1), isNotNull(pushSubscriptions.userId)));

  const results = { sent: 0, skipped: 0, failed: 0, invalidTokens: 0 };
  for (const subscription of subscriptions) {
    const settings = subscription.settings as Record<string, unknown> | null;
    if (settings?.streakReminderEnabled !== true || subscription.streak.currentDays <= 0) {
      results.skipped++;
      continue;
    }
    const timezone = subscription.timezone || "UTC";
    const localDate = new Date().toLocaleDateString("sv-SE", { timeZone: timezone });
    const lastSent = parseMap(subscription.lastNotificationSent);
    if (lastSent.streak === localDate || subscription.streak.lastStreakDate === localDate) {
      results.skipped++;
      continue;
    }
    try {
      const copy = getStreakNotificationCopy(settings?.locale, subscription.streak.currentDays);
      await messaging.send({
        token: subscription.token,
        notification: {
          title: copy.title,
          body: copy.body,
        },
        data: { type: "streak_reminder", url: "/" },
        webpush: {
          notification: {
            title: copy.title,
            body: copy.body,
            icon: "/icon-192x192.png",
            tag: "streak-reminder",
          },
          fcmOptions: { link: "/" },
        },
      });
      await db.update(pushSubscriptions).set({
        lastUsedAt: new Date(),
        lastNotificationSent: { ...lastSent, streak: localDate },
      }).where(eq(pushSubscriptions.id, subscription.id));
      results.sent++;
    } catch (error: any) {
      results.failed++;
      if (error.code === "messaging/invalid-registration-token" || error.code === "messaging/registration-token-not-registered") {
        results.invalidTokens++;
        await db.update(pushSubscriptions).set({ active: 0 }).where(eq(pushSubscriptions.id, subscription.id));
      }
    }
  }
  return NextResponse.json({ success: true, results });
}
