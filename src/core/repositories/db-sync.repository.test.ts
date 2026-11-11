import { describe, expect, it, vi, beforeEach } from 'vitest';

const captured: { rows: Array<Record<string, unknown>>; evidence: Array<Record<string, unknown>> } = { rows: [], evidence: [] };

vi.mock('@/db', () => ({
    db: {
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
}));

import { DbSyncRepository } from './db-sync.repository';

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
        (db as unknown as { insert: () => typeof upsert }).insert = () => upsert;

        await new DbSyncRepository('u1').syncDailyActivity(
            { date: '2026-11-11', quranAyat: 3, tasbihCount: 33, prayersLogged: ['fajr'] },
            'update',
        );

        const fragments = sqlMock.mock.calls.map((call) => (call[0] as unknown as string[]).join('?'));
        expect(fragments.some((text) => text.includes('GREATEST') && text.includes('?'))).toBe(true);
        expect(fragments.some((text) => text.includes('jsonb_agg(DISTINCT prayer)'))).toBe(true);
        const merged = upsert.onConflictDoUpdate.mock.calls[0][0].set;
        expect(merged).not.toHaveProperty('prayersLogged', ['fajr']);
    });
});
