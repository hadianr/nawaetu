import { NextResponse } from "next/server";
import { db } from "@/db";
import { userCompletedMissions, userStreakDays, users } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const [missionsCompleted, qualifiedDays, registeredUsers] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(userCompletedMissions),
      db.select({ count: sql<number>`count(*)` }).from(userStreakDays),
      db.select({ count: sql<number>`count(*)` }).from(users),
    ]);
    return NextResponse.json({
      missionsCompleted: Number(missionsCompleted[0]?.count ?? 0),
      activeWorshipDays: Number(qualifiedDays[0]?.count ?? 0),
      users: Number(registeredUsers[0]?.count ?? 0),
    }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ error: "Global stats unavailable" }, { status: 503 });
  }
}
