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
        const { settings } = body;

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json({ error: "Invalid settings data" }, { status: 400 });
        }

        // Ideally we fetch existing settings and merge, 
        // but for now we trust the client sends the relevant subset or full set
        // Let's first get existing to merge (safer)
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { settings: true }
        });

        const currentSettings = user?.settings && typeof user.settings === 'string'
            ? JSON.parse(user.settings)
            : (user?.settings || {});

        const newSettings = {
            ...currentSettings,
            ...settings
        };

        await db.update(users)
            .set({ settings: JSON.stringify(newSettings) })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({
            status: "success",
            message: "Settings updated successfully",
            data: newSettings
        });

    } catch (e) {
        console.error("Settings update error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
