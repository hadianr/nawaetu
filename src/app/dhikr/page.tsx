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
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tasbih Digital Online - Counter Dzikir Gratis | Nawaetu",
    description: "Tasbih digital online untuk dzikir harian. Counter tasbih gratis dengan fitur simpan otomatis, target dzikir, dan riwayat. Praktis untuk Subhanallah, Alhamdulillah, Allahu Akbar.",
    keywords: ["Tasbih Digital", "Counter Dzikir", "Tasbih Online", "Dzikir Counter", "Tasbih Gratis", "Subhanallah Counter"],
    alternates: {
        canonical: "https://nawaetu.com/dhikr",
    },
};

export default function DhikrPage() {
    return (
        <div className="flex h-[100dvh] w-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] text-white font-sans overflow-hidden fixed inset-0">
            <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-[rgb(var(--color-primary))]" /></div>}>
                <DhikrCounter />
            </Suspense>
        </div>
    );
}
