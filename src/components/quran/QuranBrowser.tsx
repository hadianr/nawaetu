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

import SurahList, { Chapter } from "@/components/quran/SurahList";
import { getKemenagChapters } from "@/lib/kemenag-api";
import QuranErrorMessage from "./QuranErrorMessage";

async function getChapters(): Promise<Chapter[]> {
    // Using Kemenag API for authentic Indonesian Quran standard
    return await getKemenagChapters();
}

export default async function QuranBrowser() {
    try {
        const chapters = await getChapters();
        return <SurahList chapters={chapters} />;
    } catch (error) {
        return <QuranErrorMessage />;
    }
}
