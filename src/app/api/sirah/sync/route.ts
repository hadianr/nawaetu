import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/db";
import { sirahUserProgress, sirahBookmarks } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

/**
 * GET /api/sirah/sync
 * Returns the logged-in user's completed section IDs and bookmarked section IDs.
 */
export async function GET() {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const progressRows = await db
            .select({ sectionId: sirahUserProgress.sectionId, chapterSlug: sirahUserProgress.chapterSlug })
            .from(sirahUserProgress)
            .where(eq(sirahUserProgress.userId, userId));

        const bookmarkRows = await db
            .select({ sectionId: sirahBookmarks.sectionId, chapterSlug: sirahBookmarks.chapterSlug })
            .from(sirahBookmarks)
            .where(eq(sirahBookmarks.userId, userId));

        return NextResponse.json({
            completed: progressRows.map((r) => r.sectionId),
            bookmarks: bookmarkRows.map((r) => r.sectionId),
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch Sirah sync data" }, { status: 500 });
    }
}

/**
 * POST /api/sirah/sync
 * Body: { completed?: string[], bookmarks?: string[], sectionId?: string, chapterSlug?: string, action?: 'complete' | 'bookmark' | 'unbookmark' }
 * Synchronizes local progress and bookmarks to Neon DB.
 */
export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { sectionId, chapterSlug, action } = body;

        if (action === "complete" && sectionId && chapterSlug) {
            await db
                .insert(sirahUserProgress)
                .values({
                    userId,
                    sectionId,
                    chapterSlug,
                })
                .onConflictDoNothing();
            return NextResponse.json({ success: true, action: "completed" });
        }

        if (action === "bookmark" && sectionId && chapterSlug) {
            await db
                .insert(sirahBookmarks)
                .values({
                    userId,
                    sectionId,
                    chapterSlug,
                })
                .onConflictDoNothing();
            return NextResponse.json({ success: true, action: "bookmarked" });
        }

        if (action === "unbookmark" && sectionId) {
            await db
                .delete(sirahBookmarks)
                .where(eq(sirahBookmarks.userId, userId));
            return NextResponse.json({ success: true, action: "unbookmarked" });
        }

        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update Sirah sync data" }, { status: 500 });
    }
}
