/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Shared hook for filtering and batch-loading Islamic content (Hadith & Dua).
 * Replaces duplicated filter/search/pagination logic in both page components.
 */

import { useState, useMemo, useEffect, useCallback } from "react";

interface UseIslamicContentFilterOptions<T extends { id: string }> {
    /** Full data library to filter */
    library: T[];
    /** Return array of searchable string fields for an item */
    searchFields: (item: T) => string[];
    /** Return true if item matches the selected filter key */
    filterMatch: (item: T, key: string) => boolean;
    /** ID from URL params to auto-expand/highlight */
    targetId: string;
    /** Currently active locale */
    locale: string;
    /** How many items to show in first batch (default 25) */
    initialBatch?: number;
    /** How many items to add per load-more click (default 25) */
    batchStep?: number;
}

interface UseIslamicContentFilterResult<T> {
    filtered: T[];
    visibleItems: T[];
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    selectedFilter: string;
    setSelectedFilter: (key: string) => void;
    handleLoadMore: () => void;
    hasMore: boolean;
}

export function useIslamicContentFilter<T extends { id: string }>({
    library,
    searchFields,
    filterMatch,
    targetId,
    locale,
    initialBatch = 25,
    batchStep = 25,
}: UseIslamicContentFilterOptions<T>): UseIslamicContentFilterResult<T> {
    const [searchQuery, setSearchQueryRaw] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [visibleCount, setVisibleCount] = useState(initialBatch);

    // 150ms debounce on search to avoid refiltering on every keystroke
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 150);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const setSearchQuery = useCallback((q: string) => {
        setSearchQueryRaw(q);
        setVisibleCount(initialBatch); // reset batch when search changes
    }, [initialBatch]);

    // If URL targets a specific item, reset filters and show all
    useEffect(() => {
        if (targetId) {
            setSelectedFilter("all");
            setSearchQueryRaw("");
            setDebouncedQuery("");
            setVisibleCount(library.length);
        } else {
            setVisibleCount(initialBatch);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetId]);

    const filtered = useMemo(() => {
        return library.filter(item => {
            if (selectedFilter !== "all" && !filterMatch(item, selectedFilter)) return false;
            if (!debouncedQuery.trim()) return true;
            const q = debouncedQuery.toLowerCase();
            return searchFields(item).some(field => field?.toLowerCase().includes(q));
        });
    // locale in deps so bilingual search fields re-evaluate on language change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [library, selectedFilter, debouncedQuery, locale]);

    const visibleItems = useMemo(() => {
        if (targetId) return filtered;
        return filtered.slice(0, visibleCount);
    }, [filtered, visibleCount, targetId]);

    const handleLoadMore = useCallback(() => {
        setVisibleCount(prev => Math.min(prev + batchStep, filtered.length));
    }, [batchStep, filtered.length]);

    const hasMore = !targetId && visibleItems.length < filtered.length;

    return {
        filtered,
        visibleItems,
        searchQuery,
        setSearchQuery,
        selectedFilter,
        setSelectedFilter,
        handleLoadMore,
        hasMore,
    };
}
