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
        window.addEventListener('bookmarks_updated', handleUpdate);
        return () => window.removeEventListener('bookmarks_updated', handleUpdate);
    }, [refresh]);

    const isBookmarked = (verseKey: string) => !!bookmarkMap[verseKey];
    const getBookmark = (verseKey: string) => bookmarkMap[verseKey];

    return { bookmarks, isBookmarked, getBookmark, refresh };
}
