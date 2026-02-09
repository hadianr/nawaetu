import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { intentions, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/intentions/today
 * Get today's intention status
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

        // Get today's date
        const today = new Date().toISOString().split('T')[0];

        // Check if intention exists for today
        const [todayIntention] = await db
            .select()
            .from(intentions)
            .where(
                and(
                    eq(intentions.userId, user.id),
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
                    streak: user.niatStreakCurrent || 0,
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
                streak: user.niatStreakCurrent || 0,
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
