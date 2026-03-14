import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { dailyActivities } from "@/db/schema";
import { and, eq } from "drizzle-orm";

function getLocalDateString() {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    today.setMinutes(today.getMinutes() - offset);
    return today.toISOString().split('T')[0];
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        if (!userId) return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });

        const dateString = getLocalDateString();

        const existingActivity = await db.query.dailyActivities.findFirst({
            where: and(
                eq(dailyActivities.userId, userId),
                eq(dailyActivities.date, dateString)
            ),
        });

        return NextResponse.json({ 
            success: true, 
            totalTodaySeconds: existingActivity?.quranReadingSeconds || 0 
        });
    } catch (error) {
        console.error("[QURAN_TIME_GET]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { additionalSeconds } = body;

        if (typeof additionalSeconds !== 'number' || additionalSeconds <= 0) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const userId = session.user.id;
        if (!userId) {
            return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
        }

        const dateString = getLocalDateString();

        const existingActivity = await db.query.dailyActivities.findFirst({
            where: and(
                eq(dailyActivities.userId, userId),
                eq(dailyActivities.date, dateString)
            ),
        });

        let newTotal = additionalSeconds;
        const additionalHasanah = Math.floor(additionalSeconds / 60);

        if (existingActivity) {
            newTotal = (existingActivity.quranReadingSeconds || 0) + additionalSeconds;
            const newHasanah = (existingActivity.hasanahGained || 0) + additionalHasanah;

            // Update existing record
            await db.update(dailyActivities)
                .set({
                    quranReadingSeconds: newTotal,
                    hasanahGained: newHasanah,
                    lastUpdatedAt: new Date(),
                })
                .where(
                    and(
                        eq(dailyActivities.userId, userId),
                        eq(dailyActivities.date, dateString)
                    )
                );
        } else {
            // Insert new record for today
            await db.insert(dailyActivities).values({
                userId,
                date: dateString,
                quranReadingSeconds: additionalSeconds,
                hasanahGained: additionalHasanah,
                lastUpdatedAt: new Date(),
            });
        }

        return NextResponse.json({ 
            success: true, 
            addedSeconds: additionalSeconds,
            addedHasanah: additionalHasanah,
            totalTodaySeconds: newTotal
        });
    } catch (error) {
        console.error("[QURAN_SYNC_TIME]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
