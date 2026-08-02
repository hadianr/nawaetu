"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * FastingDayModal — modal to log/edit a single day's fasting status
 * Supports: all status types, gender filtering, madzhab selection for hamil/menyusui,
 * optional note, consequence preview, dalil + translation display, Hasanah reward.
 */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "@/context/LocaleContext";
import { FASTING_STATUS_META, MADZHAB_OPTIONS, getConsequence } from "@/data/fasting/fiqh-rules";
import type { FastingDayLog, FastingStatus, Madzhab } from "@/data/fasting/types";
import { addHasanah } from "@/lib/habits/leveling";
import { toast } from "sonner";

// ─── Consequence label helper ─────────────────────────────────────────────────

function getConsequenceStyle(consequence: string, t: any): { label: string; color: string; bg: string } {
    switch (consequence) {
        case "none": return { label: t.fastingConsequenceNone, color: "text-green-300", bg: "bg-green-500/10 border-green-500/20" };
        case "qadha": return { label: t.fastingConsequenceQadha, color: "text-amber-300", bg: "bg-amber-500/10 border-amber-500/25" };
        case "fidyah": return { label: t.fastingConsequenceFidyah, color: "text-orange-300", bg: "bg-orange-500/10 border-orange-500/25" };
        case "choice": return { label: t.fastingConsequenceChoice, color: "text-purple-300", bg: "bg-purple-500/10 border-purple-500/25" };
        default: return { label: consequence, color: "text-white/60", bg: "bg-white/5 border-white/10" };
    }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FEMALE_ONLY_STATUSES: FastingStatus[] = ["menstruation", "postpartum", "pregnant", "breastfeeding"];
const HASANAH_FASTING = 20;

// ─── Component ────────────────────────────────────────────────────────────────

interface FastingDayModalProps {
    isOpen: boolean;
    hijriYear: number;
    hijriDay: number;
    gregorianDate?: string;
    initialLog?: FastingDayLog | null;
    defaultMadzhab?: Madzhab | null;
    gender?: "male" | "female" | null;
    onSave: (status: FastingStatus, madzhab?: Madzhab | null, note?: string) => void;
    onClose: () => void;
}

export default function FastingDayModal({
    isOpen,
    hijriYear,
    hijriDay,
    gregorianDate,
    initialLog,
    defaultMadzhab,
    gender,
    onSave,
    onClose,
}: FastingDayModalProps) {
    const t = useTranslations() as any;
    const [selectedStatus, setSelectedStatus] = useState<FastingStatus>(initialLog?.status ?? "fasting");
    const [selectedMadzhab, setSelectedMadzhab] = useState<Madzhab | null>(
        initialLog?.madzhab ?? defaultMadzhab ?? null
    );
    const [note, setNote] = useState(initialLog?.note ?? "");
    const [showMadzhabSelector, setShowMadzhabSelector] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setSelectedStatus(initialLog?.status ?? "fasting");
            setSelectedMadzhab(initialLog?.madzhab ?? defaultMadzhab ?? null);
            setNote(initialLog?.note ?? "");
        }
    }, [isOpen, initialLog, defaultMadzhab]);

    const requiresMadzhab = FASTING_STATUS_META[selectedStatus]?.requiresMadzhab ?? false;

    useEffect(() => {
        setShowMadzhabSelector(requiresMadzhab);
    }, [requiresMadzhab]);

    const consequence = getConsequence(selectedStatus, requiresMadzhab ? selectedMadzhab : null);
    const { label: consequenceLabel, color: consequenceColor, bg: consequenceBg } = getConsequenceStyle(consequence, t);

    // Filter statuses based on gender
    const allStatuses = Object.keys(FASTING_STATUS_META) as FastingStatus[];
    const visibleStatuses = gender === "male"
        ? allStatuses.filter(s => !FEMALE_ONLY_STATUSES.includes(s))
        : allStatuses;

    const handleSave = () => {
        const wasAlreadyFasting = initialLog?.status === "fasting";
        const isFasting = selectedStatus === "fasting";

        // Award Hasanah only when marking fasting for the first time on this day
        if (isFasting && !wasAlreadyFasting) {
            addHasanah(HASANAH_FASTING);
            toast.success(t.fastingTitle || "Puasa", {
                description: `Alhamdulillah! +${HASANAH_FASTING} ${t.gamificationXpName || "Hasanah"} 🌙`,
                icon: "✅",
                duration: 3000,
            });
        } else {
            toast.success(t.fastingToastSaved, { icon: "🌙", duration: 2000 });
        }

        onSave(selectedStatus, requiresMadzhab ? selectedMadzhab : null, note || undefined);
        onClose();
    };

    if (!isOpen || !mounted) return null;

    const modalTitle = (t.fastingDayModalTitle as string)
        .replace("{day}", String(hijriDay))
        .replace("{year}", String(hijriYear));

    const statusMeta = FASTING_STATUS_META[selectedStatus];

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 overscroll-none">
            {/* Opaque backdrop with high blur for maximum focus */}
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
                onClick={onClose}
            />

            {/* Modal — Full screen on mobile, centered on desktop */}
            <div
                className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl border-0 sm:border border-white/15 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300"
                style={{ background: "rgb(12, 12, 18)" }}
            >
                {/* Header — compact and centered */}
                <div className="px-5 pt-3 pb-2 border-b border-white/8 shrink-0 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-white text-sm sm:text-base">{modalTitle}</h2>
                        {gregorianDate && (
                            <p className="text-[10px] text-white/40 mt-0.5">{gregorianDate}</p>
                        )}
                    </div>
                    {/* Add Close button back for better mobile UX in full screen */}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable body — takes up remaining space */}
                <div className="px-5 py-3 space-y-3 flex-1 overflow-y-auto overscroll-contain scrollbar-hide">

                    {/* Status Picker — More compact grid */}
                    <div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">
                            {t.fastingDayModalStatusLabel}
                        </p>
                        <div className="grid grid-cols-4 gap-1.5">
                            {visibleStatuses.map((status) => {
                                const meta = FASTING_STATUS_META[status];
                                const isSelected = selectedStatus === status;
                                const labelKey = `fastingStatus${status.charAt(0).toUpperCase() + status.slice(1).replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase())}`;
                                const label = t[labelKey] ?? status;

                                return (
                                    <button
                                        key={status}
                                        onClick={() => setSelectedStatus(status)}
                                        className={`rounded-xl border px-1 py-1.5 text-center transition-all duration-200 active:scale-90 ${isSelected
                                            ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/20 text-white shadow-[0_0_15px_rgba(var(--color-primary),0.15)]"
                                            : "border-white/8 bg-white/3 text-white/40 hover:border-white/15 hover:text-white/60"
                                            }`}
                                    >
                                        <span className="block text-xl mb-1">{meta.icon}</span>
                                        <span className="text-[9px] font-bold leading-tight block">{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Madzhab Selector (conditional) */}
                    {showMadzhabSelector && (
                        <div className="rounded-2xl border border-purple-500/25 bg-purple-500/10 p-4 space-y-3">
                            <div>
                                <p className="text-[11px] font-bold text-purple-300 mb-1">{t.fastingMadzhabTitle}</p>
                                <p className="text-[10px] text-white/40 leading-relaxed">{t.fastingMadzhabSubtitle}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {MADZHAB_OPTIONS.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedMadzhab(m.id)}
                                        className={`rounded-xl border px-3 py-3 text-left transition-all ${selectedMadzhab === m.id
                                            ? "border-purple-400/50 bg-purple-500/25 text-purple-100"
                                            : "border-white/8 bg-white/3 text-white/40 hover:border-white/15"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-xs">{m[`name${"Id"}` as "nameId"]}</span>
                                            {m.suggestion && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase tracking-tighter">Suggestion</span>}
                                        </div>
                                        <p className="text-[10px] leading-relaxed opacity-60">
                                            {m.pregnantBreastfeedingNote}
                                        </p>
                                    </button>
                                ))}
                            </div>
                            {!selectedMadzhab && (
                                <p className="text-[10px] text-amber-400/80 font-medium italic">{t.fastingConsequenceChoiceNote}</p>
                            )}
                        </div>
                    )}

                    {/* Consequence Preview */}
                    <div className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 ${consequenceBg}`}>
                        <span className="text-white/30 text-[11px] font-medium">{t.fastingDayModalRuling}</span>
                        <span className={`text-[11px] font-black uppercase tracking-wider ${consequenceColor}`}>
                            {consequenceLabel}
                        </span>
                    </div>

                    {/* Dalil + Translation */}
                    {selectedStatus !== "fasting" && statusMeta && (
                        <div className="rounded-xl border border-white/8 bg-white/2 px-4 py-4 space-y-2.5">
                            <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest">
                                {t.fastingDayModalDalilLabel}
                            </p>
                            <p className="text-[12px] text-[rgb(var(--color-primary-light,var(--color-primary)))] font-semibold leading-relaxed">
                                {statusMeta.dalil}
                            </p>
                            {statusMeta.dalilTranslation && (
                                <p className="text-[11px] text-white/45 italic leading-relaxed">
                                    &ldquo;{statusMeta.dalilTranslation}&rdquo;
                                </p>
                            )}
                        </div>
                    )}

                    {/* Note */}
                    <div>
                        <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2">
                            {t.fastingDayModalNoteLabel}
                        </p>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={t.fastingDayModalNotePlaceholder}
                            rows={2}
                            maxLength={200}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[rgb(var(--color-primary))]/40 transition-colors"
                        />
                    </div>
                </div>

                {/* Footer — Solid background for clarity */}
                <div className="flex gap-3 px-5 pb-8 pt-3 border-t border-white/8 shrink-0 bg-[#0c0c12]">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-white/10 bg-white/3 py-4 text-xs font-bold text-white/50 hover:bg-white/8 transition-all active:scale-95"
                    >
                        {t.fastingDayModalCancel}
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 rounded-xl py-4 text-xs font-black text-white transition-all active:scale-95 shadow-xl"
                        style={{ background: "linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-primary-light, var(--color-primary))))" }}
                    >
                        {t.fastingDayModalSave}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
