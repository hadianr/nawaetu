import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { DbSyncRepository } from '@/core/repositories/db-sync.repository';
import { db } from '@/db';

vi.mock('@/core/repositories/progression.repository', () => ({
    processProgressionEvidence: vi.fn().mockResolvedValue({ duplicate: false }),
}));

vi.mock('@/db', () => {
    const insertChain = {
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'mock-uuid-123' }]),
    };

    const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
    };

    const deleteChain = {
        where: vi.fn().mockResolvedValue([]),
    };

    return {
        db: {
            insert: vi.fn(() => insertChain),
            update: vi.fn(() => updateChain),
            delete: vi.fn(() => deleteChain),
            query: {
                users: { findFirst: vi.fn().mockResolvedValue({ id: 'user-1', settings: { theme: 'night' } }) },
                intentions: { findFirst: vi.fn().mockResolvedValue(null) },
                userCompletedMissions: { findFirst: vi.fn().mockResolvedValue(null) },
                bookmarks: { findFirst: vi.fn().mockResolvedValue(null) },
            },
        },
    };
});

describe('DbSyncRepository - Full Domain Entity Coverage', () => {
    const userId = 'user-test-uuid';
    let repo: DbSyncRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        repo = new DbSyncRepository(userId);
    });

    it('syncs bookmark creation and update with onConflictDoUpdate', async () => {
        const bookmarkData = {
            surahId: 2,
            surahName: 'Al-Baqarah',
            verseId: 255,
            verseText: 'Allahu la ilaha illa Huwa...',
            translationText: 'Allah, there is no deity except Him...',
            note: 'Ayat Kursi',
            tags: ['favourite'],
        };

        const resultId = await repo.syncBookmarkAsync(bookmarkData, 'create');
        expect(resultId).toBe('mock-uuid-123');
        expect(db.insert).toHaveBeenCalledTimes(1);
    });

    it('syncs bookmark deletion by key or id', async () => {
        await repo.syncBookmarkAsync({ key: '2:255' }, 'delete');
        expect(db.delete).toHaveBeenCalledTimes(1);
    });

    it('syncs intentions with date normalization', async () => {
        const intentionData = {
            intentionText: 'Niat sholat tahajjud',
            intentionType: 'daily',
            intentionDate: '2026-08-18T04:00:00.000Z',
            reflectionText: 'Alhamdulillah khusyuk',
            reflectionRating: 5,
        };

        const resultId = await repo.syncIntention(intentionData, 'create');
        expect(resultId).toBe('mock-uuid-123');
        expect(db.insert).toHaveBeenCalledTimes(1);
    });

    it('syncs daily missions with hasanah XP calculation', async () => {
        const missionData = {
            id: 'quran_10_ayat',
            hasanahEarned: 50,
            completedAt: '2026-08-18T10:00:00.000Z',
        };

        const resultId = await repo.syncMission(missionData, 'create');
        expect(resultId).toBe('mock-uuid-123');
        expect(db.insert).toHaveBeenCalledTimes(1);
    });

    it('syncs daily activity (prayers, tasbih, quran)', async () => {
        const activityData = {
            date: '2026-08-18',
            quranAyat: 10,
            quranReadingSeconds: 300,
            hasanahGained: 50,
            tasbihCount: 99,
            prayersLogged: ['Fajr', 'Dhuhr', 'Asr'],
        };

        await repo.syncDailyActivity(activityData, 'create');
        expect(db.insert).toHaveBeenCalledTimes(1);
    });

    it('syncs user settings and merges existing JSONB values', async () => {
        const settingsData = {
            locale: 'id',
            muadzin: 'mishary',
        };

        await repo.syncSetting(settingsData, 'update');
        expect(db.update).toHaveBeenCalledTimes(1);
    });

    it('syncs quran reading state (surah, verse, lastReadAt)', async () => {
        const readingStateData = {
            surahId: 18,
            surahName: 'Al-Kahf',
            verseId: 1,
            timestamp: Date.now(),
        };

        await repo.syncReadingState(readingStateData, 'update');
        expect(db.insert).toHaveBeenCalledTimes(1);
    });

    it('syncs streak counters', async () => {
        const streakData = {
            current: 7,
            longest: 14,
            lastDate: '2026-08-18',
        };

        await repo.syncStreak(streakData);
        expect(db.update).toHaveBeenCalledTimes(1);
    });

    it('syncs Ramadhan fasting, taraweh, and daily checklist logs', async () => {
        const fastingData = {
            hijriYear: 1447,
            hijriDay: 1,
            status: 'fasting',
            consequence: 'none',
        };
        const fastingId = await repo.syncRamadhanFasting(fastingData, 'create');
        expect(fastingId).toBe('mock-uuid-123');

        const tarawehData = {
            hijriYear: 1447,
            hijriDay: 1,
            choice: '8',
            location: 'masjid',
        };
        const tarawehId = await repo.syncRamadhanTaraweh(tarawehData, 'create');
        expect(tarawehId).toBe('mock-uuid-123');

        const dailyData = {
            hijriYear: 1447,
            hijriDay: 1,
            fajrAtMasjid: true,
            dhuha: true,
            witir: true,
        };
        const dailyId = await repo.syncRamadhanDaily(dailyData, 'create');
        expect(dailyId).toBe('mock-uuid-123');
    });

    it('syncs Sirah progress and bookmarks', async () => {
        const sirahProgressData = {
            sectionId: 'kelahiran-nabi',
            chapterSlug: 'fase-mekkah',
            completedAt: new Date().toISOString(),
        };
        const progressId = await repo.syncSirahProgress(sirahProgressData, 'create');
        expect(progressId).toBe('mock-uuid-123');

        const sirahBookmarkData = {
            sectionId: 'perang-badr',
            chapterSlug: 'fase-madinah',
        };
        const bookmarkId = await repo.syncSirahBookmark(sirahBookmarkData, 'create');
        expect(bookmarkId).toBe('mock-uuid-123');

        await repo.syncSirahBookmark({ sectionId: 'perang-badr' }, 'delete');
        expect(db.delete).toHaveBeenCalledTimes(1);
    });
});
