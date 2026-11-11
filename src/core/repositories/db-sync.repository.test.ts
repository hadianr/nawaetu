import { describe, expect, it, vi, beforeEach } from 'vitest';

const captured: { rows: Array<Record<string, unknown>>; evidence: Array<Record<string, unknown>> } = { rows: [], evidence: [] };

const gender = vi.hoisted(() => ({ value: null as string | null }));

vi.mock('@/db', () => ({
    db: {
        query: { users: { findFirst: async () => ({ gender: gender.value }) } },
        delete: () => ({ where: async () => undefined }),
        insert: () => ({
            values: (v: Array<Record<string, unknown>>) => {
                captured.rows.push(...v);
                return { onConflictDoNothing: () => ({ returning: async () => [] }) };
            },
        }),
    },
}));
vi.mock('@/core/repositories/progression.repository', () => ({
    processProgressionEvidence: vi.fn(async (_userId: string, evidence: Record<string, unknown>) => { captured.evidence.push(evidence); }),
    processProgressionEvidenceBatch: vi.fn(async (_userId: string, evidences: Array<Record<string, unknown>>) => { captured.evidence.push(...evidences); }),
    reverseProgressionEvidence: vi.fn(async () => ({ reversed: true })),
    raiseProgressionEvidence: vi.fn(async () => ({ changed: true })),
}));

import { DbSyncRepository, genderAdjustedReward } from './db-sync.repository';
import { raiseProgressionEvidence, reverseProgressionEvidence } from '@/core/repositories/progression.repository';

describe('DbSyncRepository mission day', () => {
    beforeEach(() => {
        captured.rows = [];
        captured.evidence = [];
    });

    it('files a 04:30 WIB completion under the user\'s local day using the timezone', async () => {
        const completedAt = new Date('2026-11-11T04:30:00+07:00').toISOString();
        await new DbSyncRepository('u1').syncMissionsBatch([
            { id: 'tasbih_99', completedAt, hasanahEarned: 30, timezone: 'Asia/Jakarta' },
        ]);

        expect(captured.rows[0]).toMatchObject({ completedDate: '2026-11-11' });
        expect(captured.evidence[0]).toMatchObject({ sourceId: 'tasbih_99:2026-11-11', localDate: '2026-11-11', timezone: 'Asia/Jakarta' });
    });

    it('prefers the date the client sends over any guess from the timestamp', async () => {
        await new DbSyncRepository('u1').syncMissionsBatch([
            { id: 'tasbih_99', completedAt: '2026-11-10T21:30:00.000Z', completedDate: '2026-11-11', hasanahEarned: 30 },
        ]);

        expect(captured.rows[0]).toMatchObject({ completedDate: '2026-11-11' });
    });
});

describe('sanitizeSyncedSettings', () => {
    it('drops server-owned and unknown keys and oversized values', async () => {
        const { sanitizeSyncedSettings } = await import('@/lib/validations/sync');
        expect(sanitizeSyncedSettings({
            theme: 'blossom',
            calculationMethod: 20,
            guestSyncEligible: true,
            streakReminderEnabled: false,
            reciter: 'x'.repeat(600),
            adhanPreferences: { fajr: true },
            locale: { nested: true },
        })).toEqual({ theme: 'blossom', calculationMethod: 20, adhanPreferences: { fajr: true } });
    });
});

describe('DbSyncRepository sync window', () => {
    beforeEach(() => {
        captured.rows = [];
        captured.evidence = [];
    });

    it('refuses missions older than 30 days or dated in the future, and counts them', async () => {
        const today = new Date().toISOString().slice(0, 10);
        const day = (offset: number) => {
            const d = new Date(`${today}T00:00:00Z`);
            d.setUTCDate(d.getUTCDate() + offset);
            return d.toISOString().slice(0, 10);
        };
        const repo = new DbSyncRepository('u1');

        await repo.syncMissionsBatch([
            { id: 'tasbih_99', completedAt: day(0), hasanahEarned: 30 },
            { id: 'tasbih_99', completedAt: day(-30), hasanahEarned: 30 },
            { id: 'tasbih_99', completedAt: day(-31), hasanahEarned: 30 },
            { id: 'tasbih_99', completedAt: day(5), hasanahEarned: 30 },
            { id: 'tasbih_99', completedAt: '2030-01-01', hasanahEarned: 30 },
        ]);

        expect(captured.rows.map((row) => row.completedDate)).toEqual([day(0), day(-30)]);
        expect(repo.rejected).toBe(3);
    });
});

describe('DbSyncRepository daily activity merge', () => {
    it('merges counters with GREATEST and prayers as a union instead of overwriting', async () => {
        const { sql } = await import('drizzle-orm');
        const sqlMock = vi.mocked(sql);
        sqlMock.mockClear();

        const { db } = await import('@/db');
        const upsert = { values: vi.fn().mockReturnThis(), onConflictDoUpdate: vi.fn().mockResolvedValue(undefined) };
        const mutableDb = db as unknown as { insert: () => unknown };
        const originalInsert = mutableDb.insert;
        mutableDb.insert = () => upsert;

        await new DbSyncRepository('u1').syncDailyActivity(
            { date: '2026-11-11', quranAyat: 3, tasbihCount: 33, prayersLogged: ['fajr'] },
            'update',
        );

        const fragments = sqlMock.mock.calls.map((call) => (call[0] as unknown as string[]).join('?'));
        expect(fragments.some((text) => text.includes('GREATEST') && text.includes('?'))).toBe(true);
        expect(fragments.some((text) => text.includes('jsonb_agg(DISTINCT prayer)'))).toBe(true);
        mutableDb.insert = originalInsert; // the mock is shared with the tests that follow
        const merged = upsert.onConflictDoUpdate.mock.calls[0][0].set;
        expect(merged).not.toHaveProperty('prayersLogged', ['fajr']);
    });
});

describe('DbSyncRepository undo', () => {
    it('takes back the Hasanah and streak day of an undone mission', async () => {
        const today = new Date().toISOString().slice(0, 10);
        await new DbSyncRepository('u1').syncMission({ id: 'tasbih_99', completedDate: today }, 'delete');

        expect(reverseProgressionEvidence).toHaveBeenCalledWith('u1', {
            source: 'mission', sourceId: `tasbih_99:${today}`, localDate: today,
        });
    });

    it('ignores an undo for an unknown mission or a day outside the window', async () => {
        vi.mocked(reverseProgressionEvidence).mockClear();
        const repo = new DbSyncRepository('u1');
        await repo.syncMission({ id: 'not_a_mission', completedDate: '2026-01-01' }, 'delete');
        await repo.syncMission({ id: 'tasbih_99', completedDate: '2020-01-01' }, 'delete');

        expect(reverseProgressionEvidence).not.toHaveBeenCalled();
    });
});

describe('DbSyncRepository hasanah events', () => {
    beforeEach(() => {
        captured.evidence = [];
        vi.mocked(raiseProgressionEvidence).mockClear();
    });
    const today = () => new Date().toISOString().slice(0, 10);

    it('prices the award itself and ends the id with the date', async () => {
        await new DbSyncRepository('u1').syncHasanahEvent({ kind: 'taraweh', key: '1447-5', amount: 15, localDate: today() }, 'create');
        expect(captured.evidence[0]).toMatchObject({ source: 'mission', sourceId: `taraweh:1447-5:${today()}`, hasanah: 15, countsForStreak: true });
    });

    it('refuses an amount the client invented, so the entry is reported as failed', async () => {
        await expect(new DbSyncRepository('u1').syncHasanahEvent({ kind: 'taraweh', key: '1447-5', amount: 9999, localDate: today() }, 'create'))
            .rejects.toThrow('invalid hasanah event');
        expect(captured.evidence).toHaveLength(0);
    });

    it('raises reading time instead of ignoring the second report of the day', async () => {
        await new DbSyncRepository('u1').syncHasanahEvent({ kind: 'quran_time', key: 'time', amount: 12, localDate: today() }, 'update');
        expect(raiseProgressionEvidence).toHaveBeenCalledWith('u1', expect.objectContaining({ source: 'quran', hasanah: 12 }));
    });

    it('skips awards outside the sync window without an error', async () => {
        const repo = new DbSyncRepository('u1');
        await repo.syncHasanahEvent({ kind: 'taraweh', key: '1447-5', amount: 15, localDate: '2020-01-01' }, 'create');
        expect(captured.evidence).toHaveLength(0);
        expect(repo.rejected).toBe(1);
    });
});

describe('prayer reward by gender (decided by the server)', () => {
    beforeEach(() => {
        captured.rows = [];
        captured.evidence = [];
    });
    const today = () => new Date().toISOString().slice(0, 10);

    it('pays a woman the full amount even when an older app reports the "alone" amount', async () => {
        gender.value = 'female';
        await new DbSyncRepository('u1').syncMissionsBatch([{ id: 'fajr_prayer', completedAt: today(), hasanahEarned: 25 }]);
        expect(captured.rows[0]).toMatchObject({ hasanahEarned: 75 });
        expect(captured.evidence[0]).toMatchObject({ hasanah: 75 });
    });

    it('keeps the amount a man reports: alone 25, congregation 75', async () => {
        gender.value = 'male';
        await new DbSyncRepository('u1').syncMissionsBatch([
            { id: 'fajr_prayer', completedAt: today(), hasanahEarned: 25 },
            { id: 'dhuhr_prayer', completedAt: today(), hasanahEarned: 75 },
        ]);
        expect(captured.rows.map((row) => row.hasanahEarned)).toEqual([25, 75]);
    });

    it('maps the late (half) amounts the same way and leaves other missions alone', () => {
        expect(genderAdjustedReward('fajr_prayer', 12, 'female')).toBe(37);
        expect(genderAdjustedReward('fajr_prayer', 37, 'female')).toBe(37);
        expect(genderAdjustedReward('tasbih_99', 25, 'female')).toBe(25);
        expect(genderAdjustedReward('fajr_prayer', 25, null)).toBe(25);
    });
});

describe('DbSyncRepository bookmark batch', () => {
    it('writes many bookmarks in one insert, last one wins per verse, and skips bad ones', async () => {
        const { db } = await import('@/db');
        const insertValues: unknown[][] = [];
        const conflict = vi.fn().mockResolvedValue(undefined);
        const mutableDb = db as unknown as { insert: () => unknown };
        const originalInsert = mutableDb.insert;
        mutableDb.insert = () => ({ values: (rows: unknown[]) => { insertValues.push(rows); return { onConflictDoUpdate: conflict }; } });

        await new DbSyncRepository('u1').syncBookmarksBatch([
            { surahId: 2, verseId: 255, surahName: 'Al-Baqarah', verseText: 'a', note: 'old' },
            { surahId: 2, verseId: 255, surahName: 'Al-Baqarah', verseText: 'a', note: 'new' },
            { surahId: 3, verseId: 1, surahName: 'Ali Imran', verseText: 'b' },
            { surahId: 'x', verseId: 1 },
            { surahId: 0, verseId: 1 },
        ]);
        mutableDb.insert = originalInsert;

        expect(insertValues).toHaveLength(1);
        expect(insertValues[0]).toHaveLength(2);
        expect(insertValues[0]).toEqual(expect.arrayContaining([expect.objectContaining({ key: '2:255', note: 'new' })]));
        expect(conflict).toHaveBeenCalledTimes(1);
    });

    it('does nothing for an empty or entirely invalid batch', async () => {
        await expect(new DbSyncRepository('u1').syncBookmarksBatch([{ surahId: 'x' }])).resolves.toBeUndefined();
    });
});
