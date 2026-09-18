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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";

interface MosqueFinderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MosqueFinderModal({ isOpen, onClose }: MosqueFinderModalProps) {
    const { t } = useLocale();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        queueMicrotask(() => setMounted(true));
    }, []);

    if (!mounted) return null;

    const options = [
        {
            id: "nearby",
            label: t?.mosqueFinderOptionNearby ?? "Masjid Terdekat",
            icon: MapPin,
            query: "masjid+terdekat",
            color: "bg-[rgb(var(--color-info))]/10",
            iconColor: "text-[rgb(var(--color-info))]"
        },
        {
            id: "musholla",
            label: t?.mosqueFinderOptionMusholla ?? "Musholla",
            icon: Tent,
            query: "musholla+terdekat",
            color: "bg-[rgb(var(--color-success))]/10",
            iconColor: "text-[rgb(var(--color-success))]"
        },
        {
            id: "grand",
            label: t?.mosqueFinderOptionGrand ?? "Masjid Raya",
            icon: Building2,
            query: "masjid+raya+terdekat",
            color: "bg-[rgb(var(--color-warning))]/10",
            iconColor: "text-[rgb(var(--color-warning))]"
        },
        {
            id: "restarea",
            label: t?.mosqueFinderOptionRestArea ?? "Rest Area",
            icon: Car,
            query: "rest+area+masjid+terdekat",
            color: "bg-[rgb(var(--color-primary))]/10",
            iconColor: "text-[rgb(var(--color-primary-light))]"
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
                    "max-w-xs sm:max-w-sm border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-strong))] p-0 overflow-hidden gap-0 mosque-finder-modal"
                )}
            >

                {/* Header with decorative background */}
                <div className={cn(
                    "relative p-6 pb-2 text-center bg-gradient-to-b from-[rgb(var(--color-primary))]/20 to-transparent border-b border-[rgb(var(--color-border))]"
                )}>
                    <DialogTitle className={cn(
                        "text-xl font-bold relative z-10 text-[rgb(var(--color-text-strong))]"
                    )}>
                        {t?.mosqueFinderTitle ?? "Mau Sholat di Mana?"}
                    </DialogTitle>
                    <p className={cn(
                        "text-sm mt-1 relative z-10 text-[rgb(var(--color-text-muted))]"
                    )}>
                        {t?.mosqueFinderDesc ?? "Pilih jenis tempat sholat yang kamu butuhkan:"}
                    </p>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className={cn(
                            "absolute right-4 top-4 p-2 rounded-full transition-colors z-20 bg-[rgb(var(--color-surface-subtle))] hover:bg-[rgb(var(--color-surface))]"
                        )}
                    >
                        <X className="w-4 h-4 text-[rgb(var(--color-text-muted))]" />
                    </button>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 pt-2">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSearch(option.query)}
                            className={cn(
                                `flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-[rgb(var(--color-border))] ${option.color} transition-all group hover:bg-[rgb(var(--color-surface-subtle))] hover:scale-[1.02] active:scale-[0.98]`
                            )}
                        >
                            <div className={cn(
                                `p-3 rounded-full group-hover:scale-110 transition-transform ${option.iconColor}`,
                                "bg-[rgb(var(--color-surface))]"
                            )}>
                                <option.icon className="w-6 h-6" strokeWidth={2} />
                            </div>
                            <span className={cn(
                                "text-xs font-bold text-center",
                                "text-[rgb(var(--color-text))]"
                            )}>
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Footer Tip */}
                <div className={cn(
                    "p-3 text-center border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))]"
                )}>
                    <p className={cn(
                        "text-[10px] text-[rgb(var(--color-text-muted))]"
                    )}>
                        {t.mosqueFinderButton}
                    </p>
                </div>

            </DialogContent>
        </Dialog>
    );
}
