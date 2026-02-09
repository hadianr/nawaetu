import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { intentions, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * POST /api/intentions/daily
 * Set daily intention (niat)
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { niat_text, niat_date, is_private = true } = body;

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

        // Default to today if no date provided
        const intentionDate = niat_date || new Date().toISOString().split('T')[0];

        // Get user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Check if intention already exists for this date (upsert)
        const [existingIntention] = await db
            .select()
            .from(intentions)
            .where(
                and(
                    eq(intentions.userId, user.id),
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
                    userId: user.id,
                    niatText: niat_text.trim(),
                    niatType: "daily",
                    niatDate: intentionDate,
                    isPrivate: is_private,
                })
                .returning();
        }

        // Calculate and update streak
        const streakData = await calculateStreak(user.id, intentionDate);

        await db
            .update(users)
            .set({
                niatStreakCurrent: streakData.currentStreak,
                niatStreakLongest: Math.max(
                    streakData.currentStreak,
                    user.niatStreakLongest || 0
                ),
                lastNiatDate: intentionDate,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

        return NextResponse.json({
            success: true,
            data: {
                id: intention.id,
                niat_text: intention.niatText,
                niat_date: intention.niatDate,
                streak_updated: !existingIntention, // Only update streak for new intentions
                current_streak: streakData.currentStreak,
                longest_streak: Math.max(
                    streakData.currentStreak,
                    user.niatStreakLongest || 0
                ),
                niat_points_earned: existingIntention ? 0 : 10, // +10 NP for new niat
            },
        });
    } catch (error) {
        console.error("Error setting daily intention:", error);
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

    let streak = 1; // Start with today
    const current = new Date(currentDate);

    for (let i = 0; i < userIntentions.length; i++) {
        const intentionDate = new Date(userIntentions[i].niatDate);

        // Calculate expected previous date
        const expectedPrevDate = new Date(current);
        expectedPrevDate.setDate(expectedPrevDate.getDate() - streak);

        // Check if this intention is consecutive
        if (intentionDate.toISOString().split('T')[0] === expectedPrevDate.toISOString().split('T')[0]) {
            streak++;
        } else {
            // Gap found, stop counting
            break;
        }
    }

    return { currentStreak: streak };
}
