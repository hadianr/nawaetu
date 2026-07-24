"use server";

import { searchVerses, SearchResponse } from "@/lib/quran/kemenag-api";

export async function searchQuranAction(query: string, page: number = 1, locale: string = "id"): Promise<SearchResponse> {
    // Attempt search with primary locale
    let response = await searchVerses(query, page, locale, 20);

    // If no results, try the opposite locale (en -> id or id -> en)
    if (response.total_results === 0) {
        const fallbackLocale = locale === "en" ? "id" : "en";
        const fallbackResponse = await searchVerses(query, page, fallbackLocale, 20);
        if (fallbackResponse.total_results > 0) {
            response = fallbackResponse;
        }
    }

    return response;
}
