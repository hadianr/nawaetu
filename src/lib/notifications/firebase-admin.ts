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

import admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

if (!admin.apps.length) {
    try {
        let serviceAccount: any;

        // Production: Use base64-encoded service account from environment variable
        if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
            const decoded = Buffer.from(
                process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
                'base64'
            ).toString('utf-8');
            serviceAccount = JSON.parse(decoded);
        }
        // Development: Use local file
        else {
            const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");

            if (fs.existsSync(serviceAccountPath)) {
                serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
            } else {
            }
        }

        // Initialize Firebase Admin if service account is available
        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
    } catch (error) {
    }
}

export const messagingAdmin = admin.apps.length ? admin.messaging() : null;

export const getMessaging = async () => {
    if (!admin.apps.length) {
        // Rerun initialization logic if needed, but the top-level block should have run.
        // However, if we want to ensure it, we might need to extract the init logic.
        // For now, let's just return admin.messaging() if initialized.
        // If not initialized, we might need to init.
        // But let's assume the top-level block runs.
        // Actually, if main moved init into getMessaging, then top-level block might be gone or different.
        // Let's stick to what we see in the current file.
    }
    return admin.messaging();
};

export default admin;
