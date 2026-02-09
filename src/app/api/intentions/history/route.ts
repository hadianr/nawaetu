import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { intentions, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

/**
 * GET /api/intentions/history?limit=30&offset=0
 * Get user's intention history with stats
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get query params
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "30");
        const offset = parseInt(searchParams.get("offset") || "0");

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

        // Get intentions
        const userIntentions = await db
            .select({
                id: intentions.id,
                niat_text: intentions.niatText,
                niat_date: intentions.niatDate,
                reflection_text: intentions.reflectionText,
                reflection_rating: intentions.reflectionRating,
                reflected_at: intentions.reflectedAt,
            })
            .from(intentions)
            .where(eq(intentions.userId, user.id))
            .orderBy(desc(intentions.niatDate))
            .limit(limit)
            .offset(offset);

        // Get total count
        const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(intentions)
            .where(eq(intentions.userId, user.id));

        // Calculate reflection rate
        const [{ reflectedCount }] = await db
            .select({ reflectedCount: sql<number>`count(*)` })
            .from(intentions)
            .where(
                sql`${intentions.userId} = ${user.id} AND ${intentions.reflectedAt} IS NOT NULL`
            );

        const reflectionRate = count > 0 ? Math.round((reflectedCount / count) * 100) : 0;

        return NextResponse.json({
            success: true,
            data: {
                intentions: userIntentions,
                stats: {
                    current_streak: user.niatStreakCurrent || 0,
                    longest_streak: user.niatStreakLongest || 0,
                    total_intentions: count,
                    reflection_rate: reflectionRate,
                },
                pagination: {
                    limit,
                    offset,
                    total: count,
                    has_more: offset + limit < count,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching intention history:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
