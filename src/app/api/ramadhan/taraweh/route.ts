import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/db";
import { ramadhanTarawehLog } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const yearParam = req.nextUrl.searchParams.get("year");
    const computedHijriYear = new Date().getFullYear() + 579;
    const year = yearParam ? parseInt(yearParam, 10) : computedHijriYear;
    if (!year || isNaN(year)) {
        return NextResponse.json({ error: "year parameter is required" }, { status: 400 });
    }

    const rows = await db
        .select()
        .from(ramadhanTarawehLog)
        .where(
            and(
                eq(ramadhanTarawehLog.userId, session.user.id),
                eq(ramadhanTarawehLog.hijriYear, year)
            )
        );

    return NextResponse.json({ rows });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { hijriYear, hijriDay, choice, location, isQiyamulLail } = body;

    // We allow choice to be null to handle 'deletion' / unchecking.
    if (!hijriYear || !hijriDay) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert logic
    const existing = await db
        .select({ id: ramadhanTarawehLog.id })
        .from(ramadhanTarawehLog)
        .where(
            and(
                eq(ramadhanTarawehLog.userId, session.user.id),
                eq(ramadhanTarawehLog.hijriYear, hijriYear),
                eq(ramadhanTarawehLog.hijriDay, hijriDay)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        await db
            .update(ramadhanTarawehLog)
            .set({
                choice: choice ?? null,
                location: location ?? null,
                isQiyamulLail: isQiyamulLail ?? false,
                updatedAt: new Date(),
            })
            .where(eq(ramadhanTarawehLog.id, existing[0].id));
    } else {
        await db.insert(ramadhanTarawehLog).values({
            userId: session.user.id,
            hijriYear,
            hijriDay,
            choice: choice ?? null,
            location: location ?? null,
            isQiyamulLail: isQiyamulLail ?? false,
        });
    }

    return NextResponse.json({ success: true });
}
