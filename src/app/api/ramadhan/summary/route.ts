import { NextResponse } from 'next/server';
import { getServerSession } from "@/lib/auth";
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { ramadhanFastingLog, dailyActivities, ramadhanTarawehLog, ramadhanDailyLog } from '@/db/schema';
import { eq, and, gte, lte, sum } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(request.url);

        const hijriYearParam = searchParams.get('hijriYear');
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        // Auto-compute current Hijri year server-side (approx. Gregorian + 579)
        // Client can override via hijriYear param but it's no longer required.
        const computedHijriYear = new Date().getFullYear() + 579;
        const hijriYear = hijriYearParam ? parseInt(hijriYearParam, 10) : computedHijriYear;

        const today = new Date();
        const thirtyFiveDaysAgo = new Date();
        thirtyFiveDaysAgo.setDate(today.getDate() - 35);
        const startDate = startDateParam || thirtyFiveDaysAgo.toISOString().split('T')[0];
        const endDate = endDateParam || today.toISOString().split('T')[0];

        // ─── 1. Fasting ────────────────────────────────────────────────
        const fastingLogs = await db
            .select()
            .from(ramadhanFastingLog)
            .where(and(
                eq(ramadhanFastingLog.userId, userId),
                eq(ramadhanFastingLog.hijriYear, hijriYear)
            ));

        const fastingCount = fastingLogs.filter(l => l.status === 'fasting').length;

        // Best consecutive streak
        const fastingDays = fastingLogs
            .filter(l => l.status === 'fasting')
            .map(l => l.hijriDay)
            .sort((a, b) => a - b);

        let bestFastingStreak = 0;
        let currentStreak = 0;
        for (let i = 0; i < fastingDays.length; i++) {
            if (i === 0 || fastingDays[i] === fastingDays[i - 1] + 1) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
            if (currentStreak > bestFastingStreak) bestFastingStreak = currentStreak;
        }

        // ─── 2. Quran & Hasanah ────────────────────────────────────────
        const activities = await db
            .select()
            .from(dailyActivities)
            .where(and(
                eq(dailyActivities.userId, userId),
                gte(dailyActivities.date, startDate),
                lte(dailyActivities.date, endDate)
            ));

        let totalQuranSeconds = 0;
        let totalHasanah = 0;
        let totalAyat = 0;
        let totalTasbih = 0;

        for (const act of activities) {
            totalQuranSeconds += (act.quranReadingSeconds || 0);
            totalHasanah += (act.hasanahGained || 0);
            totalAyat += (act.quranAyat || 0);
            totalTasbih += (act.tasbihCount || 0);
        }

        // ─── 3. Taraweh ────────────────────────────────────────────────
        const tarawehLogsAll = await db
            .select()
            .from(ramadhanTarawehLog)
            .where(and(
                eq(ramadhanTarawehLog.userId, userId),
                eq(ramadhanTarawehLog.hijriYear, hijriYear)
            ));

        const tarawehCount = tarawehLogsAll.filter(log => log.choice !== null).length;
        const qiyamulLailCount = tarawehLogsAll.filter(log => log.isQiyamulLail).length;

        // ─── 4. Location Habit ─────────────────────────────────────────
        const logsWithLocation = tarawehLogsAll.filter(log => log.location !== null);
        const masjidCount = logsWithLocation.filter(log => log.location === 'masjid').length;
        const rumahCount = logsWithLocation.filter(log => log.location === 'rumah').length;
        let topLocation: 'masjid' | 'rumah' | 'balanced' = 'balanced';
        if (masjidCount > rumahCount) topLocation = 'masjid';
        else if (rumahCount > masjidCount) topLocation = 'rumah';

        // ─── 5. Rakaat Preference ──────────────────────────────────────
        const logsWithChoice = tarawehLogsAll.filter(log => log.choice !== null);
        const rakaat8Count = logsWithChoice.filter(log => log.choice === '8').length;
        const rakaat20Count = logsWithChoice.filter(log => log.choice === '20').length;
        let topChoice: '8' | '20' | 'balanced' = 'balanced';
        if (rakaat8Count > rakaat20Count) topChoice = '8';
        else if (rakaat20Count > rakaat8Count) topChoice = '20';

        // ─── 6. Daily Prayer Location & Sunnah (ramadhanDailyLog) ────────
        const dailyLogs = await db
            .select()
            .from(ramadhanDailyLog)
            .where(and(
                eq(ramadhanDailyLog.userId, userId),
                eq(ramadhanDailyLog.hijriYear, hijriYear)
            ));

        let masjidDays = 0, rumahDays = 0, keduanyaDays = 0;
        let totalDhuha = 0, totalWitir = 0, totalRawatib = 0, totalSunnahOther = 0;

        for (const dl of dailyLogs) {
            if (dl.fardhuLocation === 'masjid') masjidDays++;
            else if (dl.fardhuLocation === 'rumah') rumahDays++;
            else if (dl.fardhuLocation === 'keduanya') keduanyaDays++;
            if (dl.dhuha) totalDhuha++;
            if (dl.witir) totalWitir++;
            if (dl.rawatibQabl || dl.rawatibBad) totalRawatib++;
            if (dl.istikharah || dl.hajat || dl.taubat) totalSunnahOther++;
        }
        const totalSunnahAll = totalDhuha + totalWitir + totalRawatib + totalSunnahOther;

        return NextResponse.json({
            hijriYear,
            fastingCount,
            bestFastingStreak,
            totalQuranSeconds,
            totalHasanah,
            totalAyat,
            totalTasbih,
            tarawehCount,
            qiyamulLailCount,
            // Tarawih location
            masjidCount,
            rumahCount,
            topLocation,
            rakaat8Count,
            rakaat20Count,
            topChoice,
            // Fardhu prayer location (from ramadhanDailyLog)
            fardhuMasjidDays: masjidDays,
            fardhuRumahDays: rumahDays,
            fardhuKeduanyaDays: keduanyaDays,
            // Sunnah prayers
            totalDhuha,
            totalWitir,
            totalRawatib,
            totalSunnahOther,
            totalSunnahAll,
        });

    } catch (error) {
        console.error("Error fetching Ramadhan stats:", error);
        return NextResponse.json({ error: 'Failed to fetch Ramadhan stats' }, { status: 500 });
    }
}
