import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { intentions, users, pushSubscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/intentions/today?user_token=xxx
 * Get today's intention status
 * 
 * Supports both guest and authenticated users
 */
export async function GET(req: NextRequest) {
    const startTime = Date.now();
    const { searchParams } = req.nextUrl;
    const user_token = searchParams.get("user_token");

    try {
        if (!user_token) {
            return NextResponse.json(
                { success: false, error: "User token is required" },
                { status: 401 }
            );
        }

        let userId: string | null = null;
        let userData: any = null;

        // 1. Try to find in pushSubscriptions (FCM Token)
        const [subscription] = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.token, user_token))
            .limit(1);

        if (subscription && subscription.userId) {
            userId = subscription.userId;
        } else {
            // 2. Try to find anonymous user
            const anonymousEmail = `${user_token}@nawaetu.local`;
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.email, anonymousEmail))
                .limit(1);

            if (user) {
                userId = user.id;
                userData = user;
            }
        }

        if (!userId) {
            return NextResponse.json({
                success: true,
                data: {
                    has_intention: false,
                    has_reflection: false,
                    streak: 0,
                },
            });
        }

        // Fetch user object if we don't have it yet (was from subscription)
        if (!userData) {
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);
            userData = user;
        }

        // Get today's date in UTC (matched with DB date type)
        const today = new Date().toISOString().split('T')[0];

        // Check if intention exists for today
        const [todayIntention] = await db
            .select()
            .from(intentions)
            .where(
                and(
                    eq(intentions.userId, userId),
                    eq(intentions.niatDate, today)
                )
            )
            .limit(1);

        const duration = Date.now() - startTime;
        if (duration > 500) {
            console.warn(`[GET /api/intentions/today] Slow request: ${duration}ms for token ${user_token}`);
        }

        if (!todayIntention) {
            return NextResponse.json({
                success: true,
                data: {
                    has_intention: false,
                    has_reflection: false,
                    streak: userData?.niatStreakCurrent || 0,
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                has_intention: true,
                intention: {
                    id: todayIntention.id,
                    niat_text: todayIntention.niatText,
                    niat_date: todayIntention.niatDate,
                },
                has_reflection: todayIntention.reflectedAt !== null,
                reflection: todayIntention.reflectedAt ? {
                    rating: todayIntention.reflectionRating,
                    text: todayIntention.reflectionText,
                    reflected_at: todayIntention.reflectedAt,
                } : null,
                streak: userData?.niatStreakCurrent || 0,
            },
        });
    } catch (error) {
        console.error("[GET /api/intentions/today] Failed:", {
            error: error instanceof Error ? error.message : "Non-error object",
            stack: error instanceof Error ? error.stack : undefined,
            user_token
        });

        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
