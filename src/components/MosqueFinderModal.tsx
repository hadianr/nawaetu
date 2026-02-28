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

import { useEffect, useState } from "react";
import { X, MapPin, Tent, Building2, Car } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocale } from "@/context/LocaleContext";
import { SETTINGS_TRANSLATIONS } from "@/data/translations";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface MosqueFinderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MosqueFinderModal({ isOpen, onClose }: MosqueFinderModalProps) {
    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const options = [
        {
            id: "nearby",
            label: t.mosqueFinderOptionNearby,
            icon: MapPin,
            query: "masjid+terdekat",
            color: "from-blue-500/20 to-blue-600/20",
            iconColor: "text-blue-400"
        },
        {
            id: "musholla",
            label: t.mosqueFinderOptionMusholla,
            icon: Tent,
            query: "musholla+terdekat",
            color: "from-emerald-500/20 to-emerald-600/20",
            iconColor: "text-emerald-400"
        },
        {
            id: "grand",
            label: t.mosqueFinderOptionGrand,
            icon: Building2,
            query: "masjid+raya+terdekat",
            color: "from-amber-500/20 to-amber-600/20",
            iconColor: "text-amber-400"
        },
        {
            id: "restarea",
            label: t.mosqueFinderOptionRestArea,
            icon: Car,
            query: "rest+area+masjid+terdekat",
            color: "from-violet-500/20 to-violet-600/20",
            iconColor: "text-violet-400"
        }
    ];

    const handleSearch = (query: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
        window.open(url, '_blank');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className={cn(
                    "max-w-xs sm:max-w-sm border-white/10 p-0 overflow-hidden gap-0 mosque-finder-modal",
                    isDaylight ? "bg-white text-slate-900" : "bg-[#0a0f1c] text-white"
                )}
            >

                {/* Header with decorative background */}
                <div className={cn(
                    "relative p-6 pb-2 text-center bg-gradient-to-b from-[rgb(var(--color-primary))]/20 to-transparent",
                    isDaylight ? "border-b border-slate-100" : ""
                )}>
                    <DialogTitle className={cn(
                        "text-xl font-bold relative z-10",
                        isDaylight ? "text-slate-900" : "text-white"
                    )}>
                        {t.mosqueFinderTitle}
                    </DialogTitle>
                    <p className={cn(
                        "text-sm mt-1 relative z-10",
                        isDaylight ? "text-slate-500" : "text-white/60"
                    )}>
                        {t.mosqueFinderDesc}
                    </p>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className={cn(
                            "absolute right-4 top-4 p-2 rounded-full transition-colors z-20",
                            isDaylight ? "bg-slate-100 hover:bg-slate-200" : "bg-white/5 hover:bg-white/10"
                        )}
                    >
                        <X className={cn("w-4 h-4", isDaylight ? "text-slate-500" : "text-white/70")} />
                    </button>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 pt-2">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSearch(option.query)}
                            className={cn(
                                `flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${option.color} transition-all group`,
                                isDaylight
                                    ? "border-slate-100/50 hover:border-emerald-200 hover:bg-white shadow-sm"
                                    : "border-white/5 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]"
                            )}
                        >
                            <div className={cn(
                                `p-3 rounded-full group-hover:scale-110 transition-transform ${option.iconColor}`,
                                isDaylight ? "bg-white" : "bg-black/20"
                            )}>
                                <option.icon className="w-6 h-6" strokeWidth={2} />
                            </div>
                            <span className={cn(
                                "text-xs font-bold text-center",
                                isDaylight ? "text-slate-700" : "text-white/90"
                            )}>
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Footer Tip */}
                <div className={cn(
                    "p-3 text-center border-t",
                    isDaylight ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5"
                )}>
                    <p className={cn(
                        "text-[10px]",
                        isDaylight ? "text-slate-400" : "text-white/40"
                    )}>
                        {t.mosqueFinderButton}
                    </p>
                </div>

            </DialogContent>
        </Dialog>
    );
}
