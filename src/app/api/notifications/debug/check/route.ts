
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        const subscription = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.token, token))
            .limit(1);

        if (subscription.length === 0) {
            return NextResponse.json({ found: false });
        }

        return NextResponse.json({
            found: true,
            data: subscription[0]
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
