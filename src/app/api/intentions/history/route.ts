import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { intentions, users, pushSubscriptions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const user_token = searchParams.get("user_token");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");

        if (!user_token) {
            return NextResponse.json({ success: false, error: "User token is required" }, { status: 401 });
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
            const anonymousEmail = `${user_token}@nawaetu.local`;

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
            }
        }

        // If no user found, return empty history
        if (!userId) {
            return NextResponse.json({
                success: true,
                data: {
                    intentions: [],
                    stats: {
                        current_streak: 0,
                        total_intentions: 0,
                        reflection_rate: 0,
                    },
                    pagination: {
                        limit,
                        offset,
                        total: 0,
                        has_more: false,
                    },
                },
            });
        }

        // Fetch user stats
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        // Fetch intentions
        const userIntentions = await db
            .select()
            .from(intentions)
            .where(eq(intentions.userId, userId))
            .orderBy(desc(intentions.niatDate))
            .limit(limit)
            .offset(offset);

        // Count total intentions
        const [countResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(intentions)
            .where(eq(intentions.userId, userId));

        const total = Number(countResult.count);

        // Calculate stats
        const totalReflections = userIntentions.filter(i => i.reflectedAt).length; // Rough calc based on visible page
        // Better: count all reflected
        const [totalReflectedResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(intentions)
            .where(sql`${intentions.userId} = ${userId} AND ${intentions.reflectedAt} IS NOT NULL`);

        const totalReflected = Number(totalReflectedResult.count);
        const reflectionRate = total > 0 ? Math.round((totalReflected / total) * 100) : 0;

        return NextResponse.json({
            success: true,
            data: {
                intentions: userIntentions.map(i => ({
                    id: i.id,
                    niat_text: i.niatText,
                    niat_date: i.niatDate,
                    reflection_text: i.reflectionText,
                    reflection_rating: i.reflectionRating,
                    reflected_at: i.reflectedAt,
                })),
                stats: {
                    current_streak: user?.niatStreakCurrent || 0,
                    longest_streak: user?.niatStreakLongest || 0,
                    total_intentions: total,
                    reflection_rate: reflectionRate,
                },
                pagination: {
                    limit,
                    offset,
                    total,
                    has_more: offset + limit < total,
                },
            },
        });

    } catch (error) {
        console.error("Error fetching intention history:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
