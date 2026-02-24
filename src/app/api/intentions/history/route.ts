import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { intentions, users, pushSubscriptions } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const providedToken = searchParams.get("user_token");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");

        const session = await getServerSession(authOptions);
        const user_token = session?.user?.id || providedToken;

        if (!user_token) {
            return NextResponse.json({ success: false, error: "User token or session required" }, { status: 401 });
        }

        let userId: string | null = null;
        let streak = 0;
        let longestStreak = 0;

        if (session && session.user && session.user.id) {
            userId = session.user.id;
            const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
            if (user) {
                streak = user.niatStreakCurrent || 0;
                longestStreak = user.niatStreakLongest || 0;
            }
        } else {
            // 1. Try to find in pushSubscriptions (FCM Token)
            const [subscription] = await db
                .select()
                .from(pushSubscriptions)
                .where(eq(pushSubscriptions.token, user_token))
                .limit(1);

            if (subscription && subscription.userId) {
                userId = subscription.userId;
                const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
                if (user) {
                    streak = user.niatStreakCurrent || 0;
                    longestStreak = user.niatStreakLongest || 0;
                }
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
                    streak = user.niatStreakCurrent || 0;
                    longestStreak = user.niatStreakLongest || 0;
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

        // Fetch intentions
        const userIntentions = await db
            .select()
            .from(intentions)
            .where(eq(intentions.userId, userId))
            .orderBy(desc(intentions.niatDate))
            .limit(limit)
            .offset(offset);

        // Count total intentions and reflections in parallel for better performance
        const [[countResult], [totalReflectedResult]] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(intentions).where(eq(intentions.userId, userId)),
            db.select({ count: sql<number>`count(*)` }).from(intentions).where(
                and(
                    eq(intentions.userId, userId),
                    sql`${intentions.reflectedAt} IS NOT NULL`
                )
            )
        ]);

        const total = Number(countResult.count);
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
                    current_streak: streak,
                    longest_streak: longestStreak,
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
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
