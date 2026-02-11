import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, image } = body;

        // Validation (Basic)
        if (!name && !image) {
            return NextResponse.json({ error: "No data to update" }, { status: 400 });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (image) updateData.image = image;

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, session.user.id));

        return NextResponse.json({
            status: "success",
            message: "Profile updated successfully",
            data: updateData
        });

    } catch (e) {
        console.error("Profile update error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
