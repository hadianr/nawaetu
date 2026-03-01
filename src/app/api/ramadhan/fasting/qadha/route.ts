/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * GET   /api/ramadhan/fasting/qadha?year=1447  — List pending qadha/fidyah days
 * PATCH /api/ramadhan/fasting/qadha            — Mark a day's obligation as done
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { ramadhanFastingLog } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const year = req.nextUrl.searchParams.get("year");
    const filters = [
        eq(ramadhanFastingLog.userId, session.user.id),
        ne(ramadhanFastingLog.consequence, "none"),
        eq(ramadhanFastingLog.qadhaDone, false),
    ];

    if (year) {
        filters.push(eq(ramadhanFastingLog.hijriYear, parseInt(year, 10)));
    }

    const rows = await db
        .select()
        .from(ramadhanFastingLog)
        .where(and(...filters));

    return NextResponse.json({ rows });
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { hijriYear, hijriDay } = await req.json();
    if (!hijriYear || !hijriDay) {
        return NextResponse.json({ error: "Missing hijriYear or hijriDay" }, { status: 400 });
    }

    await db
        .update(ramadhanFastingLog)
        .set({ qadhaDone: true, updatedAt: new Date() })
        .where(
            and(
                eq(ramadhanFastingLog.userId, session.user.id),
                eq(ramadhanFastingLog.hijriYear, hijriYear),
                eq(ramadhanFastingLog.hijriDay, hijriDay)
            )
        );

    return NextResponse.json({ success: true });
}
