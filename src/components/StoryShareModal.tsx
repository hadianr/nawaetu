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
import { createPortal } from "react-dom";
import { X, Share2, Download, Copy, Check, Sparkles, Moon, Sun, Type } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
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
    const { t } = useLocale();
    const [mounted, setMounted] = useState(false);
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

    useEffect(() => {
        setMounted(true);
    }, []);

    // Update preview canvas in real-time when controls change or when component mounts
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

        if (mounted) {
            updatePreview();
        }
        return () => {
            isMounted = false;
        };
    }, [mounted, item, theme, fontSizeScale, showArabic, showLatin, showExplanation]);

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
                handleDownloadBlob(blob, fileName);
                setStatusMessage(t.storyShareDownloaded || "Gambar telah diunduh! Buka Instagram & bagikan ke Story.");
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
        if (isExporting) return;
        setIsExporting(true);
        try {
            const { blob, fileName } = await exportStoryCardBlob(item, {
                theme,
                fontSizeScale,
                showArabic,
                showLatin,
                showExplanation,
            });
            handleDownloadBlob(blob, fileName);
            setStatusMessage(t.storyShareWebpDownloaded || "Gambar WebP berhasil diunduh!");
            setTimeout(() => setStatusMessage(null), 3000);
        } catch (err) {
            console.error("Download error:", err);
        } finally {
            setIsExporting(false);
        }
    };

    // Handle Copy Image to Clipboard
    const handleCopyImage = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const { blob, fileName } = await exportStoryCardBlob(item, {
                theme,
                fontSizeScale,
                showArabic,
                showLatin,
                showExplanation,
            });
            if (navigator.clipboard && window.ClipboardItem) {
                const clipboardItem = new ClipboardItem({ [blob.type]: blob });
                await navigator.clipboard.write([clipboardItem]);
                setCopied(true);
                setStatusMessage(t.storyShareCopied || "Gambar tersalin ke clipboard!");
                setTimeout(() => {
                    setCopied(false);
                    setStatusMessage(null);
                }, 3000);
            } else {
                handleDownloadBlob(blob, fileName);
                setStatusMessage(t.storyShareClipboardUnsupported || "Clipboard tidak didukung browser. Gambar diunduh!");
                setTimeout(() => setStatusMessage(null), 3000);
            }
        } catch (err) {
            console.error("Copy error:", err);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadBlob = (blob: Blob, fileName: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div
                className={cn(
                    "relative w-full max-w-sm min-[390px]:max-w-[420px] sm:max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200 z-10",
                    isDaylight
                        ? "bg-white border-slate-200 text-slate-900"
                        : "bg-slate-900 border-white/10 text-white"
                )}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-emerald-500" />
                        <h2 className="text-xs sm:text-sm font-bold tracking-tight">{t.storyShareTitle || "Bagikan ke Story"}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={cn(
                            "p-1 rounded-full transition-colors cursor-pointer",
                            isDaylight ? "hover:bg-slate-100 text-slate-400" : "hover:bg-white/10 text-white/40"
                        )}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Body: Fully Responsive Crisp Preview & Consolidated Controls */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
                    {/* Live 9:16 Dynamic Canvas Preview Card (Scales from iPhone SE -> 14 Pro Max -> Desktop) */}
                    <div className="relative w-full flex justify-center py-2 px-2 rounded-xl border border-white/10 bg-black/40 shadow-inner overflow-hidden group">
                        <div className="relative h-[260px] min-[390px]:h-[350px] min-[410px]:h-[390px] sm:h-[440px] max-h-[52vh] aspect-[9/16] rounded-xl overflow-hidden shadow-xl border border-white/10 flex items-center justify-center transition-all duration-300">
                            <canvas
                                ref={previewCanvasRef}
                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                            />
                            {isExporting && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-[11px] font-bold gap-1.5 animate-in fade-in">
                                    <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                                    <span>{t.storyShareCompressing || "Mengompres..."}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Message Notification */}
                    {statusMessage && (
                        <div className="p-2 rounded-lg text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center animate-in slide-in-from-top-1">
                            {statusMessage}
                        </div>
                    )}

                    {/* Consolidated Compact Options Bar */}
                    <div className="space-y-1.5 pt-0.5">
                        {/* Row 1: Theme Switcher & Font Scaling Combined */}
                        <div className="flex items-center gap-1.5 text-[11px]">
                            {/* Theme Pills */}
                            <div className={cn(
                                "flex items-center gap-0.5 p-0.5 rounded-xl border flex-1",
                                isDaylight ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/10"
                            )}>
                                <button
                                    type="button"
                                    onClick={() => setTheme("dark")}
                                    className={cn(
                                        "flex-1 py-1 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer",
                                        theme === "dark"
                                            ? "bg-slate-900 text-emerald-400 shadow-xs border border-emerald-400/30"
                                            : isDaylight ? "text-slate-600 hover:text-slate-900" : "text-white/50 hover:text-white"
                                    )}
                                >
                                    <Moon className="w-3 h-3" />
                                    <span>Dark</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTheme("light")}
                                    className={cn(
                                        "flex-1 py-1 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer",
                                        theme === "light"
                                            ? "bg-emerald-600 text-white shadow-xs"
                                            : isDaylight ? "text-slate-600 hover:text-slate-900" : "text-white/50 hover:text-white"
                                    )}
                                >
                                    <Sun className="w-3 h-3" />
                                    <span>Light</span>
                                </button>
                            </div>

                            {/* Font Size Pills */}
                            <div className={cn(
                                "flex items-center gap-0.5 p-0.5 rounded-xl border",
                                isDaylight ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/10"
                            )}>
                                <button
                                    type="button"
                                    onClick={() => setFontSizeScale("normal")}
                                    className={cn(
                                        "px-2 py-1 rounded-lg font-bold transition-all cursor-pointer text-center",
                                        fontSizeScale === "normal"
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            : isDaylight ? "text-slate-500 hover:text-slate-800" : "text-white/40 hover:text-white"
                                    )}
                                    title="Ukuran Normal"
                                >
                                    A
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFontSizeScale("large")}
                                    className={cn(
                                        "px-2 py-1 rounded-lg font-bold transition-all cursor-pointer text-center",
                                        fontSizeScale === "large"
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            : isDaylight ? "text-slate-500 hover:text-slate-800" : "text-white/40 hover:text-white"
                                    )}
                                    title="Ukuran Besar"
                                >
                                    A+
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFontSizeScale("xlarge")}
                                    className={cn(
                                        "px-2 py-1 rounded-lg font-bold transition-all cursor-pointer text-center",
                                        fontSizeScale === "xlarge"
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            : isDaylight ? "text-slate-500 hover:text-slate-800" : "text-white/40 hover:text-white"
                                    )}
                                    title="Ukuran Sangat Besar"
                                >
                                    A++
                                </button>
                            </div>
                        </div>

                        {/* Row 2: Text Toggles Combined */}
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                            <button
                                type="button"
                                onClick={() => setShowArabic(!showArabic)}
                                className={cn(
                                    "py-1 px-1.5 rounded-lg font-semibold border transition-all cursor-pointer text-center",
                                    showArabic
                                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold"
                                        : isDaylight ? "bg-slate-100 border-slate-200 text-slate-400 opacity-60" : "bg-white/5 border-white/10 text-white/30 opacity-60"
                                )}
                            >
                                {(t.storyShareArabic || "Arab")} {showArabic ? "✓" : "✕"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowLatin(!showLatin)}
                                className={cn(
                                    "py-1 px-1.5 rounded-lg font-semibold border transition-all cursor-pointer text-center",
                                    showLatin
                                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold"
                                        : isDaylight ? "bg-slate-100 border-slate-200 text-slate-400 opacity-60" : "bg-white/5 border-white/10 text-white/30 opacity-60"
                                )}
                            >
                                {(t.storyShareLatin || "Latin")} {showLatin ? "✓" : "✕"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowExplanation(!showExplanation)}
                                className={cn(
                                    "py-1 px-1.5 rounded-lg font-semibold border transition-all cursor-pointer text-center",
                                    showExplanation
                                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold"
                                        : isDaylight ? "bg-slate-100 border-slate-200 text-slate-400 opacity-60" : "bg-white/5 border-white/10 text-white/30 opacity-60"
                                )}
                            >
                                {(t.storyShareExplanation || "Tadabbur")} {showExplanation ? "✓" : "✕"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="p-2.5 sm:p-3 border-t border-white/10 bg-black/20 flex items-center gap-2">
                    {/* Native Share Button (Primary action for mobile) */}
                    <button
                        disabled={isExporting}
                        onClick={handleNativeShare}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {sharedSuccess ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                        ) : (
                            <Share2 className="w-3.5 h-3.5" />
                        )}
                        <span>{sharedSuccess ? (t.storyShareShared || "Berhasil Dibagikan") : (t.storyShareTitle || "Bagikan ke Story")}</span>
                    </button>

                    {/* Download WebP */}
                    <button
                        disabled={isExporting}
                        onClick={handleDownload}
                        className={cn(
                            "p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center",
                            isDaylight
                                ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                                : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                        )}
                        title="Unduh Gambar WebP (Super Ringan)"
                    >
                        <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy Image */}
                    <button
                        disabled={isExporting}
                        onClick={handleCopyImage}
                        className={cn(
                            "p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center",
                            isDaylight
                                ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                                : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                        )}
                        title="Salin Gambar ke Clipboard"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
