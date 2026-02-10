import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { intentions, users, pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/intentions/reflect
 * Add evening reflection to an intention
 * 
 * Supports both guest and authenticated users
 * 
 * Body: { user_token: string, intention_id: string, reflection_rating: number, reflection_text?: string }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { intention_id, reflection_text, reflection_rating, user_token } = body;

        // Token-based auth
        if (!user_token) {
            return NextResponse.json(
                { success: false, error: "User token is required" },
                { status: 401 }
            );
        }

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

        let userId: string | null = null;

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
            // Allow any token format (UUID or anon_*)
            const anonymousEmail = `${user_token}@nawaetu.local`;

            if (anonymousEmail) {
                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, anonymousEmail))
                    .limit(1);

                if (user) {
                    userId = user.id;
                }
            }
        }

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User not found or invalid token" },
                { status: 404 }
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
        if (intention.userId !== userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized - this intention belongs to another user" },
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
