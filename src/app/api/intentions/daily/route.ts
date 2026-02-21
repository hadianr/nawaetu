import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { intentions, users, pushSubscriptions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * POST /api/intentions/daily
 * Set daily intention (niat)
 * 
 * Supports:
 * - Users with notifications (FCM token)
 * - Users without notifications (anonymous localStorage ID)
 * - Future authenticated users
 * 
 * Body: { user_token: string, niat_text: string, niat_date?: string, is_private?: boolean }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { niat_text, niat_date, is_private = true, user_token } = body;

        // Token-based auth (FCM token or anonymous ID)
        if (!user_token) {
            return NextResponse.json(
                { success: false, error: "User token is required" },
                { status: 401 }
            );
        }

        // Validation
        if (!niat_text || niat_text.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: "Niat text is required" },
                { status: 400 }
            );
        }

        if (niat_text.length > 500) {
            return NextResponse.json(
                { success: false, error: "Niat text must be 500 characters or less" },
                { status: 400 }
            );
        }

        // Validate user_token format and length to prevent DOS/Storage exhaustion
        if (typeof user_token !== 'string' || user_token.length > 255) {
            return NextResponse.json(
                { success: false, error: "User token must be a string of 255 characters or less" },
                { status: 400 }
            );
        }

        // Ensure date is in YYYY-MM-DD format
        let intentionDate: string;
        if (niat_date) {
            // Take the date part only if user sends ISO string
            intentionDate = niat_date.split('T')[0];
        } else {
            intentionDate = new Date().toISOString().split('T')[0];
        }

        let userId: string;

        // Check if this is an FCM token (from push subscription)
        const [subscription] = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.token, user_token))
            .limit(1);

        if (subscription) {
            // User has notifications enabled
            if (subscription.userId) {
                userId = subscription.userId;
            } else {
                // Create user and link to subscription
                // Try catch for unique constraint
                try {
                    const [newUser] = await db
                        .insert(users)
                        .values({
                            email: `guest_${user_token.substring(0, 16)}@nawaetu.local`,
                            name: "Guest User",
                            niatStreakCurrent: 0,
                            niatStreakLongest: 0,
                        })
                        .returning();
                    userId = newUser.id;
                } catch (e: any) {
                    // Possible race condition or duplicate email, try to fetch existing
                    const [existing] = await db.select().from(users).where(eq(users.email, `guest_${user_token.substring(0, 16)}@nawaetu.local`)).limit(1);
                    if (existing) {
                        userId = existing.id;
                    } else {
                        throw e; // Real error
                    }
                }

                await db
                    .update(pushSubscriptions)
                    .set({ userId: userId })
                    .where(eq(pushSubscriptions.token, user_token));
            }
        } else {
            // Anonymous user (no notifications) - use token as identifier
            const anonymousEmail = `${user_token}@nawaetu.local`;

            // Check if user already exists
            const [existingUser] = await db
                .select()
                .from(users)
                .where(eq(users.email, anonymousEmail))
                .limit(1);

            if (existingUser) {
                userId = existingUser.id;
            } else {
                // Create new anonymous user
                try {
                    const [newUser] = await db
                        .insert(users)
                        .values({
                            email: anonymousEmail,
                            name: "Anonymous User",
                            niatStreakCurrent: 0,
                            niatStreakLongest: 0,
                        })
                        .returning();
                    userId = newUser.id;
                } catch (e: any) {
                    // Possible race condition, try to fetch existing
                    const [existing] = await db.select().from(users).where(eq(users.email, anonymousEmail)).limit(1);
                    if (existing) {
                        userId = existing.id;
                    } else {
                        throw e;
                    }
                }
            }
        }

        // Check if intention already exists for this date (upsert)
        const [existingIntention] = await db
            .select()
            .from(intentions)
            .where(
                and(
                    eq(intentions.userId, userId),
                    eq(intentions.niatDate, intentionDate)
                )
            )
            .limit(1);

        let intention;

        if (existingIntention) {
            // Update existing intention
            [intention] = await db
                .update(intentions)
                .set({
                    niatText: niat_text.trim(),
                    isPrivate: is_private,
                    updatedAt: new Date(),
                })
                .where(eq(intentions.id, existingIntention.id))
                .returning();
        } else {
            // Create new intention
            [intention] = await db
                .insert(intentions)
                .values({
                    userId: userId,
                    niatText: niat_text.trim(),
                    // niatType default handled by DB or explicit here
                    niatType: "daily",
                    niatDate: intentionDate,
                    isPrivate: is_private,
                })
                .returning();
        }

        // Calculate and update streak
        const streakData = await calculateStreak(userId, intentionDate);

        // Get current user to check longest streak
        const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        const newLongestStreak = Math.max(
            streakData.currentStreak,
            currentUser?.niatStreakLongest || 0
        );

        await db
            .update(users)
            .set({
                niatStreakCurrent: streakData.currentStreak,
                niatStreakLongest: newLongestStreak,
                lastNiatDate: intentionDate,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        return NextResponse.json({
            success: true,
            data: {
                id: intention.id,
                niat_text: intention.niatText,
                niat_date: intention.niatDate,
                is_new: !existingIntention,
                streak_updated: !existingIntention,
                current_streak: streakData.currentStreak,
                longest_streak: newLongestStreak,
                niat_points_earned: existingIntention ? 0 : 10, // +10 NP for new niat
                user_type: subscription ? 'guest_with_notifications' : 'anonymous',
            },
        });
    } catch (error: any) {
        // Log error for debugging
        console.error("Error in POST /api/intentions/daily:", error);

        // Return generic error message to prevent information leakage
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}

/**
 * Calculate niat streak based on consecutive days
 */
async function calculateStreak(userId: string, currentDate: string): Promise<{
    currentStreak: number;
}> {
    // Get all intentions for this user, ordered by date descending
    const userIntentions = await db
        .select({ niatDate: intentions.niatDate })
        .from(intentions)
        .where(eq(intentions.userId, userId))
        .orderBy(sql`${intentions.niatDate} DESC`);

    if (userIntentions.length === 0) {
        return { currentStreak: 1 }; // First intention
    }

    let streak = 0;
    // Normalize dates to midnight for comparison
    const targetDate = new Date(currentDate);
    targetDate.setHours(0, 0, 0, 0);

    // Convert all intention dates to YYYY-MM-DD timestamps
    const intentionDates = userIntentions.map(i => {
        const d = new Date(i.niatDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    });

    // We start checking from the current intention backwards
    let checkDate = new Date(targetDate);

    // Safety loop limit
    while (streak < 3650) {
        if (intentionDates.includes(checkDate.getTime())) {
            streak++;
            // Go to previous day
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return { currentStreak: streak };
}
