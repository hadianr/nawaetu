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

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { assertLocalDatabase, integrationEnabled } from './integration-guard';

// Talk to real Postgres: the unit tests for this code use mocked transactions, so the SQL itself
// (upserts, GREATEST, jsonb union, advisory locks, cascades) is only proven here.
vi.unmock('@/db');
vi.unmock('@/db/schema');
vi.unmock('drizzle-orm');

describe.skipIf(!integrationEnabled)('sync and progression (integration)', () => {
    const stamp = crypto.randomUUID();
    const userId = `it-prog-${stamp}`;
    const femaleId = `it-fem-${stamp}`;
    const donorId = `it-donor-${stamp}`;

    let db: typeof import('@/db').db;
    let s: typeof import('@/db/schema');
    let orm: typeof import('drizzle-orm');
    let progression: typeof import('@/core/repositories/progression.repository');
    let DbSyncRepository: typeof import('@/core/repositories/db-sync.repository').DbSyncRepository;
    let settleDonation: typeof import('@/lib/payments').settleDonation;

    /** A calendar day, counted back from today in UTC, as YYYY-MM-DD. */
    const day = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString().slice(0, 10);
    const evidence = (sourceId: string, localDate: string, hasanah = 10) => ({
        source: 'mission' as const, sourceId, hasanah, localDate, occurredAt: new Date(`${localDate}T05:00:00Z`), timezone: 'UTC',
    });

    const streakDays = async (id = userId) =>
        (await db.select({ date: s.userStreakDays.localDate, status: s.userStreakDays.status })
            .from(s.userStreakDays).where(orm.eq(s.userStreakDays.userId, id)).orderBy(s.userStreakDays.localDate))
            .map((row) => `${row.date}:${row.status}`);
    const streakState = async (id = userId) =>
        (await db.select().from(s.userStreakState).where(orm.eq(s.userStreakState.userId, id)))[0];
    const total = async (id = userId) =>
        (await db.select().from(s.userProgressState).where(orm.eq(s.userProgressState.userId, id)))[0]?.hasanahTotal ?? 0;

    beforeAll(async () => {
        assertLocalDatabase();
        ({ db } = await import('@/db'));
        s = await import('@/db/schema');
        orm = await import('drizzle-orm');
        progression = await import('@/core/repositories/progression.repository');
        ({ DbSyncRepository } = await import('@/core/repositories/db-sync.repository'));
        ({ settleDonation } = await import('@/lib/payments'));
        for (const id of [userId, femaleId, donorId]) {
            await db.insert(s.users).values({ id, email: `${id}@example.test`, ...(id === femaleId ? { gender: 'female' as const } : {}) });
        }
    });

    afterAll(async () => {
        // Most tables hang off the user row with ON DELETE CASCADE; transactions do not.
        await db.delete(s.transactions).where(orm.eq(s.transactions.userId, donorId));
        for (const id of [userId, femaleId, donorId]) await db.delete(s.users).where(orm.eq(s.users.id, id));
    });

    describe('the ledger', () => {
        it('records a batch in one go, ignores a replay, and counts the day once', async () => {
            const d = day(20);
            const first = await progression.processProgressionEvidenceBatch(userId, [
                evidence(`a:${d}`, d), evidence(`b:${d}`, d), evidence(`c:${d}`, d),
            ]);
            expect(first.inserted).toBe(3);
            expect(await total()).toBe(30);
            expect(await streakDays()).toEqual([`${d}:qualified`]);
            expect((await streakState()).currentDays).toBe(1);

            const replay = await progression.processProgressionEvidenceBatch(userId, [evidence(`a:${d}`, d), evidence(`b:${d}`, d)]);
            expect(replay.inserted).toBe(0);
            expect(await total()).toBe(30);
        });

        it('continues the streak in order, and reverses an award without losing a day that has other activity', async () => {
            const d = day(20);
            const next = day(19);
            await progression.processProgressionEvidenceBatch(userId, [evidence(`a:${next}`, next), evidence(`b:${next}`, next)]);
            expect((await streakState()).currentDays).toBe(2);
            expect(await total()).toBe(50);

            // Another award exists that day, so the day stays.
            expect((await progression.reverseProgressionEvidence(userId, { source: 'mission', sourceId: `a:${next}`, localDate: next })).reversed).toBe(true);
            expect(await total()).toBe(40);
            expect(await streakDays()).toContain(`${next}:qualified`);

            // The last award of that day goes: the day goes too and the streak is rebuilt.
            await progression.reverseProgressionEvidence(userId, { source: 'mission', sourceId: `b:${next}`, localDate: next });
            expect(await total()).toBe(30);
            expect(await streakDays()).toEqual([`${d}:qualified`]);
            expect((await streakState()).currentDays).toBe(1);

            // Reversing something that was never recorded is a no-op.
            expect((await progression.reverseProgressionEvidence(userId, { source: 'mission', sourceId: 'nope:1', localDate: d })).reversed).toBe(false);
        });

        it('grows an award during the day instead of ignoring the second report', async () => {
            const d = day(15);
            const reading = (minutes: number) => ({ ...evidence(`quran_time:time:${d}`, d, minutes), source: 'quran' as const });
            const before = await total();

            await progression.raiseProgressionEvidence(userId, reading(5));
            await progression.raiseProgressionEvidence(userId, reading(12));
            await progression.raiseProgressionEvidence(userId, reading(8)); // lower: ignored

            expect(await total()).toBe(before + 12);
            const rows = await db.select().from(s.hasanahLedger).where(orm.eq(s.hasanahLedger.sourceId, `quran_time:time:${d}`));
            expect(rows).toHaveLength(1);
            expect(rows[0].amount).toBe(12);
        });
    });

    describe('frozen streak days', () => {
        // A separate account so the days above do not interfere.
        const frozenUser = `it-frozen-${stamp}`;
        beforeAll(async () => { await db.insert(s.users).values({ id: frozenUser, email: `${frozenUser}@example.test` }); });
        afterAll(async () => { await db.delete(s.users).where(orm.eq(s.users.id, frozenUser)); });

        it('stores the missed day a freeze protected, then makes it a real day when its evidence arrives late', async () => {
            // Seven days in a row earn a freeze; the eighth day is missed; the ninth continues the streak.
            const days = [28, 27, 26, 25, 24, 23, 22].map(day);
            for (const d of days) await progression.processProgressionEvidenceBatch(frozenUser, [evidence(`m:${d}`, d)]);
            const missed = day(21);
            const resumed = day(20);
            await progression.processProgressionEvidenceBatch(frozenUser, [evidence(`m:${resumed}`, resumed)]);

            expect(await streakDays(frozenUser)).toContain(`${missed}:frozen`);
            expect((await streakState(frozenUser)).currentDays).toBe(8);
            expect((await streakState(frozenUser)).freezesAvailable).toBe(0);

            // Evidence for the missed day arrives late: the row becomes a real day instead of blocking it.
            await progression.processProgressionEvidenceBatch(frozenUser, [evidence(`late:${missed}`, missed)]);

            const after = await streakDays(frozenUser);
            expect(after).toContain(`${missed}:qualified`);
            expect(after.filter((entry) => entry.endsWith(':frozen'))).toEqual([]);
            expect((await streakState(frozenUser)).currentDays).toBe(9); // no freeze needed any more
        });
    });

    describe('daily activity merge', () => {
        it('keeps the higher counters and the union of prayers when a second device syncs less', async () => {
            const repo = new DbSyncRepository(userId);
            const d = day(1);
            await repo.syncDailyActivity({ date: d, quranAyat: 10, tasbihCount: 99, prayersLogged: ['fajr', 'dhuhr'] }, 'update');
            // A second device that has only seen part of the day.
            await repo.syncDailyActivity({ date: d, quranAyat: 3, tasbihCount: 33, prayersLogged: ['dhuhr', 'asr'] }, 'update');

            const [row] = await db.select().from(s.dailyActivities)
                .where(orm.and(orm.eq(s.dailyActivities.userId, userId), orm.eq(s.dailyActivities.date, d)));
            expect(row.quranAyat).toBe(10);
            expect(row.tasbihCount).toBe(99);
            expect([...(row.prayersLogged ?? [])].sort()).toEqual(['asr', 'dhuhr', 'fajr']);
        });
    });

    describe('missions and bookmarks written in batches', () => {
        it('prices a prayer for a woman in full, writes the ledger, and takes it back on undo', async () => {
            const repo = new DbSyncRepository(femaleId);
            const d = day(2);
            await repo.syncMissionsBatch([{ id: 'fajr_prayer', completedAt: d, completedDate: d, hasanahEarned: 25, timezone: 'UTC' }]);

            const [mission] = await db.select().from(s.userCompletedMissions).where(orm.eq(s.userCompletedMissions.userId, femaleId));
            expect(mission.hasanahEarned).toBe(75);
            expect(mission.completedDate).toBe(d);
            expect(await total(femaleId)).toBe(75);

            await repo.syncMission({ id: 'fajr_prayer', completedDate: d, timezone: 'UTC' }, 'delete');
            expect(await db.select().from(s.userCompletedMissions).where(orm.eq(s.userCompletedMissions.userId, femaleId))).toHaveLength(0);
            expect(await total(femaleId)).toBe(0);
            expect(await streakDays(femaleId)).toEqual([]);
        });

        it('refuses a day outside the window and counts it as rejected', async () => {
            const repo = new DbSyncRepository(userId);
            await repo.syncMissionsBatch([{ id: 'tasbih_99', completedAt: day(90), completedDate: day(90), hasanahEarned: 30 }]);
            expect(repo.rejected).toBe(1);
            const rows = await db.select().from(s.userCompletedMissions)
                .where(orm.and(orm.eq(s.userCompletedMissions.userId, userId), orm.eq(s.userCompletedMissions.completedDate, day(90))));
            expect(rows).toHaveLength(0);
        });

        it('upserts many bookmarks in one statement and updates the existing one', async () => {
            const repo = new DbSyncRepository(userId);
            await repo.syncBookmarksBatch([
                { surahId: 2, verseId: 255, surahName: 'Al-Baqarah', verseText: 'a', note: 'first' },
                { surahId: 3, verseId: 1, surahName: 'Ali Imran', verseText: 'b' },
            ]);
            await repo.syncBookmarksBatch([{ surahId: 2, verseId: 255, surahName: 'Al-Baqarah', verseText: 'a', note: 'second', tags: ['hafalan'] }]);

            const rows = await db.select().from(s.bookmarks).where(orm.eq(s.bookmarks.userId, userId)).orderBy(s.bookmarks.key);
            expect(rows.map((row) => row.key)).toEqual(['2:255', '3:1']);
            expect(rows[0].note).toBe('second');
            expect(rows[0].tags).toEqual(['hafalan']);
        });
    });

    describe('donations', () => {
        it('settles and credits once, and a second settle does not credit again', async () => {
            const [tx] = await db.insert(s.transactions).values({ userId: donorId, amount: 50_000, status: 'pending' }).returning();

            expect(await settleDonation({ id: tx.id, userId: donorId, amount: 50_000 }, `mayar-${stamp}`)).toBe(true);
            expect(await settleDonation({ id: tx.id, userId: donorId, amount: 50_000 })).toBe(false);

            const [donor] = await db.select().from(s.users).where(orm.eq(s.users.id, donorId));
            expect(donor.totalInfaq).toBe(50_000);
            expect(donor.isMuhsinin).toBe(true);
            const [settled] = await db.select().from(s.transactions).where(orm.eq(s.transactions.id, tx.id));
            expect(settled.status).toBe('settlement');
        });
    });
});
