import { db } from "@/db";
import { bookmarks, type Bookmark as DbBookmark } from "@/db/schema";
import { Bookmark, BookmarkRepository } from "./bookmark.repository";
import { eq, and } from "drizzle-orm";

/**
 * Database Implementation of BookmarkRepository.
 * Uses Drizzle ORM to persist bookmarks to PostgreSQL.
 * 
 * NOTE: This implementation requires an authenticated user ID to work.
 * Ideally, we should pass userId to the constructor or the methods.
 * For now, this is a template implementation.
 */
export class DbBookmarkRepository implements BookmarkRepository {
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    // Not strictly async in interface, but DB calls are async.
    // In a real app, we should update the Repository Interface to return Promise<T>
    // for true scalability. For this template, we assume we might need to refactor 
    // the interface later or use this in Server Actions which are async.

    // TEMPORARY: Since the original interface is synchronous (LocalStorage),
    // this implementation serves as a "Server Side" guide.
    // To use this, you WILL need to refactor BookmarkRepository to return Promises.

    async getBookmarksAsync(): Promise<Bookmark[]> {
        const rows = await db.query.bookmarks.findMany({
            where: eq(bookmarks.userId, this.userId),
            orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)],
        });

        return rows.map(this.mapToEntity);
    }

    // Shim for sync interface - throws error because DB must be async
    getBookmarks(): Bookmark[] {
        throw new Error("Use getBookmarksAsync() for DB implementation");
    }

    async saveBookmarkAsync(
        bookmark: Omit<Bookmark, "id" | "createdAt" | "updatedAt">
    ): Promise<string> {
        const key = `${bookmark.surahId}:${bookmark.verseId}`;

        // Upsert logic
        const [inserted] = await db
            .insert(bookmarks)
            .values({
                userId: this.userId,
                surahId: bookmark.surahId,
                surahName: bookmark.surahName,
                verseId: bookmark.verseId,
                verseText: bookmark.verseText,
                key: key,
                note: bookmark.note,
                tags: bookmark.tags,
            })
            .onConflictDoUpdate({
                target: [bookmarks.userId, bookmarks.key], // Needs unique constraint on these 2 columns
                set: {
                    note: bookmark.note,
                    tags: bookmark.tags,
                    updatedAt: new Date(),
                },
            })
            .returning();

        return inserted.key;
    }

    saveBookmark(bookmark: Omit<Bookmark, "id" | "createdAt" | "updatedAt">): string {
        throw new Error("Use saveBookmarkAsync() for DB implementation");
    }

    async removeBookmarkAsync(id: string): Promise<void> {
        // id in interface is actually the "key" (surahId:verseId)
        await db.delete(bookmarks).where(
            and(
                eq(bookmarks.userId, this.userId),
                eq(bookmarks.key, id)
            )
        );
    }

    removeBookmark(id: string): void {
        throw new Error("Use removeBookmarkAsync() for DB implementation");
    }

    async isBookmarkedAsync(surahId: number, verseId: number): Promise<boolean> {
        const key = `${surahId}:${verseId}`;
        const found = await db.query.bookmarks.findFirst({
            where: and(
                eq(bookmarks.userId, this.userId),
                eq(bookmarks.key, key)
            ),
        });
        return !!found;
    }

    isBookmarked(surahId: number, verseId: number): boolean {
        throw new Error("Use isBookmarkedAsync() for DB implementation");
    }

    async getBookmarkByIdAsync(surahId: number, verseId: number): Promise<Bookmark | undefined> {
        const key = `${surahId}:${verseId}`;
        const found = await db.query.bookmarks.findFirst({
            where: and(
                eq(bookmarks.userId, this.userId),
                eq(bookmarks.key, key)
            ),
        });

        return found ? this.mapToEntity(found) : undefined;
    }

    getBookmarkById(surahId: number, verseId: number): Bookmark | undefined {
        throw new Error("Use getBookmarkByIdAsync() for DB implementation");
    }

    async updateBookmarkAsync(id: string, updates: Partial<Bookmark>): Promise<void> {
        // Separate ID and dates from updates to avoid type mismatches
        const { id: _, createdAt: __, updatedAt: ___, ...safeUpdates } = updates;

        await db.update(bookmarks)
            .set({
                ...safeUpdates,
                updatedAt: new Date()
            })
            .where(and(
                eq(bookmarks.userId, this.userId),
                eq(bookmarks.key, id)
            ));
    }

    updateBookmark(id: string, updates: Partial<Bookmark>): void {
        throw new Error("Use updateBookmarkAsync() for DB implementation");
    }

    removeAllBookmarks(): void {
        // Dangerous op in DB context, maybe keep for testing only
        throw new Error("Method not implemented for DB safety.");
    }

    // Mapper
    private mapToEntity(row: DbBookmark): Bookmark {
        return {
            id: row.key, // Logic ID used in app
            surahId: row.surahId,
            surahName: row.surahName,
            verseId: row.verseId,
            verseText: row.verseText,
            note: row.note || undefined,
            tags: row.tags || undefined,
            createdAt: row.createdAt ? row.createdAt.getTime() : Date.now(),
            updatedAt: row.updatedAt ? row.updatedAt.getTime() : Date.now(),
        };
    }
}
