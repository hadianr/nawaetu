import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { intentions } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/intentions/reflect
 * Add evening reflection to an intention
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
        const { intention_id, reflection_text, reflection_rating } = body;

        // Validation
        if (!intention_id) {
            return NextResponse.json(
                { success: false, error: "Intention ID is required" },
                { status: 400 }
            );
        }

        if (!reflection_rating || reflection_rating < 1 || reflection_rating > 5) {
            return NextResponse.json(
                { success: false, error: "Reflection rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        if (reflection_text && reflection_text.length > 1000) {
            return NextResponse.json(
                { success: false, error: "Reflection text must be 1000 characters or less" },
                { status: 400 }
            );
        }

        // Get intention and verify ownership
        const [intention] = await db
            .select()
            .from(intentions)
            .where(eq(intentions.id, intention_id))
            .limit(1);

        if (!intention) {
            return NextResponse.json(
                { success: false, error: "Intention not found" },
                { status: 404 }
            );
        }

        // Verify user owns this intention
        const [user] = await db.query.users.findMany({
            where: (users, { eq }) => eq(users.email, session.user.email!),
            limit: 1,
        });

        if (!user || intention.userId !== user.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Update intention with reflection
        const [updatedIntention] = await db
            .update(intentions)
            .set({
                reflectionText: reflection_text?.trim() || null,
                reflectionRating: reflection_rating,
                reflectedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(intentions.id, intention_id))
            .returning();

        return NextResponse.json({
            success: true,
            data: {
                id: updatedIntention.id,
                reflection_rating: updatedIntention.reflectionRating,
                reflection_text: updatedIntention.reflectionText,
                reflected_at: updatedIntention.reflectedAt,
                niat_points_earned: 5, // +5 NP for reflection
            },
        });
    } catch (error) {
        console.error("Error adding reflection:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
