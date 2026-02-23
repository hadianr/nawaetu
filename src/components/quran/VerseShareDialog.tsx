"use client";

import { useState, useRef, useEffect } from "react";
// import { toPng } from "html-to-image"; // Moved to dynamic import
import { Download, Share2, X, Instagram, Check, Quote, MessageCircle } from "lucide-react"; // MessageCircle for WA
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Verse } from "@/components/quran/VerseList";
import { useTheme, Theme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface VerseShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    verse: Verse | null;
    surahName: string;
    surahNumber: number;
}

// Map app themes to beautiful gradients for the card
const getThemeGradient = (theme: Theme) => {
    switch (theme.id) {
        case 'midnight':
            return "bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#1e1b4b]"; // Deep Blue
        case 'sunset':
            return "bg-gradient-to-br from-[#451a03] via-[#7c2d12] to-[#431407]"; // Warm Orange/Brown
        case 'lavender':
            return "bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#3b0764]"; // Deep Violet
        case 'ocean':
            return "bg-gradient-to-br from-[#042f2e] via-[#115e59] to-[#042f2e]"; // Deep Teal
        case 'royal':
            return "bg-gradient-to-br from-[#4c0519] via-[#881337] to-[#4c0519]"; // Deep Rose
        default: // Default (Emerald)
            return "bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#022c22]";
    }
};

const getThemePattern = (theme: Theme) => {
    // We can map theme ID to the SVG patterns we had before, or simplified ones
    // Using the same simple SVG data strings for now
    switch (theme.id) {
        case 'midnight': // Stars
            return "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E";
        case 'sunset': // Waves (Simplified)
            return "data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3C/path%3E%3C/svg%3E";
        case 'lavender': // Geometric
        case 'royal':
            return "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Cpath d='M20 20l10-10L20 0l-10 10zM0 20l10-10L0 0l-10 10zM40 20l10-10L40 0l-10 10zM20 40l10-10L20 20l-10 10zM0 40l10-10L0 20l-10 10zM40 40l10-10L40 20l-10 10z' fill-opacity='0.1'/%3E%3C/g%3E%3C/svg%3E";
        default:
            return null; // Clean/None for default or ocean for minimalist
    }
};

export default function VerseShareDialog({ open, onOpenChange, verse, surahName, surahNumber }: VerseShareDialogProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { theme } = useTheme(); // Use global active theme

    if (!verse) return null;

    const translation = (verse.translations.find((t) => t.resource_id === 33) || verse.translations[0])?.text.replace(/<[^>]*>?/gm, "") || "";
    // Clean footnotes
    const cleanTranslationText = translation.replace(/(\d+)(?=\s|$|[.,;])/g, '').replace(/(\w)(\d+)/g, '$1').trim();

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);
        try {
            const { toPng } = await import("html-to-image");
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 4, // Higher quality
                width: 1080,
                height: 1920
            });
            const link = document.createElement("a");
            link.download = `nawaetu-qs-${surahNumber}-${verse.verse_key.split(":")[1]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
        } finally {
            setIsGenerating(false);
            onOpenChange(false);
        }
    };

    const handleShare = async (platform: 'instagram' | 'whatsapp' | 'system') => {
        if (!cardRef.current) return;
        setIsGenerating(true);
        try {
            const { toPng } = await import("html-to-image");
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 4,
                width: 1080,
                height: 1920
            });
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], "verse.png", { type: "image/png" });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                // If it's a specific platform request, we unfortunately can't force the app picker in Web Share Level 1/2 consistently
                // But we can update the title/text to be relevant
                let shareData = {
                    files: [file],
                    title: `QS. ${surahName} Ayat ${verse.verse_key.split(":")[1]}`,
                    text: `Baca Al-Qur'an di Nawaetu`
                };

                await navigator.share(shareData);
            } else {
                handleDownload();
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
            }
        } finally {
            setIsGenerating(false);
            onOpenChange(false);
        }
    };

    // Typography scaling
    const getTypographyClass = (length: number) => {
        if (length < 60) return "text-[2rem] leading-[1.6]";
        if (length < 100) return "text-[1.75rem] leading-[1.6]";
        if (length < 200) return "text-[1.5rem] leading-[1.6]";
        if (length < 300) return "text-[1.25rem] leading-[1.6]";
        if (length < 400) return "text-base leading-relaxed";
        return "text-sm leading-relaxed";
    };

    const gradientClass = getThemeGradient(theme);
    const patternUrl = getThemePattern(theme);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-sm sm:max-w-md bg-transparent border-none p-0 shadow-none overflow-visible flex flex-col items-center justify-center">
                <DialogTitle className="sr-only">Bagikan Ayat</DialogTitle>

                {/* --- 1. PREVIEW CARD (Central Focus) --- */}
                {/* 9:16 Aspect Ratio Container */}
                <div className="relative w-[280px] sm:w-[320px] aspect-[9/16] rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-white/10 select-none">

                    {/* The Actual Capture Target */}
                    <div
                        ref={cardRef}
                        className={cn(
                            "absolute inset-0 w-full h-full flex flex-col items-center text-center px-8 py-12",
                            gradientClass,
                            "text-white"
                        )}
                    >
                        {/* Pattern Overlay */}
                        {patternUrl && (
                            <div
                                className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                                style={{
                                    backgroundImage: `url('${patternUrl}')`,
                                    backgroundSize: '40px 40px'
                                }}
                            />
                        )}

                        {/* Vignette & Noise */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                        {/* --- CONTENT --- */}
                        <div className="relative z-10 flex flex-col items-center justify-between h-full">

                            {/* Top: Branding */}
                            <div className="pt-2">
                                <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-[0.2em] font-bold shadow-sm">
                                    Nawaetu
                                </span>
                            </div>

                            {/* Middle: Quote */}
                            <div className="flex-1 flex flex-col items-center justify-center relative">
                                <Quote className="w-12 h-12 text-white/10 absolute -top-6 -left-2 rotate-180" />
                                <p className={cn(
                                    "font-serif italic drop-shadow-md",
                                    getTypographyClass(cleanTranslationText.length)
                                )}>
                                    "{cleanTranslationText}"
                                </p>
                                <Quote className="w-12 h-12 text-white/10 absolute -bottom-6 -right-2" />
                            </div>

                            {/* Bottom: Info */}
                            <div className="flex flex-col items-center gap-2 pb-4">
                                <div className="h-px w-12 bg-white/30 rounded-full mb-1" />
                                <p className="text-sm font-bold tracking-widest uppercase">
                                    {surahName}
                                </p>
                                <p className="text-[10px] tracking-wider opacity-80">
                                    Ayat {verse.verse_key.split(":")[1]}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 2. ACTION BUTTONS (Floating Below) --- */}
                <div className="flex items-center gap-3 mt-6 w-full max-w-[320px] animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <Button
                        onClick={() => handleShare('instagram')}
                        disabled={isGenerating}
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-pink-500/20 border-0"
                    >
                        <Instagram className="w-5 h-5 mr-2" />
                        <span className="text-xs font-bold">Story</span>
                    </Button>

                    <Button
                        onClick={() => handleShare('whatsapp')}
                        disabled={isGenerating}
                        className="flex-1 h-12 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/20 border-0 text-white"
                    >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        <span className="text-xs font-bold">WhatsApp</span>
                    </Button>

                    <Button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        size="icon"
                        variant="outline"
                        className="h-12 w-12 rounded-xl bg-white/10 border-white/10 backdrop-blur-md hover:bg-white/20 text-white"
                    >
                        <Download className="w-5 h-5" />
                    </Button>
                </div>

                <div className="mt-4">
                    <DialogClose className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </DialogClose>
                </div>

            </DialogContent>
        </Dialog>
    );
}
