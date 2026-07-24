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

export interface QiblaPermissionPromptProps {
    permissionGranted: boolean;
    error: string | null;
    showSessionNote: boolean;
    isDaylight: boolean;
    t: any;
    requestCompassPermission: () => void;
}

export function QiblaPermissionPrompt({
    permissionGranted,
    error,
    showSessionNote,
    isDaylight,
    t,
    requestCompassPermission
}: QiblaPermissionPromptProps) {
    if (permissionGranted || error) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center transition-colors duration-500",
            isDaylight ? "bg-white" : "bg-[#0a0a0a]"
        )}>
            <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mb-6 ring-1 transition-all",
                isDaylight ? "bg-emerald-50 ring-emerald-100" : "bg-[rgb(var(--color-primary))]/10 ring-[rgb(var(--color-primary))]/20"
            )}>
                <Compass className={cn(
                    "w-10 h-10 animate-[spin_3s_linear_infinite]",
                    isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light))]"
                )} />
            </div>

            <h3 className={cn("text-2xl font-bold mb-3 tracking-tight", isDaylight ? "text-slate-900" : "text-white")}>{t.qiblaPermissionTitle}</h3>
            <p className={cn("max-w-xs mb-4 leading-relaxed", isDaylight ? "text-slate-500" : "text-white/60")}>
                {t.qiblaPermissionDesc}
            </p>

            {/* Important Note - only show if no active session (app restart) */}
            {showSessionNote && (
                <div className={cn(
                    "mb-8 px-4 py-3 border rounded-lg max-w-sm",
                    isDaylight ? "bg-amber-50 border-amber-100" : "bg-yellow-500/10 border-yellow-500/20"
                )}>
                    <p className={cn("text-xs leading-relaxed", isDaylight ? "text-amber-800" : "text-yellow-200/80")}>
                        <strong className={isDaylight ? "text-amber-900" : "text-yellow-200"}>Penting:</strong> Setelah app di-close, klik tombol ini lagi untuk mengaktifkan kompas. Browser perlu izin ulang untuk akses sensor.
                    </p>
                </div>
            )}

            <Button
                onClick={requestCompassPermission}
                className={cn(
                    "rounded-full px-10 py-7 text-lg font-medium transition-all hover:scale-105 active:scale-95",
                    isDaylight
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                        : "bg-[rgb(var(--color-primary-dark))] hover:bg-[rgb(var(--color-primary))] text-white shadow-[0_0_30px_rgba(var(--color-primary),0.25)]"
                )}
            >
                {t.qiblaPermissionButton}
            </Button>
        </div>
    );
}
