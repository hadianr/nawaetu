import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET: Fetch all chat sessions for the user
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const history = await db.query.chatSessions.findMany({
            where: eq(chatSessions.userId, session.user.id),
            orderBy: [desc(chatSessions.updatedAt)],
            limit: 50 // Cap at 50 sessions
        });

        // Map to frontend format if needed, but schema matches closely
        return NextResponse.json(history);

    } catch (error) {
        console.error("Error fetching chat history:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create or Update a session
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, title, messages } = body;

        if (!id || !messages) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if session exists
        const existing = await db.query.chatSessions.findFirst({
            where: eq(chatSessions.id, id)
        });

        if (existing) {
            // Update
            if (existing.userId !== session.user.id) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            // Optimize: Slice messages to last 50 if too long
            const trimmedMessages = messages.slice(-50);

            await db.update(chatSessions)
                .set({
                    title: title || existing.title,
                    messages: trimmedMessages,
                    updatedAt: new Date()
                })
                .where(eq(chatSessions.id, id));
        } else {
            // Create New
            // Note: If ID is provided from client (UUID), use it.
            // If ID collides (rare), it might error, but `uuid` primary key handles default.
            // We trust client generated UUID for optimistic UI.

            const trimmedMessages = messages.slice(-50);

            await db.insert(chatSessions).values({
                id: id,
                userId: session.user.id,
                title: title || "New Chat",
                messages: trimmedMessages,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error saving chat session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
