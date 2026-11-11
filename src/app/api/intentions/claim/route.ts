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

import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { intentions, users } from "@/db/schema";
import { getServerSession } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { syncRateLimiter } from "@/lib/rate-limit";
import { isInSyncWindow, localDateIn } from "@/lib/utils/timezone";
import { processProgressionEvidenceBatch } from "@/core/repositories/progression.repository";

export const maxDuration = 30;

const MAX_TOKENS = 5;

/**
 * A guest's intentions live on a hidden account named after the device token. When the guest signs up,
 * this moves them to the real account so the journal is not empty. Days the account already has are left
 * alone, and the hidden account is deleted afterwards.
 *
 * Body: { tokens: string[] } — the device tokens this browser used while it was a guest.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;
        if (!(await syncRateLimiter.check(`claim:${userId}`)).success) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const body = await req.json().catch(() => ({}));
        const tokens = [...new Set(
            (Array.isArray(body?.tokens) ? body.tokens : [])
                .filter((token: unknown): token is string => typeof token === "string" && token.length > 0 && token.length <= 200),
        )].slice(0, MAX_TOKENS) as string[];

        const today = localDateIn(new Date(), body?.timezone);
        const ownDays = new Set(
            (await db.select({ date: intentions.intentionDate }).from(intentions).where(eq(intentions.userId, userId)))
                .map((row) => new Date(row.date).toISOString().slice(0, 10)),
        );

        let moved = 0;
        for (const token of tokens) {
            const [guest] = await db.select({ id: users.id }).from(users).where(eq(users.email, `${token}@nawaetu.local`)).limit(1);
            if (!guest || guest.id === userId) continue;

            const rows = await db
                .select({ id: intentions.id, date: intentions.intentionDate })
                .from(intentions)
                .where(eq(intentions.userId, guest.id));
            const toMove = rows.filter((row) => !ownDays.has(new Date(row.date).toISOString().slice(0, 10)));

            if (toMove.length > 0) {
                await db.update(intentions).set({ userId, updatedAt: new Date() })
                    .where(and(eq(intentions.userId, guest.id), inArray(intentions.id, toMove.map((row) => row.id))));
                toMove.forEach((row) => ownDays.add(new Date(row.date).toISOString().slice(0, 10)));

                // The days count toward the streak and earn what a signed-in intention earns, inside the sync window.
                const evidence = toMove
                    .map((row) => ({ date: new Date(row.date).toISOString().slice(0, 10), occurredAt: new Date(row.date) }))
                    .filter((row) => isInSyncWindow(row.date, today))
                    .map((row) => ({
                        source: "intention" as const, sourceId: `intention:${row.date}`, hasanah: row.date === today ? 10 : 5,
                        localDate: row.date, occurredAt: row.occurredAt, timezone: "UTC",
                    }));
                if (evidence.length > 0) await processProgressionEvidenceBatch(userId, evidence);
                moved += toMove.length;
            }

            // Only the hidden placeholder account is ever deleted; its remaining intentions go with it.
            await db.delete(users).where(eq(users.id, guest.id));
        }

        return NextResponse.json({ success: true, moved });
    } catch (error) {
        logger.error("Error claiming guest intentions", error, { route: "/api/intentions/claim" });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
