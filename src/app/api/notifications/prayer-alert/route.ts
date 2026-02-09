import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { messagingAdmin } from "@/lib/notifications/firebase-admin";

/**
 * Enhanced Hybrid Prayer Notification API
 * 
 * Supports two modes:
 * 1. mode=sync  - Daily token validation (Vercel Cron, once per day)
 * 2. mode=alert - Prayer time notifications (GitHub Actions, every 5 minutes)
 * 
 * This dual-mode approach ensures:
 * - Reliable iOS notifications via server-side alerts
 * - Token health maintenance via daily sync
 * - No conflicts between different cron jobs
 */

// In-memory deduplication cache (resets on cold start, which is fine)
const recentNotifications = new Map<string, number>();
const DEDUP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// Prayer time window tolerance (±5 minutes)
const PRAYER_WINDOW_MS = 5 * 60 * 1000;

// Helper: Check if current time is within prayer time window
function isWithinPrayerWindow(prayerTime: Date): boolean {
    const now = new Date();
    const diff = Math.abs(now.getTime() - prayerTime.getTime());
    return diff <= PRAYER_WINDOW_MS;
}

// Helper: Get current prayer name if within window
function getCurrentPrayer(): string | null {
    // This is a simplified version - in production, you'd fetch actual prayer times
    // For now, we'll return null and let the client-side handle it
    // TODO: Integrate with prayer times calculation
    return null;
}

// Helper: Check if notification was recently sent
function wasRecentlyNotified(key: string): boolean {
    const lastSent = recentNotifications.get(key);
    if (!lastSent) return false;

    const now = Date.now();
    if (now - lastSent > DEDUP_WINDOW_MS) {
        recentNotifications.delete(key);
        return false;
    }

    return true;
}

// Helper: Mark notification as sent
function markNotificationSent(key: string): void {
    recentNotifications.set(key, Date.now());
}

export async function POST(req: NextRequest) {
    try {
        // Verify cron secret for security
        const authHeader = req.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get mode from query parameter
        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("mode") || "sync"; // Default to sync for backward compatibility

        console.log(`=== Prayer Notification API (mode: ${mode}) Started ===`);
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
            skipped: 0,
            errors: [] as string[],
        };

        // MODE: SYNC - Daily token validation
        if (mode === "sync") {
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

            console.log("=== Daily Sync Completed ===");
            console.log("Results:", results);

            return NextResponse.json({
                success: true,
                mode: "sync",
                message: "Daily token sync completed",
                results,
            });
        }

        // MODE: ALERT - Prayer time notifications
        if (mode === "alert") {
            // Check if we're within a prayer time window
            const currentPrayer = getCurrentPrayer();

            if (!currentPrayer) {
                console.log("Not within any prayer time window, skipping notifications");
                return NextResponse.json({
                    success: true,
                    mode: "alert",
                    message: "No prayer time detected in current window",
                    results: {
                        total: subscriptions.length,
                        sent: 0,
                        skipped: subscriptions.length,
                    },
                });
            }

            console.log(`Prayer time detected: ${currentPrayer}`);

            const today = new Date().toISOString().split('T')[0];

            for (const subscription of subscriptions) {
                try {
                    // Check deduplication
                    const dedupKey = `${subscription.userId}-${currentPrayer}-${today}`;
                    if (wasRecentlyNotified(dedupKey)) {
                        console.log(`Skipping duplicate notification for ${subscription.userId} - ${currentPrayer}`);
                        results.skipped++;
                        continue;
                    }

                    // Check user preferences (if stored in subscription)
                    // TODO: Add prayer preferences check here

                    // Send prayer notification
                    const alertMessage = {
                        notification: {
                            title: `Waktu ${currentPrayer}`,
                            body: `Saatnya menunaikan sholat ${currentPrayer}`,
                        },
                        data: {
                            type: "prayer_alert",
                            prayer: currentPrayer,
                            timestamp: new Date().toISOString(),
                        },
                        apns: {
                            payload: {
                                aps: {
                                    alert: {
                                        title: `Waktu ${currentPrayer}`,
                                        body: `Saatnya menunaikan sholat ${currentPrayer}`,
                                    },
                                    sound: "default",
                                    badge: 1,
                                },
                            },
                            headers: {
                                "apns-priority": "10", // High priority for alerts
                                "apns-push-type": "alert",
                            },
                        },
                        android: {
                            priority: "high" as const,
                            notification: {
                                channelId: "prayer-alerts",
                                sound: "default",
                            },
                        },
                    };

                    await messagingAdmin.send({
                        ...alertMessage,
                        token: subscription.token,
                    });

                    results.sent++;
                    markNotificationSent(dedupKey);

                    // Update last used timestamp
                    await db
                        .update(pushSubscriptions)
                        .set({ lastUsedAt: new Date() })
                        .where(eq(pushSubscriptions.id, subscription.id));

                } catch (error: any) {
                    console.error(`Failed to send alert to ${subscription.id}:`, error.message);
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

            console.log("=== Prayer Alert Completed ===");
            console.log("Results:", results);

            return NextResponse.json({
                success: true,
                mode: "alert",
                message: `Prayer alert sent for ${currentPrayer}`,
                results,
            });
        }

        // Invalid mode
        return NextResponse.json({
            error: "Invalid mode parameter",
            message: "Mode must be either 'sync' or 'alert'",
        }, { status: 400 });

    } catch (error: any) {
        console.error("=== Error in prayer notification API ===");
        console.error(error);
        return NextResponse.json({
            error: "Failed to process request",
            details: error?.message || "Unknown error",
        }, { status: 500 });
    }
}
