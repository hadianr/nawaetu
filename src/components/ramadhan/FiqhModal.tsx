"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { getAllFiqhByCategory, FiqhCategory } from "@/data/ramadhan-fiqh";
import DalilBadge from "./DalilBadge";

interface FiqhModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function FiqhModal({ open, onOpenChange }: FiqhModalProps) {
    const [activeCategory, setActiveCategory] = useState<FiqhCategory>('wajib');
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const { t, locale } = useLocale();

    const fiqhItems = getAllFiqhByCategory(activeCategory);

    const categories: { id: FiqhCategory; label: string; label_en: string; color: string; emoji: string }[] = [
        { id: 'wajib', label: 'Wajib', label_en: 'Obligatory', color: 'emerald', emoji: '✅' },
        { id: 'sunnah', label: 'Sunnah', label_en: 'Recommended', color: 'blue', emoji: '⭐' },
        { id: 'mubah', label: 'Mubah', label_en: 'Permissible', color: 'gray', emoji: '✔️' },
        { id: 'makruh', label: 'Makruh', label_en: 'Disliked', color: 'yellow', emoji: '⚠️' },
        { id: 'haram', label: 'Haram', label_en: 'Forbidden', color: 'red', emoji: '🚫' },
    ];

    const getColorClasses = (color: string, active: boolean) => {
        if (!active) {
            return "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80";
        }
        
        const colorMap: Record<string, string> = {
            emerald: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30 shadow-emerald-500/20",
            blue: "bg-blue-500/20 text-blue-200 border-blue-400/30 shadow-blue-500/20",
            gray: "bg-gray-500/20 text-gray-200 border-gray-400/30 shadow-gray-500/20",
            yellow: "bg-yellow-500/20 text-yellow-200 border-yellow-400/30 shadow-yellow-500/20",
            red: "bg-red-500/20 text-red-200 border-red-400/30 shadow-red-500/20",
        };
        
        return colorMap[color] || colorMap.emerald;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl bg-black/60 backdrop-blur-xl border-white/10 text-white p-0 overflow-hidden gap-0 shadow-2xl">
                <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-white/5 relative">
                    <DialogTitle className="text-left flex items-center gap-2">
                        <span className="text-lg">📋</span>
                        <span>{t.fiqhModalTitle || "Hukum Puasa"}</span>
                    </DialogTitle>
                    <p className="text-xs text-white/50 mt-1">
                        {t.fiqhModalSubtitle || "Lima kategori hukum dalam puasa Ramadhan"}
                    </p>
                </DialogHeader>

                {/* Category Pills */}
                <div className="px-4 sm:px-6 py-3 border-b border-white/5 bg-white/[0.02] overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 min-w-max">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap touch-manipulation",
                                    getColorClasses(cat.color, activeCategory === cat.id),
                                    activeCategory === cat.id && "shadow-lg"
                                )}
                            >
                                <span>{cat.emoji}</span>
                                <span>{locale === 'en' ? cat.label_en : cat.label}</span>
                                <span className="text-[10px] opacity-60">({fiqhItems.length > 0 && activeCategory === cat.id ? fiqhItems.length : getAllFiqhByCategory(cat.id).length})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="h-[60vh] max-h-[500px]">
                    <div className="px-4 sm:px-6 py-4">
                        {fiqhItems.length === 0 ? (
                            <div className="text-center py-12 text-white/40">
                                <p>{t.fiqhModalEmpty || "Tidak ada data untuk kategori ini"}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {fiqhItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="border border-white/10 rounded-xl bg-white/5 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                                            className="w-full px-4 py-3 hover:bg-white/5 transition-colors text-left"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <span className="text-xs font-mono text-white/40 mt-0.5 flex-shrink-0">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </span>
                                                    <span className="font-medium text-sm text-white leading-snug">
                                                        {locale === 'en' ? item.title_en : item.title}
                                                    </span>
                                                </div>
                                                <ChevronDown 
                                                    className={cn(
                                                        "w-4 h-4 text-white/40 transition-transform flex-shrink-0",
                                                        expandedItem === item.id && "rotate-180"
                                                    )} 
                                                />
                                            </div>
                                        </button>
                                        {expandedItem === item.id && (
                                            <div className="px-4 pb-4 pt-2 animate-in slide-in-from-top-2 duration-200">
                                                <div className="space-y-3 border-t border-white/5 pt-3">
                                                    <p className="text-sm text-white/70 leading-relaxed">
                                                        {locale === 'en' ? item.description_en : item.description}
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
