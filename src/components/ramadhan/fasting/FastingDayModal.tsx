"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * FastingDayModal — modal to log/edit a single day's fasting status
 * Supports: all status types, gender filtering, madzhab selection for hamil/menyusui,
 * optional note, consequence preview, dalil + translation display, Hasanah reward.
 */

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "@/context/LocaleContext";
import type { TranslationTree } from "@/context/LocaleContext";
import { FASTING_STATUS_META, MADZHAB_OPTIONS, getConsequence } from "@/data/fasting/fiqh-rules";
import { AppIcon } from "@/components/ui/AppIcon";
import { X } from "lucide-react";
import type { FastingDayLog, FastingStatus, Madzhab } from "@/data/fasting/types";
import { addHasanah } from "@/lib/habits/leveling";
import { toast } from "sonner";

// ─── Consequence label helper ─────────────────────────────────────────────────

function getConsequenceStyle(consequence: string, t: TranslationTree): { label: string; color: string; bg: string } {
    switch (consequence) {
        case "none": return { label: t.fastingConsequenceNone, color: "text-[rgb(var(--color-success))]", bg: "bg-[rgb(var(--color-success))]/10 border-[rgb(var(--color-success))]/20" };
        case "qadha": return { label: t.fastingConsequenceQadha, color: "text-[rgb(var(--color-warning))]", bg: "bg-[rgb(var(--color-warning))]/10 border-[rgb(var(--color-warning))]/25" };
        case "fidyah": return { label: t.fastingConsequenceFidyah, color: "text-[rgb(var(--color-accent))]", bg: "bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/25" };
        case "choice": return { label: t.fastingConsequenceChoice, color: "text-[rgb(var(--color-primary-light))]", bg: "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/25" };
        default: return { label: consequence, color: "text-[rgb(var(--color-text-muted))]", bg: "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]" };
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
    const t = useTranslations() as TranslationTree;
    const getTranslation = (key: string, fallback: string) => {
        const value = t[key as keyof TranslationTree];
        return typeof value === "string" ? value : fallback;
    };
    const [selectedStatus, setSelectedStatus] = useState<FastingStatus>(initialLog?.status ?? "fasting");
    const [selectedMadzhab, setSelectedMadzhab] = useState<Madzhab | null>(
        initialLog?.madzhab ?? defaultMadzhab ?? null
    );
    const [note, setNote] = useState(initialLog?.note ?? "");
    const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

    useEffect(() => {
        if (isOpen) {
            queueMicrotask(() => {
                setSelectedStatus(initialLog?.status ?? "fasting");
                setSelectedMadzhab(initialLog?.madzhab ?? defaultMadzhab ?? null);
                setNote(initialLog?.note ?? "");
            });
        }
    }, [isOpen, initialLog, defaultMadzhab]);

    const requiresMadzhab = FASTING_STATUS_META[selectedStatus]?.requiresMadzhab ?? false;

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
                description: `Alhamdulillah! +${HASANAH_FASTING} ${t.gamificationXpName || "Hasanah"}`,
                icon: <AppIcon name="shield-check" size="sm" tone="success" />,
                duration: 3000,
            });
        } else {
            toast.success(t.fastingToastSaved, { icon: <AppIcon name="moon" size="sm" tone="primary" />, duration: 2000 });
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
                className="absolute inset-0 bg-[rgb(var(--color-text-strong))]/80 backdrop-blur-3xl"
                onClick={onClose}
            />

            {/* Modal — Full screen on mobile, centered on desktop */}
            <div
                className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl border-0 sm:border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] shadow-[var(--shadow-floating)] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300"
            >
                {/* Header — compact and centered */}
                <div className="px-5 pt-3 pb-2 border-b border-[rgb(var(--color-border))] shrink-0 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-[rgb(var(--color-text-strong))] text-sm sm:text-base">{modalTitle}</h2>
                        {gregorianDate && (
                            <p className="text-[10px] text-[rgb(var(--color-text-muted))] mt-0.5">{gregorianDate}</p>
                        )}
                    </div>
                    {/* Add Close button back for better mobile UX in full screen */}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-[rgb(var(--color-surface-subtle))] flex items-center justify-center text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface))]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Scrollable body — takes up remaining space */}
                <div className="px-5 py-3 space-y-3 flex-1 overflow-y-auto overscroll-contain scrollbar-hide">

                    {/* Status Picker — More compact grid */}
                    <div>
                        <p className="text-[10px] font-bold text-[rgb(var(--color-text-muted))] uppercase tracking-widest mb-2">
                            {t.fastingDayModalStatusLabel}
                        </p>
                        <div className="grid grid-cols-4 gap-1.5">
                            {visibleStatuses.map((status) => {
                                const meta = FASTING_STATUS_META[status];
                                const isSelected = selectedStatus === status;
                                const labelKey = `fastingStatus${status.charAt(0).toUpperCase() + status.slice(1).replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase())}`;
                                const label = getTranslation(labelKey, status);

                                return (
                                    <button
                                        key={status}
                                        onClick={() => setSelectedStatus(status)}
                                        className={`rounded-xl border px-1 py-1.5 text-center transition-all duration-200 active:scale-90 ${isSelected
                                            ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-foreground))] shadow-[var(--shadow-card)]"
                                            : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text-muted))] hover:border-[rgb(var(--color-border-strong))] hover:text-[rgb(var(--color-text))]"
                                            }`}
                                    >
                                        <AppIcon name={meta.iconKey} size="md" tone="primary" className="mx-auto mb-1" />
                                        <span className="text-[9px] font-bold leading-tight block">{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Madzhab Selector (conditional) */}
                    {requiresMadzhab && (
                        <div className="rounded-2xl border border-[rgb(var(--color-primary))]/25 bg-[rgb(var(--color-primary))]/10 p-4 space-y-3">
                            <div>
                                <p className="text-[11px] font-bold text-[rgb(var(--color-primary-light))] mb-1">{t.fastingMadzhabTitle}</p>
                                <p className="text-[10px] text-[rgb(var(--color-text-muted))] leading-relaxed">{t.fastingMadzhabSubtitle}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {MADZHAB_OPTIONS.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedMadzhab(m.id)}
                                        className={`rounded-xl border px-3 py-3 text-left transition-all ${selectedMadzhab === m.id
                                            ? "border-[rgb(var(--color-primary-light))]/50 bg-[rgb(var(--color-primary))]/25 text-[rgb(var(--color-text-strong))]"
                                            : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text-muted))] hover:border-[rgb(var(--color-border-strong))]"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-xs">{m[`name${"Id"}` as "nameId"]}</span>
                                            {m.suggestion && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgb(var(--color-warning))]/20 text-[rgb(var(--color-warning))] font-bold uppercase tracking-tighter">Suggestion</span>}
                                        </div>
                                        <p className="text-[10px] leading-relaxed opacity-60">
                                            {m.pregnantBreastfeedingNote}
                                        </p>
                                    </button>
                                ))}
                            </div>
                            {!selectedMadzhab && (
                                <p className="text-[10px] text-[rgb(var(--color-warning))] font-medium italic">{t.fastingConsequenceChoiceNote}</p>
                            )}
                        </div>
                    )}

                    {/* Consequence Preview */}
                    <div className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 ${consequenceBg}`}>
                        <span className="text-[rgb(var(--color-text-muted))] text-[11px] font-medium">{t.fastingDayModalRuling}</span>
                        <span className={`text-[11px] font-black uppercase tracking-wider ${consequenceColor}`}>
                            {consequenceLabel}
                        </span>
                    </div>

                    {/* Dalil + Translation */}
                    {selectedStatus !== "fasting" && statusMeta && (
                        <div className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] px-4 py-4 space-y-2.5">
                            <p className="text-[10px] text-[rgb(var(--color-text-muted))] font-bold uppercase tracking-widest">
                                {t.fastingDayModalDalilLabel}
                            </p>
                            <p className="text-[12px] text-[rgb(var(--color-primary-light,var(--color-primary)))] font-semibold leading-relaxed">
                                {statusMeta.dalil}
                            </p>
                            {statusMeta.dalilTranslation && (
                                <p className="text-[11px] text-[rgb(var(--color-text-muted))] italic leading-relaxed">
                                    &ldquo;{statusMeta.dalilTranslation}&rdquo;
                                </p>
                            )}
                        </div>
                    )}

                    {/* Note */}
                    <div>
                        <p className="text-[11px] font-bold text-[rgb(var(--color-text-muted))] uppercase tracking-widest mb-2">
                            {t.fastingDayModalNoteLabel}
                        </p>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={t.fastingDayModalNotePlaceholder}
                            rows={2}
                            maxLength={200}
                            className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] px-4 py-2 text-sm text-[rgb(var(--color-text-strong))] placeholder-[rgb(var(--color-text-muted))] resize-none focus:outline-none focus:border-[rgb(var(--color-primary))]/40 transition-colors"
                        />
                    </div>
                </div>

                {/* Footer — Solid background for clarity */}
                <div className="flex gap-3 px-5 pb-8 pt-3 border-t border-[rgb(var(--color-border))] shrink-0 bg-[rgb(var(--color-surface-subtle))]">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] py-4 text-xs font-bold text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-subtle))] transition-all active:scale-95"
                    >
                        {t.fastingDayModalCancel}
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 rounded-xl py-4 text-xs font-black text-[rgb(var(--color-primary-foreground))] transition-all active:scale-95 shadow-[var(--shadow-card)] bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))]"
                    >
                        {t.fastingDayModalSave}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
