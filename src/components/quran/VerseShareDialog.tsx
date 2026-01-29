"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { Download, Share2, X, Instagram, Check, Quote } from "lucide-react";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Verse } from "@/components/quran/VerseList";

interface VerseShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    verse: Verse | null;
    surahName: string;
    surahNumber: number;
}

const GRADIENTS = [
    // Dark Themes (Mindful)
    { name: "Midnight", class: "bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950", text: "text-white" },
    { name: "Forest", class: "bg-gradient-to-b from-green-950 via-emerald-950 to-green-950", text: "text-white" },
    { name: "Earth", class: "bg-gradient-to-b from-stone-950 via-neutral-900 to-stone-950", text: "text-white" },
    { name: "Berry", class: "bg-gradient-to-b from-slate-950 via-rose-950 to-slate-950", text: "text-white" },
    // Pastel Themes (Soft)
    { name: "Lilac", class: "bg-gradient-to-br from-purple-100 via-purple-200 to-indigo-100", text: "text-slate-800" },
    { name: "Peach", class: "bg-gradient-to-br from-orange-50 via-amber-100 to-yellow-50", text: "text-stone-800" },
    { name: "Mint", class: "bg-gradient-to-br from-emerald-50 via-teal-100 to-cyan-50", text: "text-teal-900" },
];

const PATTERNS = [
    // Full Pattern: Islamic
    { name: "Islamic", url: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='currentColor' fill-rule='evenodd'%3E%3Cpath d='M20 20l10-10L20 0l-10 10zM0 20l10-10L0 0l-10 10zM40 20l10-10L40 0l-10 10zM20 40l10-10L20 20l-10 10zM0 40l10-10L0 20l-10 10zM40 40l10-10L40 20l-10 10z' fill-opacity='0.4'/%3E%3C/g%3E%3C/svg%3E", size: "40px", type: "full" },
    // Full Pattern: Batik Cloud
    { name: "Batik", url: "data:image/svg+xml,%3Csvg width='100' height='60' viewBox='0 0 100 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 35c-5 0-9-2-12-5-4 4-10 4-14 0 2 8 10 12 18 10 4 4 12 4 16 0-3-4-3-8-8-5zm30-15c-5 0-9-2-12-5-4 4-10 4-14 0 2 8 10 12 18 10 4 4 12 4 16 0-3-4-3-8-8-5zm30 15c-5 0-9-2-12-5-4 4-10 4-14 0 2 8 10 12 18 10 4 4 12 4 16 0-3-4-3-8-8-5zM10 15c5 0 9-2 12-5 4 4 10 4 14 0-2 8-10 12-18 10-4 4-12 4-16 0 3-4 3-8 8-5zm30 30c5 0 9-2 12-5 4 4 10 4 14 0-2 8-10 12-18 10-4 4-12 4-16 0 3-4 3-8 8-5zm30-30c5 0 9-2 12-5 4 4 10 4 14 0-2 8-10 12-18 10-4 4-12 4-16 0 3-4 3-8 8-5z' fill='currentColor' fill-opacity='0.4'/%3E%3C/g%3E%3C/svg%3E", size: "80px", type: "full" },
    // Border Pattern
    { name: "Frame", url: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm2 2v36h36V2H2z' fill='currentColor' fill-opacity='0.8'/%3E%3C/svg%3E", size: "100%", type: "frame" },
    // No Pattern
    { name: "None", url: "", size: "auto", type: "none" },
];

export default function VerseShareDialog({ open, onOpenChange, verse, surahName, surahNumber }: VerseShareDialogProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
    const [selectedPattern, setSelectedPattern] = useState(PATTERNS[0]);

    if (!verse) return null;

    const translation = (verse.translations.find((t) => t.resource_id === 33) || verse.translations[0])?.text.replace(/<[^>]*>?/gm, "") || "";
    // Clean footnotes
    const cleanTranslationText = translation.replace(/(\d+)(?=\s|$|[.,;])/g, '').replace(/(\w)(\d+)/g, '$1').trim();

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);
        try {
            // Force high resolution capture (1080x1920 logical)
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 3,
                width: 360, // Base width
                height: 640 // Base height (9:16)
            });
            const link = document.createElement("a");
            link.download = `nawaetu-qs-${surahNumber}-${verse.verse_key.split(":")[1]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Failed to generate image", err);
        } finally {
            setIsGenerating(false);
            onOpenChange(false);
        }
    };

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 3,
                width: 360,
                height: 640
            });
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], "verse.png", { type: "image/png" });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `QS. ${surahName} Ayat ${verse.verse_key.split(":")[1]}`,
                    text: `Baca Al-Qur'an di Nawaetu`
                });
            } else {
                handleDownload();
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Failed to share", err);
            }
        } finally {
            setIsGenerating(false);
            onOpenChange(false);
        }
    };

    // Logic to determine optimal font size & line height based on character count
    // "Tadabbur" focus: Increased line-height (leading-loose) for slower, contemplative reading
    const getTypographyClass = (length: number) => {
        if (length < 60) return "text-3xl md:text-4xl leading-[2]";
        if (length < 100) return "text-2xl md:text-3xl leading-[1.8]";
        if (length < 200) return "text-lg md:text-xl leading-[1.8]";
        if (length < 300) return "text-base md:text-lg leading-loose";
        if (length < 400) return "text-sm md:text-base leading-loose";
        return "text-xs md:text-sm leading-loose";
    };

    const isLightText = selectedGradient.text === "text-white";
    const pillBg = isLightText ? "bg-white/10 border-white/10 text-white" : "bg-black/5 border-black/5 text-slate-800";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] bg-slate-950 border-white/10 text-white p-0 gap-0 overflow-hidden flex flex-col md:flex-row">
                <DialogTitle className="sr-only">Bagikan Ayat</DialogTitle>

                {/* Close Button (Absolute on Mobile) */}
                <div className="absolute top-4 right-4 z-50 md:hidden">
                    <DialogClose className="rounded-full p-2 bg-black/50 text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
                        <X className="w-5 h-5" />
                    </DialogClose>
                </div>

                {/* LEFT/TOP: PREVIEW AREA */}
                <div className="flex-1 bg-slate-900/50 p-8 flex items-center justify-center overflow-y-auto">
                    {/* Container for centering and scaling based on screen size */}
                    <div className="scale-90 md:scale-100 origin-center drop-shadow-2xl">
                        {/*
                            THE CAPTURE CARD
                            Fixed Size: 360 x 640 (exact 9:16 ratio)
                        */}
                        <div
                            ref={cardRef}
                            className={`w-[360px] h-[640px] ${selectedGradient.class} relative flex flex-col items-center text-center px-8 py-12 shrink-0 overflow-hidden select-none transition-colors duration-700`}
                        >
                            {/* Decorative Pattern Overlay - Very Subtle */}
                            <div
                                className={`absolute inset-0 transition-all duration-300 ${selectedPattern.type === 'frame' ? 'opacity-30' : 'opacity-10'} mix-blend-overlay pointer-events-none`}
                                style={{
                                    backgroundImage: selectedPattern.url ? `url("${selectedPattern.url}")` : undefined,
                                    backgroundSize: selectedPattern.size === '100%' ? '100% 100%' : selectedPattern.size,
                                    backgroundRepeat: selectedPattern.type === 'frame' ? 'no-repeat' : 'repeat',
                                    color: isLightText ? 'white' : 'black'
                                }}
                            />

                            {/* Vignette Overlay for Focus */}
                            <div className={`absolute inset-0 pointer-events-none bg-gradient-to-b ${isLightText ? 'from-black/10 via-transparent to-black/60' : 'from-white/20 via-transparent to-white/40'}`} />

                            {/* --- DECORATIVE CONTENT --- */}
                            {/* Giant Quote Watermark - More Subtle & Centered */}
                            <Quote className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rotate-0 pointer-events-none transition-colors ${isLightText ? 'text-white/5' : 'text-black/5'}`} />

                            {/* --- MAIN CONTENT --- */}

                            {/* Flexible Spacer Top */}
                            <div className="flex-[2] min-h-[10%]" />

                            {/* Center Content: Text */}
                            <div className="relative z-10 w-full flex flex-col items-center gap-6">
                                {/* REMOVED SMALL QUOTE ICON */}

                                <div className="w-full relative">
                                    <p className={`
                                        font-serif italic text-center drop-shadow-md text-balance font-normal tracking-wide transition-colors
                                        ${getTypographyClass(cleanTranslationText.length)}
                                        ${selectedGradient.text}
                                    `}>
                                        "{cleanTranslationText}"
                                    </p>
                                </div>
                            </div>

                            {/* Flexible Spacer Bottom */}
                            <div className="flex-[3] min-h-[15%]" />

                            {/* Footer: Metadata in Minimalist Pill */}
                            <div className="relative z-10 w-full flex flex-col items-center gap-4 pb-4">
                                <div className={`px-5 py-2 rounded-full backdrop-blur-[2px] border flex items-center justify-center gap-3 transition-colors ${pillBg} shadow-sm`}>
                                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase font-sans opacity-90">
                                        QS. {surahName}
                                    </span>
                                    <div className={`w-0.5 h-2 rounded-full opacity-30 ${isLightText ? 'bg-white' : 'bg-black'}`} />
                                    <span className="text-[10px] font-medium tracking-[0.1em] font-sans opacity-80">
                                        AYAT {verse.verse_key.split(":")[1]}
                                    </span>
                                </div>

                                <span className={`text-[7px] font-medium tracking-[0.3em] uppercase opacity-30 ${selectedGradient.text}`}>
                                    Nawaetu.com
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                {/* RIGHT/BOTTOM: CONTROLS */}
                <div className="w-full md:w-96 bg-slate-950 border-t md:border-t-0 md:border-l border-white/10 p-6 flex flex-col gap-8 z-20 shrink-0 overflow-y-auto max-h-[50vh] md:max-h-none">

                    {/* Header (Desktop) */}
                    <div className="hidden md:flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-200">Kustomisasi</h3>
                        <DialogClose className="rounded-full p-1.5 hover:bg-white/10 transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </DialogClose>
                    </div>

                    {/* Gradient Selector */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pilih Tema Background</label>
                        <div className="grid grid-cols-4 gap-3">
                            {GRADIENTS.map((gradient) => (
                                <button
                                    key={gradient.name}
                                    onClick={() => setSelectedGradient(gradient)}
                                    className={`
                                        aspect-square rounded-xl ${gradient.class}
                                        ring-2 ring-offset-2 ring-offset-slate-950 transition-all
                                        flex items-center justify-center
                                        ${selectedGradient.name === gradient.name ? 'ring-emerald-500 scale-105 shadow-lg shadow-emerald-900/20' : 'ring-transparent opacity-60 hover:opacity-100'}
                                    `}
                                    title={gradient.name}
                                >
                                    {selectedGradient.name === gradient.name && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pattern Selector */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pilih Pattern Overlay</label>
                        <div className="grid grid-cols-4 gap-3">
                            {PATTERNS.map((pattern) => (
                                <button
                                    key={pattern.name}
                                    onClick={() => setSelectedPattern(pattern)}
                                    className={`
                                        aspect-square rounded-xl bg-slate-800 border border-white/10
                                        ring-2 ring-offset-2 ring-offset-slate-950 transition-all
                                        flex items-center justify-center overflow-hidden relative
                                        ${selectedPattern.name === pattern.name ? 'ring-emerald-500 scale-105 shadow-md' : 'ring-transparent opacity-80 hover:opacity-100'}
                                    `}
                                    title={pattern.name}
                                >
                                    {pattern.url && (
                                        <div
                                            className="absolute inset-0 opacity-100"
                                            style={{
                                                backgroundImage: `url("${pattern.url}")`,
                                                backgroundSize: '40%', // Smaller scale for button
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'repeat',
                                                filter: 'brightness(2) contrast(1.5)' // Make it pop
                                            }}
                                        />
                                    )}

                                    {selectedPattern.name === pattern.name && <Check className="relative z-10 w-5 h-5 text-white drop-shadow-md" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="hidden md:block flex-1" />

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={handleShare}
                            disabled={isGenerating}
                            className="w-full h-14 text-base font-semibold gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg shadow-pink-900/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isGenerating ? "Memproses..." : (
                                <>
                                    <Instagram className="w-5 h-5" />
                                    Share ke Story
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            variant="outline"
                            className="w-full h-12 text-sm font-semibold gap-2 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white rounded-xl shadow-lg shadow-black/20"
                        >
                            <Download className="w-4 h-4" />
                            Simpan ke Galeri
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}
