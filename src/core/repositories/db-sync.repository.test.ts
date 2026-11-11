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
