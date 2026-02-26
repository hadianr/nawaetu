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

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daily Missions - Misi Ibadah Harian | Nawaetu",
    description: "Selesaikan misi ibadah harian, kumpulkan XP, naik level, dan jaga streak. Gamifikasi ibadah yang membuat konsistensi lebih mudah dan menyenangkan.",
    keywords: ["Daily Missions", "Misi Harian", "Habit Tracker Ibadah", "Gamifikasi Islam", "Streak Ibadah", "XP Leveling"],
    alternates: {
        canonical: "https://nawaetu.com/missions",
    },
};

export default function MissionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
