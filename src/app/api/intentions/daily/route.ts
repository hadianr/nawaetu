import { NextRequest, NextResponse } from "next/server";
import { db, checkConnection } from "@/db";
import { intentions, users, pushSubscriptions } from "@/db/schema";
import { eq, and, sql, gte, lt } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
        // Health check
        const dbStatus = await checkConnection();
        if (!dbStatus.success) {
            return NextResponse.json(
                { success: false, error: "Database offline" },
                { status: 503 }
            );
        }

        const body = await req.json();
        const { niat_text, niat_date, is_private = true, user_token: providedToken } = body;

        // Try both session and token
        const session = await getServerSession(authOptions);
        const user_token = session?.user?.id || providedToken;

        // Token-based auth (FCM token or anonymous ID)
        if (!user_token) {
            return NextResponse.json(
                { success: false, error: "User token or session is required" },
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

        // Ensure date is handled as a Date object for timestamp column
        let intentionDateValue: Date;
        let todayStr: string;

        if (niat_date) {
            intentionDateValue = new Date(niat_date);
            todayStr = intentionDateValue.toISOString().split('T')[0];
        } else {
            intentionDateValue = new Date();
            todayStr = intentionDateValue.toISOString().split('T')[0];
        }

        let userId: string;

        if (session && session.user && session.user.id) {
            userId = session.user.id;
        } else {
            userId = await getUserIdFromToken(user_token);
        }

        async function getUserIdFromToken(token: string): Promise<string> {
            // Check if this is an FCM token (from push subscription)
            const [subscription] = await db
                .select()
                .from(pushSubscriptions)
                .where(eq(pushSubscriptions.token, token))
                .limit(1);

            if (subscription && subscription.userId) {
                return subscription.userId;
            }

            // Anonymous user
            const anonymousEmail = `${token}@nawaetu.local`;
            const [existingUser] = await db
                .select()
                .from(users)
                .where(eq(users.email, anonymousEmail))
                .limit(1);

            if (existingUser) {
                return existingUser.id;
            }

            // Create new anonymous user
            const [newUser] = await db
                .insert(users)
                .values({
                    email: anonymousEmail,
                    name: "User",
                    niatStreakCurrent: 0,
                    niatStreakLongest: 0,
                })
                .returning();

            return newUser.id;
        }

        const startOfToday = new Date(todayStr);
        startOfToday.setUTCHours(0, 0, 0, 0);
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setUTCDate(startOfToday.getUTCDate() + 1);

        const [existingIntention] = await db
            .select()
            .from(intentions)
            .where(
                and(
                    eq(intentions.userId, userId),
                    gte(intentions.niatDate, startOfToday),
                    lt(intentions.niatDate, startOfTomorrow)
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
                    niatDate: intentionDateValue,
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
                    niatDate: intentionDateValue,
                    isPrivate: is_private,
                })
                .returning();
        }

        // Calculate and update streak
        const streakData = await calculateStreak(userId, todayStr);

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
                lastNiatDate: todayStr,
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
                auth_type: session ? 'session' : (providedToken ? 'token' : 'unknown'),
            },
        });
    } catch (error: any) {
        // Log error for debugging
        console.error("Error in POST /api/intentions/daily:", error);

        return NextResponse.json(
            { success: false, error: "Internal server error" },
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
    // Optimization: Use Set for O(1) lookup
    const intentionDates = new Set(userIntentions.map(i => {
        const d = new Date(i.niatDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }));

    // We start checking from the current intention backwards
    let checkDate = new Date(targetDate);

    // Safety loop limit
    while (streak < 3650) {
        if (intentionDates.has(checkDate.getTime())) {
            streak++;
            // Go to previous day
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return { currentStreak: streak };
}
