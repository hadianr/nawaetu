"use server";

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
