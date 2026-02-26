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

import { useCallback, useEffect, useState } from 'react';
import {
  getBookmarkRepository,
  Bookmark
} from '@/core/repositories/bookmark.repository';

export function useBookmarks() {
  const repository = getBookmarkRepository();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(
    repository.getBookmarks()
  );

  useEffect(() => {
    const refresh = () => {
      setBookmarks(repository.getBookmarks());
    };

    refresh();

    const handleUpdate = () => refresh();
    window.addEventListener('bookmarks_updated', handleUpdate);
    
    return () => {
      window.removeEventListener('bookmarks_updated', handleUpdate);
    };
  }, [repository]);

  const saveBookmark = useCallback(
    (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): string => {
      const id = repository.saveBookmark(bookmark);
      setBookmarks(repository.getBookmarks());
      return id;
    },
    [repository]
  );

  const removeBookmark = useCallback(
    (id: string): void => {
      repository.removeBookmark(id);
      setBookmarks(repository.getBookmarks());
    },
    [repository]
  );

  const isBookmarked = useCallback(
    (surahId: number, verseId: number): boolean => {
      return repository.isBookmarked(surahId, verseId);
    },
    [repository]
  );

  const getBookmarkById = useCallback(
    (surahId: number, verseId: number): Bookmark | undefined => {
      return repository.getBookmarkById(surahId, verseId);
    },
    [repository]
  );

  const updateBookmark = useCallback(
    (id: string, updates: Partial<Bookmark>): void => {
      repository.updateBookmark(id, updates);
      setBookmarks(repository.getBookmarks());
    },
    [repository]
  );

  const removeAllBookmarks = useCallback(() => {
    repository.removeAllBookmarks();
    setBookmarks([]);
  }, [repository]);

  return {
    bookmarks,
    saveBookmark,
    removeBookmark,
    isBookmarked,
    getBookmarkById,
    updateBookmark,
    removeAllBookmarks
  };
}
