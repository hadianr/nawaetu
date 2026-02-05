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
