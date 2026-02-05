import { getStorageService } from '@/core/infrastructure/storage';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';

export interface Bookmark {
  id: string; // Format: "surahId:verseId" e.g "2:255"
  surahId: number;
  surahName: string;
  verseId: number;
  verseText: string; // Preview text (Arabic)
  note?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface BookmarkRepository {
  getBookmarks(): Bookmark[];
  saveBookmark(
    bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>
  ): string;
  removeBookmark(id: string): void;
  isBookmarked(surahId: number, verseId: number): boolean;
  getBookmarkById(surahId: number, verseId: number): Bookmark | undefined;
  updateBookmark(id: string, updates: Partial<Bookmark>): void;
  removeAllBookmarks(): void;
}

export class LocalBookmarkRepository implements BookmarkRepository {
  private storage = getStorageService();

  getBookmarks(): Bookmark[] {
    return (
      this.storage.getOptional<Bookmark[]>(
        STORAGE_KEYS.QURAN_BOOKMARKS
      ) ?? []
    );
  }

  saveBookmark(
    bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>
  ): string {
    const bookmarks = this.getBookmarks();
    const id = `${bookmark.surahId}:${bookmark.verseId}`;
    const now = Date.now();

    const existingIndex = bookmarks.findIndex(b => b.id === id);

    if (existingIndex >= 0) {
      bookmarks[existingIndex] = {
        ...bookmarks[existingIndex],
        ...bookmark,
        updatedAt: now
      };
    } else {
      const newBookmark: Bookmark = {
        id,
        ...bookmark,
        createdAt: now,
        updatedAt: now
      };
      bookmarks.unshift(newBookmark);
    }

    this.storage.set(STORAGE_KEYS.QURAN_BOOKMARKS, bookmarks);
    this._notifyListeners();
    return id;
  }

  removeBookmark(id: string): void {
    let bookmarks = this.getBookmarks();
    bookmarks = bookmarks.filter(b => b.id !== id);
    this.storage.set(STORAGE_KEYS.QURAN_BOOKMARKS, bookmarks);
    this._notifyListeners();
  }

  isBookmarked(surahId: number, verseId: number): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.id === `${surahId}:${verseId}`);
  }

  getBookmarkById(
    surahId: number,
    verseId: number
  ): Bookmark | undefined {
    const bookmarks = this.getBookmarks();
    return bookmarks.find(b => b.id === `${surahId}:${verseId}`);
  }

  updateBookmark(id: string, updates: Partial<Bookmark>): void {
    const bookmarks = this.getBookmarks();
    const index = bookmarks.findIndex(b => b.id === id);

    if (index >= 0) {
      bookmarks[index] = {
        ...bookmarks[index],
        ...updates,
        updatedAt: Date.now()
      };
      this.storage.set(STORAGE_KEYS.QURAN_BOOKMARKS, bookmarks);
      this._notifyListeners();
    }
  }

  removeAllBookmarks(): void {
    this.storage.remove(STORAGE_KEYS.QURAN_BOOKMARKS);
    this._notifyListeners();
  }

  private _notifyListeners(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bookmarks_updated'));
    }
  }
}

let repositoryInstance: BookmarkRepository | null = null;

export function getBookmarkRepository(): BookmarkRepository {
  if (!repositoryInstance) {
    repositoryInstance = new LocalBookmarkRepository();
  }
  return repositoryInstance;
}

export function resetBookmarkRepository(): void {
  repositoryInstance = null;
}
