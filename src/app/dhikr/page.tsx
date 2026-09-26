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

import { Suspense } from "react";
import DhikrCounter from "@/components/DhikrCounter";
import { Loader2 } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

// ISR: Page shell is static, state is client-side — cache for 1 hour
export const revalidate = 3600;

export const metadata = pageMetadata(
    "Tasbih Digital Online dan Penghitung Dzikir",
    "Gunakan tasbih digital online untuk dzikir harian, target bacaan, dan riwayat hitungan di Nawaetu.",
    "/dhikr",
);

export default function DhikrPage() {
    return (
        <div className="dhikr-page fixed inset-0 flex h-[100dvh] w-full max-w-full flex-col items-center overflow-hidden bg-transparent bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] font-sans text-[rgb(var(--color-text))]">
            <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-[rgb(var(--color-primary))]" /></div>}>
                <DhikrCounter />
            </Suspense>
        </div>
    );
}
