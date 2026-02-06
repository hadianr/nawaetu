import admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

if (!admin.apps.length) {
    try {
        // Try to load from local file first (most reliable for development)
        const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");

        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("Firebase Admin initialized from local file.");
        } else {
            console.warn("firebase-service-account.json not found. Push notifications disabled.");
        }
    } catch (error) {
        console.error("Error initializing Firebase Admin SDK:", error);
    }
}

export const messagingAdmin = admin.apps.length ? admin.messaging() : null;
export default admin;
