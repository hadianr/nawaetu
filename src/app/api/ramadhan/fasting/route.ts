/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * GET  /api/ramadhan/fasting?year=1447  — Load user's fasting log for a year
 * POST /api/ramadhan/fasting            — Upsert a single day's fasting record
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { ramadhanFastingLog } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const year = parseInt(req.nextUrl.searchParams.get("year") ?? "0", 10);
    if (!year || isNaN(year)) {
        return NextResponse.json({ error: "year parameter is required" }, { status: 400 });
    }

    const rows = await db
        .select()
        .from(ramadhanFastingLog)
        .where(
            and(
                eq(ramadhanFastingLog.userId, session.user.id),
                eq(ramadhanFastingLog.hijriYear, year)
            )
        );

    return NextResponse.json({ rows });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { hijriYear, hijriDay, status, consequence, madzhab, note } = body;

    if (!hijriYear || !hijriDay || !status || !consequence) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert: try update, if nothing updated then insert
    const existing = await db
        .select({ id: ramadhanFastingLog.id })
        .from(ramadhanFastingLog)
        .where(
            and(
                eq(ramadhanFastingLog.userId, session.user.id),
                eq(ramadhanFastingLog.hijriYear, hijriYear),
                eq(ramadhanFastingLog.hijriDay, hijriDay)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        await db
            .update(ramadhanFastingLog)
            .set({
                status,
                consequence,
                madzhab: madzhab ?? null,
                note: note ?? null,
                updatedAt: new Date(),
            })
            .where(eq(ramadhanFastingLog.id, existing[0].id));
    } else {
        await db.insert(ramadhanFastingLog).values({
            userId: session.user.id,
            hijriYear,
            hijriDay,
            status,
            consequence,
            madzhab: madzhab ?? null,
            note: note ?? null,
            qadhaDone: false,
        });
    }

    return NextResponse.json({ success: true });
}
