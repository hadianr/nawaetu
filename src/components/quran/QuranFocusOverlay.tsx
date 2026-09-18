"use client";

import { useState, useEffect } from "react";
import { BookOpen, X, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/context/LocaleContext";

interface QuranFocusOverlayProps {
    onConfirm: () => void;   // user taps "Bismillah, Mulai"
    onCancel: () => void;    // user taps "Batal"
}

/** 
 * Layer 1 — Niyyah Entry Screen  
 * Shown BEFORE the timer starts. Helps user set intention before reading.
 */
export function QuranNiyyahScreen({ onConfirm, onCancel }: QuranFocusOverlayProps) {
    const [visible, setVisible] = useState(false);
    const t = useTranslations();

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            className={cn(
                "fixed inset-0 z-[9999] flex flex-col items-center justify-center px-8 transition-all duration-500",
                "bg-[rgb(var(--color-background))]",
                visible ? "opacity-100" : "opacity-0"
            )}
        >
            {/* Decorative glow */}
            <div className={cn(
                "absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] pointer-events-none",
                "bg-[rgb(var(--color-primary))]/15"
            )} />

            {/* Icon */}
            <div className={cn(
                "w-20 h-20 rounded-[28px] mb-6 flex items-center justify-center shadow-2xl border",
                "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-border))] shadow-[var(--shadow-floating)]"
            )}>
                <BookOpen className="w-9 h-9 text-[rgb(var(--color-primary))]" />
            </div>

            {/* Basmallah */}
            <p className={cn(
                "text-3xl font-arabic mb-2 tracking-wide",
                "text-[rgb(var(--color-primary-strong))]"
            )}>
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>

            <p className={cn(
                "text-sm mb-1 font-medium",
                "text-[rgb(var(--color-text-muted))]"
            )}>
                {t.tilawahNiyyahTitle}
            </p>

            {/* Niyyah text */}
            <div className={cn(
                "mt-6 mb-8 rounded-2xl px-6 py-4 border text-center max-w-xs",
                "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]"
            )}>
                <p className="text-xs font-medium leading-relaxed text-[rgb(var(--color-text-muted))]">
                    {t.tilawahNiyyahBody}
                </p>
            </div>

            {/* Buttons */}
            <button
                onClick={onConfirm}
                className={cn(
                    "w-full max-w-xs py-4 rounded-2xl font-bold text-base mb-3 transition-all active:scale-95 shadow-lg",
                    "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))] text-[rgb(var(--color-primary-foreground))] shadow-[var(--shadow-card)]"
                )}
            >
                {t.tilawahConfirm}
            </button>

            <button
                onClick={onCancel}
                className={cn(
                    "text-sm font-medium transition-colors",
                    "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))]"
                )}
            >
                {t.tilawahCancel}
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
 * A minimal floating pill shown while tracking is active.
 * Smaller and less intrusive for mobile.
 */
export function QuranFocusBadge({ sessionSeconds, onExit }: FocusBadgeProps) {
    const t = useTranslations();

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    };

    return (
        <div className={cn(
            "fixed top-3 left-1/2 -translate-x-1/2 z-[200] flex items-center rounded-full border shadow-lg backdrop-blur-xl transition-all overflow-hidden",
            "bg-[rgb(var(--color-surface))]/95 border-[rgb(var(--color-border))] shadow-[var(--shadow-floating)]"
        )}>
            {/* Left content: live dot + label + time */}
            <div className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5">
                {/* Live dot */}
                <div className="relative flex h-1.5 w-1.5 flex-shrink-0">
                    <span className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        "bg-[rgb(var(--color-primary))]"
                    )} />
                    <span className={cn(
                        "relative inline-flex rounded-full h-1.5 w-1.5",
                        "bg-[rgb(var(--color-primary))]"
                    )} />
                </div>
                <span className="text-[10px] font-medium leading-none text-[rgb(var(--color-text-muted))]">
                    {t.tilawahFocusMode}
                </span>
                <span className="text-[10px] font-mono font-bold tabular-nums leading-none text-[rgb(var(--color-primary-strong))]">
                    {formatTime(sessionSeconds)}
                </span>
            </div>
            {/* X button — larger tap area, square for easy tapping */}
            <button
                onClick={onExit}
                title={t.tilawahExitTooltip}
                className={cn(
                    "flex items-center justify-center h-full px-2.5 py-1.5 border-l transition-colors active:scale-95",
                    "border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10"
                )}
            >
                <X className="w-3 h-3" strokeWidth={2.5} />
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
    const t = useTranslations();

    const minutes = Math.floor(sessionSeconds / 60);
    const seconds = sessionSeconds % 60;
    const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    return (
        <div className="fixed inset-0 z-[9998] flex items-end justify-center pb-8 px-4">
            <div
                className="absolute inset-0 bg-[rgb(var(--color-text-strong))]/60 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div className={cn(
                "relative w-full max-w-sm rounded-3xl border p-6 shadow-2xl",
                "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]"
            )}>
                <p className="text-sm font-bold mb-1 text-[rgb(var(--color-text-strong))]">
                    {t.tilawahExitTitle}
                </p>
                <p className="text-xs mb-5 leading-relaxed text-[rgb(var(--color-text-muted))]">
                    {t.tilawahExitBody} <strong className="text-[rgb(var(--color-primary-strong))]">{timeStr}</strong>
                    {t.tilawahExitBodySuffix}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className={cn(
                            "flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors",
                            "border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-subtle))]"
                        )}
                    >
                        {t.tilawahContinue}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={cn(
                            "flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors",
                            "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))] text-[rgb(var(--color-primary-foreground))]"
                        )}
                    >
                        {t.tilawahFinish}
                    </button>
                </div>
            </div>
        </div>
    );
}

/** Small theme indicator badge shown at top-right in focus mode */
export function FocusModeThemeIndicator() {
    return (
        <div className="fixed top-5 right-4 z-[201]">
            <Sun className="w-4 h-4 text-[rgb(var(--color-primary))] opacity-60" />
        </div>
    );
}
