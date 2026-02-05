
import { getBookmarkRepository } from '@/core/repositories/bookmark.repository';

export type { Bookmark } from '@/core/repositories/bookmark.repository';

/**
 * @deprecated Use getBookmarkRepository() or useBookmarks hook instead
 */
export const getBookmarks = () => {
    console.warn("[DEPRECATED] getBookmarks: Use getBookmarkRepository() or useBookmarks hook instead");
    return getBookmarkRepository().getBookmarks();
};

/**
 * @deprecated Use getBookmarkRepository().saveBookmark() or useBookmarks hook instead
 */
export const saveBookmark = (bookmark: any) => {
    console.warn("[DEPRECATED] saveBookmark: Use getBookmarkRepository() or useBookmarks hook instead");
    return getBookmarkRepository().saveBookmark(bookmark);
};

/**
 * @deprecated Use getBookmarkRepository().removeBookmark() or useBookmarks hook instead
 */
export const removeBookmark = (id: string) => {
    console.warn("[DEPRECATED] removeBookmark: Use getBookmarkRepository() or useBookmarks hook instead");
    getBookmarkRepository().removeBookmark(id);
};

/**
 * @deprecated Use getBookmarkRepository().isBookmarked() or useBookmarks hook instead
 */
export const isBookmarked = (surahId: number, verseId: number): boolean => {
    console.warn("[DEPRECATED] isBookmarked: Use getBookmarkRepository() or useBookmarks hook instead");
    return getBookmarkRepository().isBookmarked(surahId, verseId);
};

/**
 * @deprecated Use getBookmarkRepository().getBookmarkById() or useBookmarks hook instead
 */
export const getBookmarkById = (surahId: number, verseId: number) => {
    console.warn("[DEPRECATED] getBookmarkById: Use getBookmarkRepository() or useBookmarks hook instead");
    return getBookmarkRepository().getBookmarkById(surahId, verseId);
};
