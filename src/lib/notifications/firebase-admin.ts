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

import type { default as AdminType } from "firebase-admin";
import * as path from "path";
import * as fs from "fs/promises";

let admin: typeof AdminType;
let initPromise: Promise<void> | null = null;

async function getAdmin() {
    if (!admin) {
        admin = (await import("firebase-admin")).default;
    }
    return admin;
}

async function initializeFirebase() {
    const admin = await getAdmin();
    if (admin.apps.length) return;

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let serviceAccount: any;

        // Production: Use base64-encoded service account from environment variable
        if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
            const decoded = Buffer.from(
                process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
                'base64'
            ).toString('utf-8');
            serviceAccount = JSON.parse(decoded);
        }
        // Use JSON string from environment variable
        else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        }
        // Development: Use local file
        else {
            const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");
            try {
                const content = await fs.readFile(serviceAccountPath, "utf8");
                serviceAccount = JSON.parse(content);
            } catch {
                // File doesn't exist or is not readable, ignore
            }
        }

        // Initialize Firebase Admin if service account is available
        if (serviceAccount && !admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
    } catch (error) {
        console.error("Failed to initialize Firebase Admin:", error);
    }
}

export async function getMessaging() {
    const admin = await getAdmin();

    if (!admin.apps.length) {
        if (!initPromise) {
            initPromise = initializeFirebase();
        }
        await initPromise;
    }
    // Double check after init
    return admin.apps.length ? admin.messaging() : null;
}
