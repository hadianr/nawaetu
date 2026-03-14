"use client";

import { useState, useEffect } from "react";
import { BookOpen, X, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

interface QuranFocusOverlayProps {
    onConfirm: () => void;   // user taps "Bismillah, Mulai"
    onCancel: () => void;    // user taps "Batal"
}

/** 
 * Layer 1 — Niyyah Entry Screen  
 * Shown BEFORE the timer starts. Helps user set intention before reading.
 */
export function QuranNiyyahScreen({ onConfirm, onCancel }: QuranFocusOverlayProps) {
    const { currentTheme } = useTheme();
    const isLight = currentTheme === "daylight";
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            className={cn(
                "fixed inset-0 z-[9999] flex flex-col items-center justify-center px-8 transition-all duration-500",
                isLight
                    ? "bg-gradient-to-b from-amber-50 via-white to-amber-50/80"
                    : "bg-gradient-to-b from-[#050508] via-[#0a0a12] to-[#050508]",
                visible ? "opacity-100" : "opacity-0"
            )}
        >
            {/* Decorative glow */}
            <div className={cn(
                "absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] pointer-events-none",
                isLight ? "bg-amber-300/30" : "bg-emerald-500/10"
            )} />

            {/* Icon */}
            <div className={cn(
                "w-20 h-20 rounded-[28px] mb-6 flex items-center justify-center shadow-2xl border",
                isLight
                    ? "bg-amber-100 border-amber-300/50 shadow-amber-200/40"
                    : "bg-emerald-950/60 border-emerald-500/20 shadow-emerald-900/40"
            )}>
                <BookOpen className={cn("w-9 h-9", isLight ? "text-amber-700" : "text-emerald-400")} />
            </div>

            {/* Basmallah */}
            <p className={cn(
                "text-3xl font-arabic mb-2 tracking-wide",
                isLight ? "text-amber-800" : "text-emerald-300"
            )}>
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>

            <p className={cn(
                "text-sm mb-1 font-medium",
                isLight ? "text-amber-700/80" : "text-white/50"
            )}>
                Bismillahir-Rahmanir-Rahim
            </p>

            {/* Niyyah text */}
            <div className={cn(
                "mt-6 mb-8 rounded-2xl px-6 py-4 border text-center max-w-xs",
                isLight
                    ? "bg-amber-50 border-amber-200/60"
                    : "bg-white/[0.03] border-white/8"
            )}>
                <p className={cn("text-xs font-medium leading-relaxed", isLight ? "text-stone-600" : "text-white/60")}>
                    Luruskan niat — baca Al-Qur&apos;an karena Allah semata, bukan karena rutinitas.
                    Layar akan masuk mode fokus. Genggamlah setiap ayat dengan hati yang hadir.
                </p>
            </div>

            {/* Buttons */}
            <button
                onClick={onConfirm}
                className={cn(
                    "w-full max-w-xs py-4 rounded-2xl font-bold text-base mb-3 transition-all active:scale-95 shadow-lg",
                    isLight
                        ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-300/40"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40"
                )}
            >
                ✨ Bismillah, Mulai Tilawah
            </button>

            <button
                onClick={onCancel}
                className={cn(
                    "text-sm font-medium transition-colors",
                    isLight ? "text-stone-400 hover:text-stone-600" : "text-white/30 hover:text-white/60"
                )}
            >
                Batal
            </button>
        </div>
    );
}

interface FocusBadgeProps {
    sessionSeconds: number;
    onExit: () => void;
}

/** 
 * Layer 2 — Active Focus Mode Badge  
 * A minimal floating badge shown while tracking is active.
 */
export function QuranFocusBadge({ sessionSeconds, onExit }: FocusBadgeProps) {
    const { currentTheme } = useTheme();
    const isLight = currentTheme === "daylight";

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    };

    return (
        <div className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-4 py-2 rounded-full border shadow-2xl backdrop-blur-xl transition-all",
            isLight
                ? "bg-white/90 border-amber-200/60 shadow-amber-100/40"
                : "bg-black/80 border-emerald-500/20 shadow-black/60"
        )}>
            {/* Live dot */}
            <div className="relative flex h-2 w-2">
                <span className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    isLight ? "bg-amber-400" : "bg-emerald-400"
                )} />
                <span className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    isLight ? "bg-amber-500" : "bg-emerald-500"
                )} />
            </div>
            <span className={cn("text-xs font-medium", isLight ? "text-stone-600" : "text-white/70")}>
                Fokus Mode
            </span>
            <span className={cn("text-xs font-mono font-bold tabular-nums", isLight ? "text-amber-700" : "text-emerald-400")}>
                {formatTime(sessionSeconds)}
            </span>
            <div className={cn("w-px h-3", isLight ? "bg-stone-200" : "bg-white/10")} />
            <button
                onClick={onExit}
                title="Keluar dari Fokus Mode"
                className={cn(
                    "transition-colors",
                    isLight ? "text-stone-400 hover:text-red-500" : "text-white/30 hover:text-red-400"
                )}
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

/**
 * Exit confirmation when user tries to leave focus mode context
 */
export function QuranFocusExitConfirm({ sessionSeconds, onConfirm, onCancel }: {
    sessionSeconds: number;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const { currentTheme } = useTheme();
    const isLight = currentTheme === "daylight";

    const minutes = Math.floor(sessionSeconds / 60);
    const seconds = sessionSeconds % 60;
    const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds} detik`;

    return (
        <div className="fixed inset-0 z-[9998] flex items-end justify-center pb-8 px-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div className={cn(
                "relative w-full max-w-sm rounded-3xl border p-6 shadow-2xl",
                isLight
                    ? "bg-white border-stone-200"
                    : "bg-[#111] border-white/10"
            )}>
                <p className={cn("text-sm font-bold mb-1", isLight ? "text-stone-800" : "text-white")}>
                    Akhiri sesi tilawah?
                </p>
                <p className={cn("text-xs mb-5 leading-relaxed", isLight ? "text-stone-500" : "text-white/40")}>
                    Anda sudah membaca selama <strong className={isLight ? "text-amber-700" : "text-emerald-400"}>{timeStr}</strong>.
                    Waktu ini sudah tersimpan. Lanjutkan jika memungkinkan — setiap menit bernilai di sisi Allah.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className={cn(
                            "flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors",
                            isLight
                                ? "border-stone-200 text-stone-600 hover:bg-stone-50"
                                : "border-white/10 text-white/60 hover:bg-white/5"
                        )}
                    >
                        Lanjut Baca
                    </button>
                    <button
                        onClick={onConfirm}
                        className={cn(
                            "flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors",
                            isLight
                                ? "bg-amber-600 hover:bg-amber-700 text-white"
                                : "bg-emerald-700 hover:bg-emerald-600 text-white"
                        )}
                    >
                        Selesai Baca
                    </button>
                </div>
            </div>
        </div>
    );
}

/** Small theme indicator badge shown at top-right in focus mode */
export function FocusModeThemeIndicator() {
    const { currentTheme } = useTheme();
    const isLight = currentTheme === "daylight";
    return (
        <div className="fixed top-5 right-4 z-[201]">
            {isLight
                ? <Sun className="w-4 h-4 text-amber-500 opacity-60" />
                : <Moon className="w-4 h-4 text-white/30" />
            }
        </div>
    );
}
