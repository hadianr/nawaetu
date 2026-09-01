import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { getServerSession } from "@/lib/auth";
import { getMessaging } from "@/lib/notifications/firebase-admin";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();
    if (!token || typeof token !== "string") {
        return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    let subscription = await db.query.pushSubscriptions.findFirst({
        where: and(
            eq(pushSubscriptions.token, token),
            eq(pushSubscriptions.userId, session.user.id),
            eq(pushSubscriptions.active, 1),
        ),
        columns: { id: true },
    });
    if (!subscription) {
        const anonymousSubscription = await db.query.pushSubscriptions.findFirst({
            where: and(
                eq(pushSubscriptions.token, token),
                eq(pushSubscriptions.active, 1),
                isNull(pushSubscriptions.userId),
            ),
            columns: { id: true },
        });
        if (anonymousSubscription) {
            await db.update(pushSubscriptions)
                .set({ userId: session.user.id, updatedAt: new Date() })
                .where(eq(pushSubscriptions.id, anonymousSubscription.id));
            subscription = anonymousSubscription;
        }
    }
    if (!subscription) {
        return NextResponse.json({ error: "Active subscription not found" }, { status: 404 });
    }

    const messaging = await getMessaging();
    if (!messaging) {
        return NextResponse.json({ error: "Firebase Admin is not configured" }, { status: 503 });
    }

    try {
        logger.info("FCM test send requested", {
            route: "/api/notifications/test",
            userId: session.user.id,
            tokenFingerprint: `${token.slice(0, 12)}…${token.length}`,
        });
        await messaging.send({
            token,
            notification: {
                title: "Nawaetu",
                body: "FCM push berhasil terhubung.",
            },
            data: {
                type: "notification_test",
                title: "Nawaetu",
                body: "FCM push berhasil terhubung.",
                url: "/settings",
            },
            webpush: {
                headers: { Urgency: "high", TTL: "300" },
                notification: {
                    title: "Nawaetu",
                    body: "FCM push berhasil terhubung.",
                    icon: "/icon-192x192.png",
                    badge: "/icon-192x192.png",
                    tag: "nawaetu-test",
                },
                fcmOptions: { link: new URL("/settings", req.url).toString() },
            },
        });
        logger.info("FCM test send accepted", {
            route: "/api/notifications/test",
            userId: session.user.id,
            tokenFingerprint: `${token.slice(0, 12)}…${token.length}`,
        });
    } catch (error: any) {
        logger.error("FCM test send failed", error, {
            route: "/api/notifications/test",
            userId: session.user.id,
            tokenFingerprint: `${token.slice(0, 12)}…${token.length}`,
        });
        if (error?.code === "messaging/registration-token-not-registered" || error?.code === "messaging/invalid-registration-token") {
            await db.update(pushSubscriptions)
                .set({ active: 0, updatedAt: new Date() })
                .where(eq(pushSubscriptions.id, subscription.id));
            return NextResponse.json({ error: "Device unregistered", reRegister: true }, { status: 410 });
        }
        throw error;
    }

    await db.update(pushSubscriptions)
        .set({ lastUsedAt: new Date(), updatedAt: new Date() })
        .where(eq(pushSubscriptions.id, subscription.id));

    return NextResponse.json({ success: true });
}
