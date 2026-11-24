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
import { useOptionalLocale } from "@/context/LocaleContext";

// Kept here, like error.tsx, so the page renders even if translations fail to load.
const COPY = {
    id: { title: "Halaman tidak ditemukan", body: "Halaman ini tidak ada atau sedang tidak tersedia.", home: "Kembali ke beranda" },
    en: { title: "Page not found", body: "This page does not exist or is not available right now.", home: "Back to home" },
};

export default function NotFound() {
    const copy = useOptionalLocale()?.locale === "en" ? COPY.en : COPY.id;

    return (
        <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 pb-nav text-center">
            <h1 className="text-2xl font-bold text-[rgb(var(--color-text-strong))]">{copy.title}</h1>
            <p className="max-w-sm text-sm text-[rgb(var(--color-text-muted))]">{copy.body}</p>
            <Link
                href="/"
                className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[rgb(var(--color-primary))] px-5 text-sm font-semibold text-[rgb(var(--color-primary-foreground))]"
            >
                {copy.home}
            </Link>
        </main>
    );
}
