import { NextResponse } from "next/server";
import { db } from "@/db";
import { userCompletedMissions, userStreakDays, users } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // One query on purpose: several concurrent queries on our single pooled connection can wedge it.
    // count(*) comes back as a string (bigint) from postgres-js.
    const [row] = await db.execute<{ missions: string; days: string; users: string }>(sql`
      select
        (select count(*) from ${userCompletedMissions}) as missions,
        (select count(*) from ${userStreakDays}) as days,
        (select count(*) from ${users}) as users
    `);
    return NextResponse.json({
      missionsCompleted: Number(row?.missions ?? 0),
      activeWorshipDays: Number(row?.days ?? 0),
      users: Number(row?.users ?? 0),
    }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ error: "Global stats unavailable" }, { status: 503 });
  }
}
