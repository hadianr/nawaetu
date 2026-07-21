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

/**
 * Quran Word-Level Audio Segment API
 *
 * Fetches word-level timing data (segments) from quran.com's public API.
 * Used to enable real-time audio highlighting (Karaoke Mode) synced with audio playback.
 *
 * API: https://api.quran.com/api/v4/chapter_recitations/{reciterId}/{surahId}?segments=true
 * Response: audio_file.timestamps[].segments = [[wordIndex, absoluteStartMs, absoluteEndMs]]
 *
 * IMPORTANT: Segment timestamps are absolute (from start of full Surah audio).
 * Each verse is played as an individual MP3 (currentTime resets to 0 for each verse),
 * so we normalize all segments by subtracting the verse's timestamp_from offset.
 *
 * Graceful fallback: returns null if the reciter has no segment data.
 */

// [wordIndex (1-based from API), normalizedStartMs, normalizedEndMs]
export type WordSegment = [number, number, number];

// Map of verseKey ("1:1") -> list of word segments (time-normalized to verse start)
export type VerseSegmentMap = Record<string, WordSegment[]>;

// In-memory session cache keyed by "surahId-reciterId"
const segmentCache = new Map<string, VerseSegmentMap | null>();
// Track in-flight promises to prevent duplicate fetch requests
const pendingFetches = new Map<string, Promise<VerseSegmentMap | null>>();

const SEGMENT_API_BASE = 'https://api.quran.com/api/v4/chapter_recitations';

/**
 * Maps app reciter IDs (from settings-data.ts) to the quran.com chapter_recitations API ID.
 *
 * IMPORTANT: Only Mishary Rashid Alafasy (ID 7) has been verified to have
 * precise word-level segment timing that aligns correctly with per-verse MP3 playback.
 * Other reciters return null → graceful fallback to normal playback (no highlight).
 *
 * To enable more reciters in the future, add their verified API IDs here.
 * Verified candidates (API chapter_recitations IDs, tested 2026-03-05):
 *   2 = Abdul Basit (Murattal) — has segments but timing may differ from CDN audio
 *   3 = Abdul Rahman Al-Sudais — has segments but timing may differ from CDN audio
 *  10 = Saud Al-Shuraim — has segments but timing may differ from CDN audio
 */
const APP_TO_API_RECITER_ID: Record<number, number | null> = {
    7: 7,    // Mishary Rashid Alafasy ✅ — verified precise
    2: null, // Abdul Rahman Al-Sudais — fallback (timing mismatch with CDN audio)
    1: null, // Abdul Basit (Murattal) — fallback (timing mismatch with CDN audio)
    3: null, // Saud Al-Shuraim — fallback (timing mismatch with CDN audio)
    5: null, // Maher Al Muaiqly — no segment data in API
};

/**
 * Fetch all word-level timing data for an entire Surah + Reciter.
 * Results are normalized to verse-relative time (so they match per-verse MP3 currentTime).
 * Data is cached in memory for the lifetime of the browser session.
 *
 * @returns VerseSegmentMap on success, null if not supported by this reciter / network error
 */
export async function fetchSurahSegments(
    surahId: number,
    appReciterId: number
): Promise<VerseSegmentMap | null> {
    // Resolve the app's CDN reciter ID to the chapter_recitations API ID
    const apiReciterId = appReciterId in APP_TO_API_RECITER_ID
        ? APP_TO_API_RECITER_ID[appReciterId]
        : null; // Unknown reciter → graceful fallback

    // Early exit for reciters with no known segment data
    if (apiReciterId === null) return null;

    const cacheKey = `${surahId}-${apiReciterId}`;

    // 1. Return from cache (includes null for reciters that don't have segment data)
    if (segmentCache.has(cacheKey)) {
        return segmentCache.get(cacheKey)!;
    }

    // 2. Deduplicate in-flight fetch — if someone calls this concurrently, reuse the same promise
    if (pendingFetches.has(cacheKey)) {
        return pendingFetches.get(cacheKey)!;
    }

    // 3. Start the fetch
    const fetchPromise = (async (): Promise<VerseSegmentMap | null> => {
        try {
            const url = `${SEGMENT_API_BASE}/${apiReciterId}/${surahId}?segments=true`;
            const res = await fetch(url, {
                signal: AbortSignal.timeout(10000), // 10s timeout
                headers: { 'Accept': 'application/json' },
            });

            if (!res.ok) {
                segmentCache.set(cacheKey, null);
                return null;
            }

            const data = await res.json();

            // The quran.com API wraps the response under `audio_file` (singular)
            // with a `timestamps` array — each item represents one verse
            const timestamps: any[] = data?.audio_file?.timestamps ?? [];

            if (!timestamps.length) {
                segmentCache.set(cacheKey, null);
                return null;
            }

            const verseMap: VerseSegmentMap = {};
            let hasSegmentData = false;

            for (const ts of timestamps) {
                const verseKey: string = ts.verse_key;
                // `timestamp_from` is the absolute start of this verse in the full Surah audio (ms)
                const offset: number = ts.timestamp_from ?? 0;
                const rawSegs: any[] = ts.segments ?? [];

                if (!rawSegs.length) continue;

                // Filter and normalize:
                // - Discard malformed entries (API sometimes emits sparse [wordIdx] entries with no timing)
                // - Subtract `offset` to get verse-relative time (matches per-verse MP3 currentTime)
                const normalizedSegs: WordSegment[] = rawSegs
                    .filter((s: any) => Array.isArray(s) && s.length === 3)
                    .map((s: any): WordSegment => {
                        const start = s[1] - offset;
                        const end = s[2] - offset;
                        // Clamp negative starts to 0 (sometimes API jitter gives -1 to -50ms)
                        // but only if the word actually has some duration within this verse (end > 0)
                        return [
                            s[0],              // wordIndex (1-based)
                            Math.max(0, start),
                            end
                        ];
                    })
                    .filter(([, start, end]) => end > start);

                if (normalizedSegs.length > 0) {
                    hasSegmentData = true;
                    verseMap[verseKey] = normalizedSegs;
                }
            }

            const result = hasSegmentData ? verseMap : null;
            segmentCache.set(cacheKey, result);
            return result;

        } catch {
            // Network error, timeout, or parse error — graceful fallback
            segmentCache.set(cacheKey, null);
            return null;
        } finally {
            pendingFetches.delete(cacheKey);
        }
    })();

    pendingFetches.set(cacheKey, fetchPromise);
    return fetchPromise;
}

/**
 * Binary search for the currently active word index at a given normalized audio time.
 * O(log n) even for long Basmalahs — much faster than linear scan.
 *
 * @param segments Normalized word segments for the current verse
 * @param currentMs Current audio element currentTime * 1000 (ms)
 * @returns wordIndex (1-based) or -1 if no active word at this timestamp
 */
export function findActiveWordIndex(segments: WordSegment[], currentMs: number): number {
    let lo = 0;
    let hi = segments.length - 1;

    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const [, startMs, endMs] = segments[mid];

        if (endMs < currentMs) {
            lo = mid + 1;
        } else if (startMs > currentMs) {
            hi = mid - 1;
        } else {
            // currentMs is within [startMs, endMs]
            return segments[mid][0]; // wordIndex (1-based)
        }
    }

    return -1; // No active word at this exact timestamp
}
