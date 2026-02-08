import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { messagingAdmin } from "@/lib/notifications/firebase-admin";

/**
 * API endpoint for daily prayer notification sync
 * Runs once per day via Vercel Cron (Hobby plan compatible)
 * Sends a silent background sync notification to keep FCM tokens fresh
 * Actual prayer time notifications are handled client-side via useAdhanNotifications hook
 */
export async function POST(req: NextRequest) {
    try {
        // Verify cron secret for security
        const authHeader = req.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("=== Daily Prayer Notification Sync Started ===");
        console.log("Time:", new Date().toISOString());

        // Get all active subscriptions
        const subscriptions = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.active, 1));

        console.log(`Found ${subscriptions.length} active subscriptions`);

        if (!messagingAdmin) {
            console.error("Firebase Admin not initialized");
            return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
        }

        const results = {
            total: subscriptions.length,
            sent: 0,
            failed: 0,
            errors: [] as string[],
        };

        // Send a daily sync notification to keep tokens fresh
        // This is a silent "health check" notification
        const syncMessage = {
            data: {
                type: "daily_sync",
                timestamp: new Date().toISOString(),
                message: "Prayer times synced for today"
            },
            // Silent notification - won't show to user
            apns: {
                payload: {
                    aps: {
                        "content-available": 1,
                    },
                },
                headers: {
                    "apns-priority": "5",
                    "apns-push-type": "background",
                },
            },
            android: {
                priority: "normal" as const,
            },
        };

        // Send sync notification to all active subscriptions
        for (const subscription of subscriptions) {
            try {
                await messagingAdmin.send({
                    ...syncMessage,
                    token: subscription.token,
                });
                results.sent++;

                // Update last used timestamp
                await db
                    .update(pushSubscriptions)
                    .set({ lastUsedAt: new Date() })
                    .where(eq(pushSubscriptions.id, subscription.id));

            } catch (error: any) {
                console.error(`Failed to send to ${subscription.id}:`, error.message);
                results.failed++;
                results.errors.push(`${subscription.id}: ${error.message}`);

                // If token is invalid, mark as inactive
                if (error.code === "messaging/invalid-registration-token" ||
                    error.code === "messaging/registration-token-not-registered") {
                    await db
                        .update(pushSubscriptions)
                        .set({ active: 0 })
                        .where(eq(pushSubscriptions.id, subscription.id));
                }
            }
        }

        console.log("=== Daily Prayer Notification Sync Completed ===");
        console.log("Results:", results);

        return NextResponse.json({
            success: true,
            message: "Daily sync completed",
            results,
            note: "Prayer time notifications are handled client-side. This is a daily token refresh.",
        });

    } catch (error: any) {
        console.error("=== Error in daily prayer sync job ===");
        console.error(error);
        return NextResponse.json({
            error: "Failed to complete daily sync",
            details: error?.message || "Unknown error",
        }, { status: 500 });
    }
}
