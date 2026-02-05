"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocale } from "@/context/LocaleContext";
import { Sparkles, BookOpen, Calendar } from "lucide-react";

interface AboutAppModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AboutAppModal({ open, onOpenChange }: AboutAppModalProps) {
    const { t } = useLocale();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm w-[90%] rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-0 overflow-hidden shadow-2xl [&>button]:z-50">
                {/* Gradient Header - smaller height */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[rgb(var(--color-primary))]/20 via-[rgb(var(--color-primary))]/5 to-transparent pointer-events-none" />

                <DialogHeader className="px-6 pt-6 pb-2 relative z-10">
                    {/* Compact Logo */}
                    <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] rounded-xl flex items-center justify-center shadow-lg shadow-[rgb(var(--color-primary))]/30 mb-3 rotate-3">
                        <span className="text-3xl font-bold text-white">N</span>
                    </div>

                    <DialogTitle className="text-xl font-bold text-white text-center">
                        {t.aboutAppName}
                    </DialogTitle>

                    <div className="flex justify-center mt-1.5">
                        <span className="text-[10px] uppercase tracking-widest text-[rgb(var(--color-primary-light))] font-extrabold px-3 py-1 bg-[rgb(var(--color-primary))]/10 rounded-full border border-[rgb(var(--color-primary))]/20">
                            {t.aboutTagline}
                        </span>
                    </div>
                </DialogHeader>

                <div className="px-5 pb-6 space-y-4 relative z-10 text-center">
                    <div className="space-y-4 text-left">
                        {/* What is Nawaetu - merging description & title for compactness */}
                        <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                            <h3 className="text-xs font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-[rgb(var(--color-primary-light))]" />
                                {t.aboutWhatIsTitle}
                            </h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                {t.aboutDescription}
                            </p>
                        </div>

                        {/* Our Approach */}
                        <div className="space-y-1.5 p-3.5 rounded-2xl bg-[rgb(var(--color-primary))]/[0.03] border border-[rgb(var(--color-primary))]/10">
                            <h3 className="text-xs font-bold text-white flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-[rgb(var(--color-primary-light))]" />
                                {t.aboutApproachTitle}
                            </h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                {t.aboutApproachDesc}
                            </p>
                        </div>
                    </div>

                    {/* Footer - minimal */}
                    <div className="flex flex-col items-center gap-2 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-medium">
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 uppercase tracking-tighter">
                                {t.aboutVersion.split('•')[0].trim()}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{t.aboutLastUpdate}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
