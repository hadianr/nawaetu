"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Sparkles, BookOpen, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface AboutAppModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AboutAppModal({ open, onOpenChange }: AboutAppModalProps) {
    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "max-w-sm w-[90%] rounded-[2rem] border p-0 overflow-hidden shadow-2xl [&>button]:z-50",
                isDaylight
                    ? "bg-white border-slate-200 text-slate-900"
                    : "bg-[#0F172A] border-white/10 text-white"
            )}>
                {/* Gradient Header - smaller height */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[rgb(var(--color-primary))]/20 via-[rgb(var(--color-primary))]/5 to-transparent pointer-events-none" />

                <DialogHeader className="px-6 pt-6 pb-2 relative z-10">
                    {/* Compact Logo */}
                    <div className={cn(
                        "w-14 h-14 mx-auto rounded-xl flex items-center justify-center shadow-lg mb-3 rotate-3 transition-all",
                        isDaylight
                            ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/20"
                            : "bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] shadow-[rgb(var(--color-primary))]/30"
                    )}>
                        <span className="text-3xl font-bold text-white">N</span>
                    </div>

                    <DialogTitle className="text-xl font-bold text-center">
                        {t.aboutAppName}
                    </DialogTitle>

                    <div className="flex justify-center mt-1.5">
                        <span className={cn(
                            "text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border",
                            isDaylight
                                ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                                : "text-[rgb(var(--color-primary-light))] bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20"
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
                            isDaylight ? "bg-slate-50 border-slate-100" : "bg-white/[0.03] border-white/5"
                        )}>
                            <h3 className="text-xs font-bold flex items-center gap-2">
                                <Sparkles className={cn("w-3.5 h-3.5", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light)) ]")} />
                                {t.aboutWhatIsTitle}
                            </h3>
                            <p className={cn(
                                "text-[11px] leading-relaxed",
                                isDaylight ? "text-slate-600" : "opacity-70"
                            )}>
                                {t.aboutDescription}
                            </p>
                        </div>

                        {/* Our Approach */}
                        <div className={cn(
                            "space-y-1.5 p-3.5 rounded-2xl border transition-all",
                            isDaylight ? "bg-emerald-50/50 border-emerald-100" : "bg-[rgb(var(--color-primary))]/[0.03] border border-[rgb(var(--color-primary))]/10"
                        )}>
                            <h3 className="text-xs font-bold flex items-center gap-2">
                                <BookOpen className={cn("w-3.5 h-3.5", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light)) ]")} />
                                {t.aboutApproachTitle}
                            </h3>
                            <p className={cn(
                                "text-[11px] leading-relaxed",
                                isDaylight ? "text-slate-600" : "opacity-70"
                            )}>
                                {t.aboutApproachDesc}
                            </p>
                        </div>
                    </div>

                    {/* Footer - minimal */}
                    <div className={cn("flex flex-col items-center gap-2 pt-2 border-t", isDaylight ? "border-slate-100" : "border-white/5")}>
                        <div className={cn("flex items-center gap-1.5 text-[9px] font-medium", isDaylight ? "text-slate-400" : "opacity-50")}>
                            <span className={cn(
                                "px-1.5 py-0.5 rounded border uppercase tracking-tighter",
                                isDaylight ? "bg-slate-100 border-slate-200 text-slate-500" : "bg-white/5 border-white/10"
                            )}>
                                {t.aboutVersion.split('•')[0].trim()}
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
