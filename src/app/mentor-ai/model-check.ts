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

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function checkAvailableModels() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return "Unauthorized";
    }

    if (!process.env.GEMINI_API_KEY) {
        return "No Key";
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to list models: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        // The API returns models in the format "models/gemini-pro", so we strip the prefix for cleaner output
        const models = (data.models || []).map((m: any) => m.name.replace("models/", ""));
        return `Available models: ${models.join(", ")}`;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error listing/checking models: ${errorMessage}`;
    }
}
