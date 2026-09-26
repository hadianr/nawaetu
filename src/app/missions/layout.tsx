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

import { Children } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
    "Misi Harian dan Konsistensi Ibadah",
    "Aplikasi Muslim Nawaetu membantu menjaga rutinitas dengan misi harian, streak, XP, dan level. Progres aplikasi mendukung kebiasaan, bukan mengukur nilai amal.",
    "/missions",
);

export default function MissionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{Children.toArray(children)}</>;
}
