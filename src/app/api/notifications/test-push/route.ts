/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { NextRequest, NextResponse } from "next/server";
import { getMessaging } from "@/lib/notifications/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const { token, title, body } = await req.json();

        const messagingAdmin = await getMessaging();

        if (!messagingAdmin) {
            return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
        }

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        const message = {
            notification: {
                title: title || "Halo Sobat Nawaetu!",
                body: body || "Ini adalah notifikasi percobaan.",
            },
            data: {
                type: "test",
                timestamp: new Date().toISOString(),
            },
            token: token,
        };


        const response = await messagingAdmin.send(message);

        return NextResponse.json({ success: true, messageId: response });
    } catch (error: any) {

        return NextResponse.json({
            error: "Failed to send notification",
            details: error?.message || "Unknown error"
        }, { status: 500 });
    }
}
