"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Story Share Modal Component (Instagram Story / Social Media Generator)
 * Ultra-Lightweight, Fast WebP Export, 2 Minimalist Themes (Dark & Light)
 * Includes Font Size Scaling, Show/Hide Arabic Toggle & Obligatory nawaetu.com Watermark
 */

import { useState, useEffect, useRef } from "react";
import { X, Share2, Download, Copy, Check, Sparkles, Moon, Sun, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ShareableCardData,
    StoryTheme,
    FontSizeScale,
    renderStoryCardToCanvas,
    exportStoryCardBlob,
} from "@/lib/share/story-card-renderer";

interface StoryShareModalProps {
    item: ShareableCardData;
    onClose: () => void;
    isDaylight: boolean;
}

export function StoryShareModal({ item, onClose, isDaylight }: StoryShareModalProps) {
    const [theme, setTheme] = useState<StoryTheme>("dark");
    const [fontSizeScale, setFontSizeScale] = useState<FontSizeScale>("normal");
    const [showArabic, setShowArabic] = useState(true);
    const [showLatin, setShowLatin] = useState(true);
    const [showExplanation, setShowExplanation] = useState(true);

    const [isExporting, setIsExporting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [sharedSuccess, setSharedSuccess] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Update preview canvas in real-time when controls change
    useEffect(() => {
        let isMounted = true;
        async function updatePreview() {
            try {
                const canvas = await renderStoryCardToCanvas(item, {
                    theme,
                    fontSizeScale,
                    showArabic,
                    showLatin,
                    showExplanation,
                });

                if (!isMounted || !previewCanvasRef.current) return;

                const targetCanvas = previewCanvasRef.current;
                targetCanvas.width = canvas.width;
                targetCanvas.height = canvas.height;
                const ctx = targetCanvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(canvas, 0, 0);
                }
            } catch (err) {
                console.error("Preview render failed:", err);
            }
        }

        updatePreview();
        return () => {
            isMounted = false;
        };
    }, [item, theme, fontSizeScale, showArabic, showLatin, showExplanation]);

    // Handle Direct Instagram / Mobile Web Share API
    const handleNativeShare = async () => {
        setIsExporting(true);
        setStatusMessage(null);
        try {
            const { blob, mimeType, fileName } = await exportStoryCardBlob(item, {
                theme,
                fontSizeScale,
                showArabic,
                showLatin,
                showExplanation,
            });

            const file = new File([blob], fileName, { type: mimeType });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: item.title,
                    text: `${item.title} - ${item.sourceText}\nVia nawaetu.com`,
                });
                setSharedSuccess(true);
                setTimeout(() => setSharedSuccess(false), 3000);
            } else {
                // Fallback for browsers that don't support file sharing: trigger direct download
                downloadBlob(blob, fileName);
                setStatusMessage("Gambar telah diunduh! Buka Instagram & bagikan ke Story.");
                setTimeout(() => setStatusMessage(null), 4000);
            }
        } catch (err) {
            console.error("Share failed:", err);
            setStatusMessage("Gagal membagikan. Mencoba mengunduh file...");
        } finally {
            setIsExporting(false);
        }
    };

    // Handle Direct Download (WebP ~180KB)
    const handleDownload = async () => {
        setIsExporting(true);
        setStatusMessage(null);
        try {
            const { blob, fileName } = await exportStoryCardBlob(item, {
                theme,
                fontSizeScale,
                showArabic,
                showLatin,
                showExplanation,
            });

            downloadBlob(blob, fileName);
            setStatusMessage("Berhasil diunduh! File WebP super ringan siap diposting.");
            setTimeout(() => setStatusMessage(null), 3000);
        } catch (err) {
            console.error("Download failed:", err);
        } finally {
            setIsExporting(false);
        }
    };

    // Handle Copy Image to Clipboard
    const handleCopyImage = async () => {
        setIsExporting(true);
        try {
            const canvas = await renderStoryCardToCanvas(item, {
                theme,
                fontSizeScale,
                showArabic,
                showLatin,
                showExplanation,
            });

            canvas.toBlob(async (blob) => {
                if (!blob) return;
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ [blob.type]: blob }),
                    ]);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                    console.error("Clipboard copy failed:", err);
                    handleDownload(); // Fallback download
                }
            }, "image/png");
        } finally {
            setIsExporting(false);
        }
    };

    const downloadBlob = (blob: Blob, fileName: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
            <div
                className={cn(
                    "relative w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-300",
                    isDaylight
                        ? "bg-white border-slate-200 text-slate-900"
                        : "bg-slate-900 border-white/10 text-white"
                )}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-emerald-500" />
                        <h2 className="text-sm font-bold tracking-tight">Bagikan ke Story</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={cn(
                            "p-1.5 rounded-full transition-colors cursor-pointer",
                            isDaylight ? "hover:bg-slate-100 text-slate-400" : "hover:bg-white/10 text-white/40"
                        )}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Body: Dynamic Scrollable Preview & Settings */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {/* Live 9:16 Canvas Preview Card */}
                    <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-black/20 flex items-center justify-center group">
                        <canvas
                            ref={previewCanvasRef}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                        />
                        {isExporting && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold gap-2 animate-in fade-in">
                                <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
                                <span>Mengompres & Memproses...</span>
                            </div>
                        )}
                    </div>

                    {/* Status Message Notification */}
                    {statusMessage && (
                        <div className="p-2.5 rounded-xl text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center animate-in slide-in-from-top-1">
                            {statusMessage}
                        </div>
                    )}

                    {/* Theme Selector (2 Minimalist Nawaetu Themes: Dark Emerald vs Light Ceramic) */}
                    <div className="space-y-1.5">
                        <label className={cn("text-[11px] font-bold uppercase tracking-wider block", isDaylight ? "text-slate-400" : "text-white/40")}>
                            Pilih Tema Minimalis
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setTheme("dark")}
                                className={cn(
                                    "py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all cursor-pointer",
                                    theme === "dark"
                                        ? "bg-slate-900 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/40"
                                        : isDaylight
                                            ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                )}
                            >
                                <Moon className={cn("w-3.5 h-3.5", theme === "dark" ? "text-emerald-400 fill-emerald-400/20" : "text-emerald-500")} />
                                <span>Dark Emerald</span>
                            </button>
                            <button
                                onClick={() => setTheme("light")}
                                className={cn(
                                    "py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all cursor-pointer",
                                    theme === "light"
                                        ? "bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-500/30"
                                        : isDaylight
                                            ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                )}
                            >
                                <Sun className={cn("w-3.5 h-3.5", theme === "light" ? "text-amber-300 fill-amber-300/20" : "text-emerald-600")} />
                                <span>Light Pattern</span>
                            </button>
                        </div>
                    </div>

                    {/* Font Size Scaling Selector */}
                    <div className="space-y-1.5">
                        <label className={cn("text-[11px] font-bold uppercase tracking-wider flex items-center gap-1", isDaylight ? "text-slate-400" : "text-white/40")}>
                            <Type className="w-3 h-3 text-emerald-500" /> Ukuran Teks (Scaling)
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                            <button
                                onClick={() => setFontSizeScale("normal")}
                                className={cn(
                                    "py-1.5 px-2 rounded-xl font-bold border transition-all cursor-pointer text-center",
                                    fontSizeScale === "normal"
                                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                        : isDaylight ? "bg-slate-100 border-slate-200 text-slate-500" : "bg-white/5 border-white/10 text-white/40"
                                )}
                            >
                                Normal
                            </button>
                            <button
                                onClick={() => setFontSizeScale("large")}
                                className={cn(
                                    "py-1.5 px-2 rounded-xl font-bold border transition-all cursor-pointer text-center",
                                    fontSizeScale === "large"
                                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                        : isDaylight ? "bg-slate-100 border-slate-200 text-slate-500" : "bg-white/5 border-white/10 text-white/40"
                                )}
                            >
                                Besar
                            </button>
                            <button
                                onClick={() => setFontSizeScale("xlarge")}
                                className={cn(
                                    "py-1.5 px-2 rounded-xl font-bold border transition-all cursor-pointer text-center",
                                    fontSizeScale === "xlarge"
                                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                        : isDaylight ? "bg-slate-100 border-slate-200 text-slate-500" : "bg-white/5 border-white/10 text-white/40"
                                )}
                            >
                                X-Besar
                            </button>
                        </div>
                    </div>

                    {/* Content Toggles */}
                    <div className="space-y-2">
                        <label className={cn("text-[11px] font-bold uppercase tracking-wider block", isDaylight ? "text-slate-400" : "text-white/40")}>
                            Kustomisasi Elemen Teks
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                            <button
                                onClick={() => setShowArabic(!showArabic)}
                                className={cn(
                                    "py-1.5 px-2 rounded-lg font-semibold border transition-all cursor-pointer text-center",
                                    showArabic
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold"
                                        : isDaylight ? "bg-slate-100 border-slate-200 text-slate-400 opacity-60" : "bg-white/5 border-white/10 text-white/30 opacity-60"
                                )}
                            >
                                Arab {showArabic ? "✓" : "✕"}
                            </button>

                            <button
                                onClick={() => setShowLatin(!showLatin)}
                                className={cn(
                                    "py-1.5 px-2 rounded-lg font-semibold border transition-all cursor-pointer text-center",
                                    showLatin
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold"
                                        : isDaylight ? "bg-slate-100 border-slate-200 text-slate-400 opacity-60" : "bg-white/5 border-white/10 text-white/30 opacity-60"
                                )}
                            >
                                Latin {showLatin ? "✓" : "✕"}
                            </button>

                            <button
                                onClick={() => setShowExplanation(!showExplanation)}
                                className={cn(
                                    "py-1.5 px-2 rounded-lg font-semibold border transition-all cursor-pointer text-center",
                                    showExplanation
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold"
                                        : isDaylight ? "bg-slate-100 border-slate-200 text-slate-400 opacity-60" : "bg-white/5 border-white/10 text-white/30 opacity-60"
                                )}
                            >
                                Tadabbur {showExplanation ? "✓" : "✕"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="p-3 border-t border-white/10 bg-black/10 flex items-center gap-2">
                    {/* Native Share Button (Primary action for mobile) */}
                    <button
                        disabled={isExporting}
                        onClick={handleNativeShare}
                        className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {sharedSuccess ? (
                            <Check className="w-4 h-4 text-white" />
                        ) : (
                            <Share2 className="w-4 h-4" />
                        )}
                        <span>{sharedSuccess ? "Berhasil Dibagikan" : "Bagikan ke Story"}</span>
                    </button>

                    {/* Download WebP */}
                    <button
                        disabled={isExporting}
                        onClick={handleDownload}
                        className={cn(
                            "p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center",
                            isDaylight
                                ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                                : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                        )}
                        title="Unduh Gambar WebP (Super Ringan)"
                    >
                        <Download className="w-4 h-4" />
                    </button>

                    {/* Copy Image */}
                    <button
                        disabled={isExporting}
                        onClick={handleCopyImage}
                        className={cn(
                            "p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center",
                            isDaylight
                                ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                                : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                        )}
                        title="Salin Gambar ke Clipboard"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
