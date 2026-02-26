"use client";

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

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";

export default function QuranPageClient() {
    const { t } = useLocale();
    
    return (
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full text-white/70 hover:bg-white/10 hover:text-white">
                <Link href="/">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </Button>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-[rgb(var(--color-primary-light))]">{t.quranTitle}</h1>
                <p className="text-xs text-white/60">{t.quranSubtitle}</p>
            </div>
        </div>
    );
}
