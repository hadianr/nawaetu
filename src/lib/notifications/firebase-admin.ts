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

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getMessaging as getAdminMessaging, Messaging } from "firebase-admin/messaging";
import * as path from "path";
import * as fs from "fs";

// ponytail: init from env vars or local file fallback. ceiling: sync fs check only.
function initAdmin() {
    if (getApps().length) return;

    let rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
        ? Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf-8")
        : process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!rawJson) {
        const filePath = path.join(process.cwd(), "firebase-service-account.json");
        if (fs.existsSync(filePath)) {
            try {
                rawJson = fs.readFileSync(filePath, "utf-8");
            } catch {}
        }
    }

    if (!rawJson) return;

    try {
        initializeApp({ credential: cert(JSON.parse(rawJson)) });
    } catch (err) {
        console.error("Firebase Admin init failed:", err);
    }
}

export async function getMessaging(): Promise<Messaging | null> {
    initAdmin();
    return getApps().length ? getAdminMessaging() : null;
}
