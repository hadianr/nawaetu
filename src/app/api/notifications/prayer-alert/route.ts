import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { messagingAdmin } from "@/lib/notifications/firebase-admin";

// Prayer time calculation helper (simplified - you may want to use a library like adhan-js)
interface PrayerTimes {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
}

/**
 * API endpoint for sending daily prayer alerts
 * This should be called by a cron job (e.g., Vercel Cron)
 */
export async function POST(req: NextRequest) {
    try {
        // Verify cron secret for security
        const authHeader = req.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("=== Daily Prayer Alert Job Started ===");
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

        // Get current prayer time (simplified - in production, calculate based on location)
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        let currentPrayer: keyof PrayerTimes | null = null;

        // Determine which prayer time it is (example times for Jakarta)
        // In production, calculate based on user's location and timezone
        if (currentHour === 4 && currentMinute >= 30 && currentMinute < 35) {
            currentPrayer = "fajr";
        } else if (currentHour === 12 && currentMinute >= 0 && currentMinute < 5) {
            currentPrayer = "dhuhr";
        } else if (currentHour === 15 && currentMinute >= 15 && currentMinute < 20) {
            currentPrayer = "asr";
        } else if (currentHour === 18 && currentMinute >= 0 && currentMinute < 5) {
            currentPrayer = "maghrib";
        } else if (currentHour === 19 && currentMinute >= 15 && currentMinute < 20) {
            currentPrayer = "isha";
        }

        if (!currentPrayer) {
            console.log("Not a prayer time notification window");
            return NextResponse.json({
                message: "Not a prayer time notification window",
                currentTime: `${currentHour}:${currentMinute}`,
            });
        }

        console.log(`Current prayer time: ${currentPrayer}`);

        // Prayer names in Indonesian
        const prayerNames: Record<keyof PrayerTimes, string> = {
            fajr: "Subuh",
            dhuhr: "Dzuhur",
            asr: "Ashar",
            maghrib: "Maghrib",
            isha: "Isya",
        };

        // Send notifications to eligible users
        for (const subscription of subscriptions) {
            try {
                // Check if user has preferences
                let shouldSend = true;
                if (subscription.prayerPreferences) {
                    try {
                        const prefs = JSON.parse(subscription.prayerPreferences);
                        shouldSend = prefs[currentPrayer] === true;
                    } catch (e) {
                        console.error("Failed to parse preferences:", e);
                    }
                }

                if (!shouldSend) {
                    results.skipped++;
                    continue;
                }

                // Send notification
                const message = {
                    notification: {
                        title: `🕌 Waktu ${prayerNames[currentPrayer]}`,
                        body: `Sudah masuk waktu sholat ${prayerNames[currentPrayer]}. Yuk, segera tunaikan sholat!`,
                    },
                    data: {
                        type: "prayer_alert",
                        prayer: currentPrayer,
                        timestamp: new Date().toISOString(),
                    },
                    token: subscription.token,
                };

                await messagingAdmin.send(message);
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

        console.log("=== Daily Prayer Alert Job Completed ===");
        console.log("Results:", results);

        return NextResponse.json({
            success: true,
            prayer: currentPrayer,
            results,
        });

    } catch (error: any) {
        console.error("=== Error in daily prayer alert job ===");
        console.error(error);
        return NextResponse.json({
            error: "Failed to send prayer alerts",
            details: error?.message || "Unknown error",
        }, { status: 500 });
    }
}
