import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Next.js 15+ param is promise
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        const result = await db.delete(chatSessions)
            .where(and(
                eq(chatSessions.id, id),
                eq(chatSessions.userId, session.user.id) // Ensure ownership
            ))
            .returning(); // Optional: return deleted row to confirm

        if (result.length === 0) {
            // Maybe it didn't exist or wasn't theirs.
            // We can return 404 or just 200 (idempotent).
            // Let's return 200 with message.
            return NextResponse.json({ message: "Session not found or already deleted" });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error deleting chat session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
