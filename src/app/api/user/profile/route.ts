import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users, type NewUser, genderEnum, archetypeEnum } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, image, gender, archetype } = body;

        // Initial check if any field is provided (though specific checks below handle this too)
        if (name === undefined && image === undefined && gender === undefined && archetype === undefined) {
            return NextResponse.json({ error: "No data to update" }, { status: 400 });
        }

        const updateData: Partial<NewUser> = {};

        // 1. Validate Name
        if (name !== undefined && name !== null) {
            if (typeof name !== 'string') {
                return NextResponse.json({ error: "Name must be a string" }, { status: 400 });
            }
            if (name.length > 100) {
                 return NextResponse.json({ error: "Name exceeds 100 characters" }, { status: 400 });
            }
            if (name.trim().length > 0) {
                updateData.name = name.trim();
            }
        }

        // 2. Validate Image
        if (image !== undefined && image !== null) {
            if (typeof image !== 'string') {
                return NextResponse.json({ error: "Image must be a URL string" }, { status: 400 });
            }
            if (image.length > 500) {
                return NextResponse.json({ error: "Image URL exceeds 500 characters" }, { status: 400 });
            }
            if (image.trim().length > 0) {
                // Basic URL check to prevent storing non-URL strings
                if (!image.startsWith('http') && !image.startsWith('/') && !image.startsWith('data:')) {
                     return NextResponse.json({ error: "Invalid image URL format" }, { status: 400 });
                }
                updateData.image = image.trim();
            }
        }

        // 3. Validate Gender
        if (gender !== undefined && gender !== null) {
             const validGenders = genderEnum.enumValues;
             if (typeof gender !== 'string' || !(validGenders as readonly string[]).includes(gender)) {
                 return NextResponse.json({ error: "Invalid gender selection" }, { status: 400 });
             }
             updateData.gender = gender as "male" | "female";
        }

        // 4. Validate Archetype
        if (archetype !== undefined && archetype !== null) {
             const validArchetypes = archetypeEnum.enumValues;
             if (typeof archetype !== 'string' || !(validArchetypes as readonly string[]).includes(archetype)) {
                 return NextResponse.json({ error: "Invalid archetype selection" }, { status: 400 });
             }
             updateData.archetype = archetype as "beginner" | "striver" | "dedicated";
        }

        if (Object.keys(updateData).length === 0) {
             return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, session.user.id));

        return NextResponse.json({
            status: "success",
            message: "Profile updated successfully",
            data: updateData
        });

    } catch (e) {
        console.error("Error updating profile:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
