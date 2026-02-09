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
    try {
        // Get query params
        const { searchParams } = new URL(req.url);
        const user_token = searchParams.get("user_token");

        // Token-based auth
        if (!user_token) {
            return NextResponse.json(
                { success: false, error: "User token is required" },
                { status: 401 }
            );
        }

        let userId: string | null = null;
        let streak = 0;

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
            // Anonymous format: email = token + "@nawaetu.local"
            const anonymousEmail = user_token.startsWith("anon_")
                ? `${user_token}@nawaetu.local`
                : null;

            if (anonymousEmail) {
                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, anonymousEmail))
                    .limit(1);

                if (user) {
                    userId = user.id;
                    streak = user.niatStreakCurrent || 0;
                }
            } else if (subscription) {
                // Subscription exists but no userId linked yet (very rare edge case)
                // Treat as guest who hasn't set intention
            }
        }

        if (!userId) {
            // User not found or hasn't created any data yet
            // Return empty state instead of 404, so frontend can handle it gracefully (First Time User)
            return NextResponse.json({
                success: true,
                data: {
                    has_intention: false,
                    has_reflection: false,
                    streak: 0,
                },
            });
        }

        // Get user stats if we have userId (refresh streak)
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        // Get today's date
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

        if (!todayIntention) {
            return NextResponse.json({
                success: true,
                data: {
                    has_intention: false,
                    has_reflection: false,
                    streak: user?.niatStreakCurrent || 0,
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
                streak: user?.niatStreakCurrent || 0,
            },
        });
    } catch (error) {
        console.error("Error fetching today's intention:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
