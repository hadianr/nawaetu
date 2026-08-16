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

import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocale } from "@/context/LocaleContext";

interface ShareAppCardProps {
    t: any;
    isDaylight: boolean;
}

export default function ShareAppCard({ t, isDaylight }: ShareAppCardProps) {
    const { locale } = useLocale();

    const handleShare = async () => {
        const shareData = {
            title: 'Nawaetu - Teman Ibadah Digital',
            text: 'Yuk, luruskan niat ibadah bersama Nawaetu! Al-Quran, Jadwal Sholat, Tasbih Digital, Jurnal Niat, dan AI Mentor Islami. ✨',
            url: 'https://nawaetu.com/?utm_source=settings_share&utm_medium=social&utm_campaign=app_share'
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success(locale === 'id' ? 'Terima kasih telah membagikan Nawaetu!' : 'Thanks for sharing Nawaetu!');
            } else {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                toast.success(locale === 'id' ? 'Link berhasil disalin!' : 'Link copied to clipboard!');
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                toast.error(locale === 'id' ? 'Gagal membagikan' : 'Failed to share');
            }
        }
    };

    return (
        <div className={cn(
            "border rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-all gap-3",
            isDaylight
                ? "bg-slate-50 border-slate-200/60 shadow-xs"
                : "bg-white/[0.02] border-white/10"
        )}>
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                    isDaylight ? "bg-slate-200/60 text-slate-700" : "bg-white/5 text-[rgb(var(--color-primary-light))]"
                )}>
                    <Share2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className={cn(
                        "text-xs font-bold leading-tight truncate",
                        isDaylight ? "text-slate-900" : "text-white"
                    )}>
                        {t.shareAppCardTitle || "Bagikan Aplikasi"}
                    </h3>
                    <p className={cn(
                        "text-[10px] leading-tight truncate mt-0.5",
                        isDaylight ? "text-slate-500" : "text-white/40"
                    )}>
                        {t.shareAppCardDesc || "Ajak teman & keluarga beribadah bersama."}
                    </p>
                </div>
            </div>
            <Button
                onClick={handleShare}
                size="sm"
                className={cn(
                    "font-bold h-7 px-3 text-[11px] rounded-lg transition-all active:scale-[0.98] shrink-0 gap-1",
                    isDaylight
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white shadow-xs"
                )}
            >
                <Share2 className="w-3 h-3" />
                <span>{t.shareButtonCompact || "Bagikan"}</span>
            </Button>
        </div>
    );
}
