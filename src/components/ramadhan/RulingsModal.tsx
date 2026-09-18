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

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { RulingCategory, getAllRulingsByCategory } from "@/data/ramadhan";
import DalilBadge from "./DalilBadge";
import { AppIcon } from "@/components/ui/AppIcon";

interface RulingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RulingsModal({ open, onOpenChange }: RulingsModalProps) {
    const { t, locale } = useLocale();
    const [activeCategory, setActiveCategory] = useState<RulingCategory>("wajib");
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const currentRulings = getAllRulingsByCategory(activeCategory);

    const categories = [
        { id: "wajib" as const, label: locale === "en" ? "Obligatory" : "Wajib", icon: "star" as const },
        { id: "sunnah" as const, label: locale === "en" ? "Recommended" : "Sunnah", icon: "sparkles" as const },
        { id: "mubah" as const, label: locale === "en" ? "Permissible" : "Mubah", icon: "shield-check" as const },
        { id: "makruh" as const, label: locale === "en" ? "Disliked" : "Makruh", icon: "warning" as const },
        { id: "haram" as const, label: locale === "en" ? "Forbidden" : "Haram", icon: "lock" as const },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl bg-[rgb(var(--color-surface))]/95 backdrop-blur-xl border-[rgb(var(--color-border))] text-[rgb(var(--color-text-strong))] p-0 overflow-hidden gap-0 shadow-[var(--shadow-floating)]">
                <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] relative">
                    <DialogTitle className="text-left flex items-center gap-2">
                        <AppIcon name="scroll" size="sm" tone="primary" />
                        <span>{t.rulingsModalTitle || "Hukum Puasa"}</span>
                    </DialogTitle>
                    <p className="text-xs text-[rgb(var(--color-text-muted))] mt-1">
                        {t.rulingsModalSubtitle || "Lima kategori hukum dalam puasa Ramadhan"}
                    </p>
                </DialogHeader>

                {/* Category Pills */}
                <div className="px-4 sm:px-6 py-3 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 min-w-max">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap touch-manipulation",
                                    activeCategory === cat.id
                                        ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] border-[rgb(var(--color-primary))] shadow-[var(--shadow-card)]"
                                        : "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-muted))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-subtle))] hover:text-[rgb(var(--color-text))]"
                                )}
                            >
                                <AppIcon name={cat.icon} size="sm" tone="primary" />
                                <span>{cat.label}</span>
                                <span className="text-[10px] opacity-60">({getAllRulingsByCategory(cat.id).length})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="h-[60vh] max-h-[500px]">
                    <div className="px-4 sm:px-6 py-4">
                        {currentRulings.length === 0 ? (
                            <div className="text-center py-12 text-[rgb(var(--color-text-muted))]">
                                <p>{t.rulingsModalEmpty || "Tidak ada data untuk kategori ini"}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {currentRulings.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="border border-[rgb(var(--color-border))] rounded-xl bg-[rgb(var(--color-surface-subtle))] overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                                            className="w-full px-4 py-3 hover:bg-[rgb(var(--color-surface))] transition-colors text-left"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <span className="text-xs font-mono text-[rgb(var(--color-text-muted))] mt-0.5 flex-shrink-0">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </span>
                                                    <span className="font-medium text-sm text-[rgb(var(--color-text-strong))] leading-snug">
                                                        {locale === "en" ? item.title_en : item.title}
                                                    </span>
                                                </div>
                                                <ChevronDown
                                                    className={cn(
                                                        "w-4 h-4 text-[rgb(var(--color-text-muted))] transition-transform flex-shrink-0",
                                                        expandedItem === item.id && "rotate-180"
                                                    )}
                                                />
                                            </div>
                                        </button>
                                        {expandedItem === item.id && (
                                            <div className="px-4 pb-4 pt-2 animate-in slide-in-from-top-2 duration-200">
                                                <div className="space-y-3 border-t border-[rgb(var(--color-border))] pt-3">
                                                    <p className="text-sm text-[rgb(var(--color-text))] leading-relaxed">
                                                        {locale === "en" ? item.description_en : item.description}
                                                    </p>
                                                    {item.dalil && (
                                                        <div className="pt-2">
                                                            <DalilBadge dalil={item.dalil} variant="inline" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
