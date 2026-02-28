import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { RulingItem, RulingCategory, getAllRulingsByCategory } from "@/data/ramadhan";
import DalilBadge from "./DalilBadge";

interface RulingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RulingsModal({ open, onOpenChange }: RulingsModalProps) {
    const { t, locale } = useLocale();
    const [activeCategory, setActiveCategory] = useState<RulingCategory>("wajib");
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const currentRulings = getAllRulingsByCategory(activeCategory);

    const categories: { id: RulingCategory; label: string; icon: string }[] = [
        { id: "wajib", label: locale === "en" ? "Obligatory" : "Wajib", icon: "💎" },
        { id: "sunnah", label: locale === "en" ? "Recommended" : "Sunnah", icon: "✨" },
        { id: "mubah", label: locale === "en" ? "Permissible" : "Mubah", icon: "🟢" },
        { id: "makruh", label: locale === "en" ? "Disliked" : "Makruh", icon: "⚠️" },
        { id: "haram", label: locale === "en" ? "Forbidden" : "Haram", icon: "🚫" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl bg-black/60 backdrop-blur-xl border-white/10 text-white p-0 overflow-hidden gap-0 shadow-2xl">
                <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-white/5 relative">
                    <DialogTitle className="text-left flex items-center gap-2">
                        <span className="text-lg">📋</span>
                        <span>{t.rulingsModalTitle || "Hukum Puasa"}</span>
                    </DialogTitle>
                    <p className="text-xs text-white/50 mt-1">
                        {t.rulingsModalSubtitle || "Lima kategori hukum dalam puasa Ramadhan"}
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
                                    activeCategory === cat.id
                                        ? "bg-white/10 text-white border-white/20 shadow-lg"
                                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80"
                                )}
                            >
                                <span>{cat.icon}</span>
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
                            <div className="text-center py-12 text-white/40">
                                <p>{t.rulingsModalEmpty || "Tidak ada data untuk kategori ini"}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {currentRulings.map((item, index) => (
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
                                                        {locale === "en" ? item.title_en : item.title}
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
