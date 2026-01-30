
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

const STORAGE_KEY = 'nawaetu_bookmarks';

export const getBookmarks = (): Bookmark[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const saveBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
    const bookmarks = getBookmarks();
    const id = `${bookmark.surahId}:${bookmark.verseId}`;
    const now = Date.now();

    const existingIndex = bookmarks.findIndex(b => b.id === id);

    if (existingIndex >= 0) {
        // Update existing (merge notes/tags if we want, but usually overwrite or simplistic update)
        // For now, let's just update the content/note
        bookmarks[existingIndex] = {
            ...bookmarks[existingIndex],
            ...bookmark,
            updatedAt: now
        };
    } else {
        // Create new
        const newBookmark: Bookmark = {
            id,
            ...bookmark,
            createdAt: now,
            updatedAt: now
        };
        bookmarks.unshift(newBookmark); // Add to top
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    // Dispatch event for reactive updates in other components
    window.dispatchEvent(new Event('bookmarks-updated'));
    return id;
};

export const removeBookmark = (id: string) => {
    let bookmarks = getBookmarks();
    bookmarks = bookmarks.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    window.dispatchEvent(new Event('bookmarks-updated'));
};

export const isBookmarked = (surahId: number, verseId: number): boolean => {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.id === `${surahId}:${verseId}`);
};

export const getBookmarkById = (surahId: number, verseId: number): Bookmark | undefined => {
    const bookmarks = getBookmarks();
    return bookmarks.find(b => b.id === `${surahId}:${verseId}`);
};
