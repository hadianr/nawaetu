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
            console.log("Firebase Admin initialized from environment variable (production).");
        }
        // Development: Use local file
        else {
            const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");

            if (fs.existsSync(serviceAccountPath)) {
                serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
                console.log("Firebase Admin initialized from local file (development).");
            } else {
                console.warn("⚠️ Firebase service account not found. Push notifications disabled.");
            }
        }

        // Initialize Firebase Admin if service account is available
        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
    } catch (error) {
        console.error("❌ Error initializing Firebase Admin SDK:", error);
    }
}

export const messagingAdmin = admin.apps.length ? admin.messaging() : null;
export default admin;
