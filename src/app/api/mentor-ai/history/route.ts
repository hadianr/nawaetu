/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

// Schema validation for chat history POST
const chatHistorySchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    messages: z.array(
        z.object({
            id: z.string().optional(),
            role: z.string(),
            content: z.string(),
            timestamp: z.number().optional(),
        })
    ),
});

// GET: Fetch all chat sessions for the user
export async function GET() {
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

        // Validate request body
        const result = chatHistorySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid data format", details: result.error.errors }, { status: 400 });
        }

        const { id, title, messages } = result.data;

        // Optimize: Slice messages to last 50 if too long
        const trimmedMessages = messages.slice(-50);

        // Prepare update set: only update title if provided
        const updateSet: Partial<typeof chatSessions.$inferInsert> = {
            messages: trimmedMessages,
            updatedAt: new Date(),
        };
        if (title) {
            updateSet.title = title;
        }

        // Perform UPSERT: Insert or Update if exists (and owned by user)
        const dbResult = await db.insert(chatSessions)
            .values({
                id: id,
                userId: session.user.id,
                title: title || "New Chat",
                messages: trimmedMessages,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .onConflictDoUpdate({
                target: chatSessions.id,
                set: updateSet,
                where: eq(chatSessions.userId, session.user.id)
            })
            .returning();

        // If no row returned, it means conflict occurred but update was skipped (ownership mismatch)
        if (dbResult.length === 0) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error saving chat session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
