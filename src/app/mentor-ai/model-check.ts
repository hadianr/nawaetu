"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function checkAvailableModels() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return "Unauthorized";
    }

    if (!process.env.GEMINI_API_KEY) {
        return "No Key";
    }

    try {
        // This is a bit of a hack since the SDK might not expose listModels easily in the simplified client,
        // but let's try a standard model that usually works: 'gemini-2.5-flash'
        // If that fails, we really need to check the key permissions.

        // Actually, let's just try to generate with 'gemini-3-flash-preview' as a test.
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        await model.generateContent("test");
        return "gemini-3-flash-preview is working!";
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error listing/checking models: ${errorMessage}`;
    }
}
