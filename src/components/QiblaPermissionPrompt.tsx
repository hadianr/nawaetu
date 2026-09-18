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

import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TranslationTree } from "@/context/LocaleContext";

export interface QiblaPermissionPromptProps {
    permissionGranted: boolean;
    error: string | null;
    showSessionNote: boolean;
    t: TranslationTree;
    requestCompassPermission: () => void;
}

export function QiblaPermissionPrompt({
    permissionGranted,
    error,
    showSessionNote,
    t,
    requestCompassPermission
}: QiblaPermissionPromptProps) {
    if (permissionGranted || error) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center transition-colors duration-500",
            "bg-[rgb(var(--color-canvas))]"
        )}>
            <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mb-6 ring-1 transition-all",
                "bg-[rgb(var(--color-primary))]/10 ring-[rgb(var(--color-primary))]/20"
            )}>
                <Compass className={cn(
                    "w-10 h-10 animate-[spin_3s_linear_infinite]",
                    "text-[rgb(var(--color-primary-light))]"
                )} />
            </div>

            <h3 className="text-2xl font-bold mb-3 tracking-tight text-[rgb(var(--color-text-strong))]">{t.qiblaPermissionTitle}</h3>
            <p className="max-w-xs mb-4 leading-relaxed text-[rgb(var(--color-text-muted))]">
                {t.qiblaPermissionDesc}
            </p>

            {/* Important Note - only show if no active session (app restart) */}
            {showSessionNote && (
                <div className={cn(
                    "mb-8 px-4 py-3 border rounded-lg max-w-sm",
                    "bg-[rgb(var(--color-warning))]/10 border-[rgb(var(--color-warning))]/25"
                )}>
                    <p className="text-xs leading-relaxed text-[rgb(var(--color-warning))]">
                        <strong className="text-[rgb(var(--color-warning))]">Penting:</strong> Setelah app di-close, klik tombol ini lagi untuk mengaktifkan kompas. Browser perlu izin ulang untuk akses sensor.
                    </p>
                </div>
            )}

            <Button
                onClick={requestCompassPermission}
                className={cn(
                    "rounded-full px-10 py-7 text-lg font-medium transition-all hover:scale-105 active:scale-95",
                    "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))] text-[rgb(var(--color-primary-foreground))] shadow-[var(--shadow-floating)]"
                )}
            >
                {t.qiblaPermissionButton}
            </Button>
        </div>
    );
}
