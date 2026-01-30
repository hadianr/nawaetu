
"use client";

import { useState, useEffect, useCallback } from "react";
import { getBookmarks, Bookmark } from "@/lib/bookmark-storage";

export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [bookmarkMap, setBookmarkMap] = useState<Record<string, Bookmark>>({});

    const refresh = useCallback(() => {
        const data = getBookmarks();
        setBookmarks(data);
        const map: Record<string, Bookmark> = {};
        data.forEach(b => {
            map[b.id] = b;
        });
        setBookmarkMap(map);
    }, []);

    useEffect(() => {
        refresh();

        const handleUpdate = () => refresh();
        window.addEventListener('bookmarks-updated', handleUpdate);
        return () => window.removeEventListener('bookmarks-updated', handleUpdate);
    }, [refresh]);

    const isBookmarked = (verseKey: string) => !!bookmarkMap[verseKey];
    const getBookmark = (verseKey: string) => bookmarkMap[verseKey];

    return { bookmarks, isBookmarked, getBookmark, refresh };
}
