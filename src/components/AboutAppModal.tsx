"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocale } from "@/context/LocaleContext";
import { Sparkles, BookOpen, Clock, Users, Globe, Calendar, Check } from "lucide-react";

interface AboutAppModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AboutAppModal({ open, onOpenChange }: AboutAppModalProps) {
    const { t } = useLocale();

    const features = [
        { icon: BookOpen, label: t.aboutFeature1, stat: "114 Surah" },
        { icon: Clock, label: t.aboutFeature2, stat: "5 Waktu" },
        { icon: Users, label: t.aboutFeature3, stat: "28+ Misi" },
        { icon: Globe, label: t.aboutFeature4, stat: "2 Bahasa" },
    ];

    const updates = [
        t.aboutUpdate1,
        t.aboutUpdate2,
        t.aboutUpdate3,
        t.aboutUpdate4,
        t.aboutUpdate5,
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm w-[90%] rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-0 overflow-hidden shadow-2xl [&>button]:z-50">
                {/* Gradient Header */}
                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[rgb(var(--color-primary))]/20 via-[rgb(var(--color-primary))]/5 to-transparent pointer-events-none" />
                
                <DialogHeader className="px-6 pt-8 pb-4 relative z-10">
                    {/* Logo */}
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] rounded-2xl flex items-center justify-center shadow-xl shadow-[rgb(var(--color-primary))]/30 mb-4 rotate-3">
                        <span className="text-4xl font-bold text-white">N</span>
                    </div>
                    
                    <DialogTitle className="text-2xl font-bold text-white text-center">
                        {t.aboutAppName}
                    </DialogTitle>
                    <div className="flex justify-center mt-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20">
                            <div className="w-2 h-2 rounded-full bg-[rgb(var(--color-primary-light))] animate-pulse" />
                            <span className="text-xs font-semibold text-[rgb(var(--color-primary-light))]">{t.aboutVersion}</span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 pb-6 space-y-6 relative z-10">
                    {/* Tagline */}
                    <p className="text-center text-sm text-[rgb(var(--color-primary-light))] uppercase tracking-[0.2em] font-bold">
                        {t.aboutTagline}
                    </p>

                    {/* Description */}
                    <p className="text-center text-sm text-slate-400 leading-relaxed">
                        {t.aboutDescription}
                    </p>

                    {/* What's New */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                            <h3 className="text-sm font-bold text-white">{t.aboutWhatsNew}</h3>
                        </div>
                        <div className="space-y-2">
                            {updates.map((update, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                                    <Check className="w-3.5 h-3.5 text-[rgb(var(--color-primary))] mt-0.5 flex-shrink-0" />
                                    <span>{update}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {features.map((feature, idx) => (
                            <div 
                                key={idx}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-center space-y-2 hover:bg-white/10 transition-colors"
                            >
                                <feature.icon className="w-5 h-5 text-[rgb(var(--color-primary-light))] mx-auto" />
                                <div>
                                    <p className="text-xs font-bold text-white">{feature.stat}</p>
                                    <p className="text-[10px] text-slate-500">{feature.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Hashtag & Date */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] font-bold text-xs">
                                {t.aboutHashtag}
                            </span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>{t.aboutLastUpdate}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
