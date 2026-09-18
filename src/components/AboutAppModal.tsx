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

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocale } from "@/context/LocaleContext";
import { Sparkles, BookOpen, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface AboutAppModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AboutAppModal({ open, onOpenChange }: AboutAppModalProps) {
    const { t } = useLocale();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "max-w-sm w-[90%] rounded-[2rem] border p-0 overflow-hidden shadow-2xl [&>button]:z-50",
                "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]/25 text-[rgb(var(--color-text))]"
            )}>
                {/* Gradient Header - smaller height */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[rgb(var(--color-primary))]/20 via-[rgb(var(--color-primary))]/5 to-transparent pointer-events-none" />

                <DialogHeader className="px-6 pt-6 pb-2 relative z-10">
                    {/* Compact Logo */}
                    <div className={cn(
                        "w-14 h-14 mx-auto rounded-xl flex items-center justify-center shadow-lg mb-3 rotate-3 transition-all",
                        "bg-[rgb(var(--color-primary))] shadow-[var(--shadow-card)]"
                    )}>
                        <span className="text-3xl font-bold text-white">N</span>
                    </div>

                    <DialogTitle className="text-xl font-bold text-center">
                        {t.aboutAppName}
                    </DialogTitle>

                    <div className="flex justify-center mt-1.5">
                        <span className={cn(
                            "text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border",
                            "text-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20"
                        )}>
                            {t.aboutTagline}
                        </span>
                    </div>
                </DialogHeader>

                <div className="px-5 pb-6 space-y-4 relative z-10 text-center">
                    <div className="space-y-4 text-left">
                        {/* What is Nawaetu - merging description & title for compactness */}
                        <div className={cn(
                            "space-y-1.5 p-3.5 rounded-2xl border",
                            "bg-[rgb(var(--color-surface-subtle))]/60 border-[rgb(var(--color-border))]/20"
                        )}>
                            <h3 className="text-xs font-bold flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-[rgb(var(--color-primary))]" />
                                {t.aboutWhatIsTitle}
                            </h3>
                            <p className={cn(
                                "text-[11px] leading-relaxed",
                                "text-[rgb(var(--color-text-muted))]"
                            )}>
                                {t.aboutDescription}
                            </p>
                        </div>

                        {/* Our Approach */}
                        <div className={cn(
                            "space-y-1.5 p-3.5 rounded-2xl border transition-all",
                            "bg-[rgb(var(--color-primary))]/[0.05] border-[rgb(var(--color-primary))]/15"
                        )}>
                            <h3 className="text-xs font-bold flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-[rgb(var(--color-primary))]" />
                                {t.aboutApproachTitle}
                            </h3>
                            <p className={cn(
                                "text-[11px] leading-relaxed",
                                "text-[rgb(var(--color-text-muted))]"
                            )}>
                                {t.aboutApproachDesc}
                            </p>
                        </div>
                    </div>

                    {/* Footer - minimal */}
                    <div className="flex flex-col items-center gap-2 pt-2 border-t border-[rgb(var(--color-border))]/20">
                        <div className="flex items-center gap-1.5 text-[9px] font-medium text-[rgb(var(--color-text-muted))]">
                            <span className={cn(
                                "px-1.5 py-0.5 rounded border uppercase tracking-tighter",
                                "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]/20"
                            )}>
                                {t.aboutVersion.split(' ')[0].trim()}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-current opacity-20" />
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{t.aboutLastUpdate}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
