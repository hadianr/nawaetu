"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Tent, Building2, Car } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocale } from "@/context/LocaleContext";
import { SETTINGS_TRANSLATIONS } from "@/data/settings-translations";

interface MosqueFinderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MosqueFinderModal({ isOpen, onClose }: MosqueFinderModalProps) {
    const { t } = useLocale();
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
            <DialogContent showCloseButton={false} className="max-w-xs sm:max-w-sm bg-[#0a0f1c] border-white/10 text-white p-0 overflow-hidden gap-0">

                {/* Header with decorative background */}
                <div className="relative p-6 pb-2 text-center bg-gradient-to-b from-[rgb(var(--color-primary))]/20 to-transparent">
                    <DialogTitle className="text-xl font-bold relative z-10">
                        {t.mosqueFinderTitle}
                    </DialogTitle>
                    <p className="text-sm text-white/60 mt-1 relative z-10">
                        {t.mosqueFinderDesc}
                    </p>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20"
                    >
                        <X className="w-4 h-4 text-white/70" />
                    </button>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 pt-2">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSearch(option.query)}
                            className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${option.color} border border-white/5 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all group`}
                        >
                            <div className={`p-3 rounded-full bg-black/20 ${option.iconColor} group-hover:scale-110 transition-transform`}>
                                <option.icon className="w-6 h-6" strokeWidth={2} />
                            </div>
                            <span className="text-xs font-bold text-center text-white/90">
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Footer Tip */}
                <div className="bg-white/5 p-3 text-center border-t border-white/5">
                    <p className="text-[10px] text-white/40">
                        {t.mosqueFinderButton}
                    </p>
                </div>

            </DialogContent>
        </Dialog>
    );
}
