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

import { useEffect } from "react";
import dynamic from "next/dynamic";
const QiblaCompass = dynamic(() => import("@/components/QiblaCompass"), { ssr: false, loading: () => <div className="animate-pulse w-32 h-32 rounded-full border-4 border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-surface-subtle))]" /> });
import { trackKiblatView } from "@/lib/analytics/analytics";

export default function QiblaPage() {
    useEffect(() => {
        trackKiblatView();
    }, []);

    return (
        <div className="flex h-[100dvh] w-full max-w-full flex-col items-center justify-center font-sans overflow-hidden fixed inset-0 transition-colors duration-500 bg-[rgb(var(--color-canvas))] text-[rgb(var(--color-text))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),transparent)]">
            {/* Main Content - Centered & Full Width */}
            <div className="w-full h-full flex items-center justify-center relative">
                <QiblaCompass />
            </div>
        </div>
    );
}
