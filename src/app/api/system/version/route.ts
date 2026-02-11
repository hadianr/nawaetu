import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/config/app-config";

export const dynamic = "force-dynamic"; // Ensure this is not cached at build time

export async function GET() {
    return NextResponse.json({
        version: APP_CONFIG.version, // This comes from the server-side build
        generatedAt: new Date().toISOString()
    });
}
