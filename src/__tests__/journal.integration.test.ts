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

// Bypass the global mocks from setup.ts so this file talks to real Postgres.
vi.unmock('@/db');
vi.unmock('@/db/schema');
vi.unmock('drizzle-orm');

describe.skipIf(!integrationEnabled)('intention journal (integration)', () => {
    const userId = `it-${crypto.randomUUID()}`;
    let db: typeof import('@/db').db;
    let intentions: typeof import('@/db/schema').intentions;
    let users: typeof import('@/db/schema').users;
    let eq: typeof import('drizzle-orm').eq;

    beforeAll(async () => {
        assertLocalDatabase();
        ({ db } = await import('@/db'));
        ({ intentions, users } = await import('@/db/schema'));
        ({ eq } = await import('drizzle-orm'));
        await db.insert(users).values({ id: userId, email: `${userId}@example.test` });
    });

    afterAll(async () => {
        if (db) await db.delete(users).where(eq(users.id, userId)); // cascades to intentions
    });

    it('creates, reads and reflects on an intention', async () => {
        const [created] = await db
            .insert(intentions)
            .values({ userId, intentionText: 'Be patient', intentionDate: new Date() })
            .returning();
        expect(created.reflectionText).toBeNull();

        const rows = await db.select().from(intentions).where(eq(intentions.userId, userId));
        expect(rows).toHaveLength(1);

        await db
            .update(intentions)
            .set({ reflectionText: 'Done', reflectionRating: 4, reflectedAt: new Date() })
            .where(eq(intentions.id, created.id));
        const [reflected] = await db.select().from(intentions).where(eq(intentions.id, created.id));
        expect(reflected.reflectionRating).toBe(4);
    });
});
