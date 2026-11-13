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

import { SIRAH_SOURCE } from "@/data/sirah/source";
import { useLocale } from "@/context/LocaleContext";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";

export function SirahSourceNote({ className }: { className?: string }) {
    const { locale } = useLocale();
    const isEn = locale === "en";
    const s = SIRAH_SOURCE;

    return (
        <p className={cn("text-xs leading-relaxed text-[rgb(var(--color-text-muted))]", className)}>
            <AppIcon name="book" size="xs" tone="muted" className="mr-1 inline-block align-[-2px]" />
            <span className="font-semibold">{isEn ? "Source:" : "Sumber:"}</span>{" "}
            <em>{s.book}</em> {isEn ? `by ${s.authorEn} (Indonesian translation).` : `karya ${s.authorId} (terjemahan bahasa Indonesia).`}{" "}
            {isEn ? "Text data and page numbers from the Sirah Nabawiyah dataset" : "Data teks dan nomor halaman dari dataset Sirah Nabawiyah"}{" "}
            {s.datasets.map((d, i) => (
                <span key={d.url}>
                    {i > 0 && ", "}
                    <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-[rgb(var(--color-primary-strong))]"
                        title={d.authors}
                    >
                        {d.label}
                    </a>
                </span>
            ))}{" "}
            ({s.institution}, {s.license}).
        </p>
    );
}
