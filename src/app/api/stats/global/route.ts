import { NextResponse } from "next/server";
import { db } from "@/db";
import { intentions, userCompletedMissions, userStreakDays } from "@/db/schema";
import { sql } from "drizzle-orm";

export const maxDuration = 30;

// Fardhu and sunnah prayer missions, under both the old and the current ids.
const PRAYER_MISSION = "(^sholat_|_prayer(_male|_female)?$)";

export async function GET() {
  try {
    // One query on purpose: several concurrent queries on our single pooled connection can wedge it.
    // count(*) comes back as a string (bigint) from postgres-js.
    const [row] = await db.execute<{ prayers: string; intentions: string; active: string }>(sql`
      select
        (select count(*) from ${userCompletedMissions} where ${userCompletedMissions.missionId} ~ ${PRAYER_MISSION}) as prayers,
        (select count(*) from ${intentions}) as intentions,
        (select count(distinct ${userStreakDays.userId}) from ${userStreakDays}
          where ${userStreakDays.localDate} > current_date - 7) as active
    `);
    return NextResponse.json({
      prayers: Number(row?.prayers ?? 0),
      intentions: Number(row?.intentions ?? 0),
      activeThisWeek: Number(row?.active ?? 0),
    }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ error: "Global stats unavailable" }, { status: 503 });
  }
}
