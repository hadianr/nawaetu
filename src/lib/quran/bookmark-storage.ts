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
