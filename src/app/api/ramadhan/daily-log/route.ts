import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "@/lib/auth";
import { db } from '@/db';
import { ramadhanDailyLog } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const yearParam = req.nextUrl.searchParams.get('year');
    const computedHijriYear = new Date().getFullYear() + 579;
    const year = yearParam ? parseInt(yearParam, 10) : computedHijriYear;

    const rows = await db
        .select()
        .from(ramadhanDailyLog)
        .where(and(
            eq(ramadhanDailyLog.userId, session.user.id),
            eq(ramadhanDailyLog.hijriYear, year),
        ));

    return NextResponse.json({ rows });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
        hijriYear, hijriDay,
        fajrAtMasjid, dhuhrAtMasjid, asrAtMasjid, maghribAtMasjid, ishaAtMasjid,
        dhuha, rawatibQabl, rawatibBad, witir, istikharah, hajat, taubat,
    } = body;

    if (!hijriYear || !hijriDay) {
        return NextResponse.json({ error: 'hijriYear and hijriDay are required' }, { status: 400 });
    }

    // Compute summary fardhuLocation from individual booleans
    const atMasjidCount = [fajrAtMasjid, dhuhrAtMasjid, asrAtMasjid, maghribAtMasjid, ishaAtMasjid]
        .filter(v => v === true).length;
    const loggedCount = [fajrAtMasjid, dhuhrAtMasjid, asrAtMasjid, maghribAtMasjid, ishaAtMasjid]
        .filter(v => v !== null && v !== undefined).length;
    let fardhuLocation: 'masjid' | 'rumah' | 'keduanya' | null = null;
    if (loggedCount > 0) {
        if (atMasjidCount === loggedCount) fardhuLocation = 'masjid';
        else if (atMasjidCount === 0) fardhuLocation = 'rumah';
        else fardhuLocation = 'keduanya';
    }

    const userId = session.user.id;

    const existing = await db
        .select({ id: ramadhanDailyLog.id })
        .from(ramadhanDailyLog)
        .where(and(
            eq(ramadhanDailyLog.userId, userId),
            eq(ramadhanDailyLog.hijriYear, hijriYear),
            eq(ramadhanDailyLog.hijriDay, hijriDay),
        ));

    const data = {
        fardhuLocation,
        fajrAtMasjid: fajrAtMasjid ?? null,
        dhuhrAtMasjid: dhuhrAtMasjid ?? null,
        asrAtMasjid: asrAtMasjid ?? null,
        maghribAtMasjid: maghribAtMasjid ?? null,
        ishaAtMasjid: ishaAtMasjid ?? null,
        dhuha: Boolean(dhuha),
        rawatibQabl: Boolean(rawatibQabl),
        rawatibBad: Boolean(rawatibBad),
        witir: Boolean(witir),
        istikharah: Boolean(istikharah),
        hajat: Boolean(hajat),
        taubat: Boolean(taubat),
        updatedAt: new Date(),
    };

    if (existing.length > 0) {
        await db.update(ramadhanDailyLog).set(data)
            .where(eq(ramadhanDailyLog.id, existing[0].id));
    } else {
        await db.insert(ramadhanDailyLog).values({
            userId, hijriYear, hijriDay, ...data,
        });
    }

    return NextResponse.json({ success: true });
}
