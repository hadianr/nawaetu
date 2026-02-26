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
