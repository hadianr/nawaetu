
import { getBookmarkRepository } from '@/core/repositories/bookmark.repository';

export type { Bookmark } from '@/core/repositories/bookmark.repository';

/**
 * @deprecated Use getBookmarkRepository() or useBookmarks hook instead
 */
export const getBookmarks = () => {
    return getBookmarkRepository().getBookmarks();
};

/**
 * @deprecated Use getBookmarkRepository().saveBookmark() or useBookmarks hook instead
 */
export const saveBookmark = (bookmark: any) => {
    return getBookmarkRepository().saveBookmark(bookmark);
};

/**
 * @deprecated Use getBookmarkRepository().removeBookmark() or useBookmarks hook instead
 */
export const removeBookmark = (id: string) => {
    getBookmarkRepository().removeBookmark(id);
};

/**
 * @deprecated Use getBookmarkRepository().isBookmarked() or useBookmarks hook instead
 */
export const isBookmarked = (surahId: number, verseId: number): boolean => {
    return getBookmarkRepository().isBookmarked(surahId, verseId);
};

/**
 * @deprecated Use getBookmarkRepository().getBookmarkById() or useBookmarks hook instead
 */
export const getBookmarkById = (surahId: number, verseId: number) => {
    return getBookmarkRepository().getBookmarkById(surahId, verseId);
};
