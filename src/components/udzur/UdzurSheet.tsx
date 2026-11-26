/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AppIcon } from "@/components/ui/AppIcon";
import { Check } from "@/components/ui/icons";
import LottieMoment from "@/components/ui/LottieMoment";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { UDZUR_MAX_BACKDATE_DAYS, UdzurInputError, type UdzurKind } from "@/lib/udzur";
import type { UdzurState } from "@/hooks/useUdzur";
import type { Madzhab } from "@/data/fasting/types";
import type { AppIconName } from "@/lib/icon-names";
import { cn } from "@/lib/utils";

const pad = (value: number) => String(value).padStart(2, "0");
/** The value a datetime-local input expects, in local time. */
const toInputValue = (date: Date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const ERROR_KEYS = {
    in_future: "udzurErrorInFuture",
    too_far_back: "udzurErrorTooFarBack",
    overlaps: "udzurErrorOverlaps",
    before_start: "udzurErrorBeforeStart",
} as const;

const COMBINE_KEYS: Record<Madzhab, "udzurCombineJumhur" | "udzurCombineHanafi" | "udzurCombineMaliki"> = {
    syafii: "udzurCombineJumhur",
    hanbali: "udzurCombineJumhur",
    hanafi: "udzurCombineHanafi",
    maliki: "udzurCombineMaliki",
};

function Note({ icon, children }: { icon: AppIconName; children: ReactNode }) {
    return (
        <li className="flex items-start gap-2.5 text-sm leading-relaxed text-[rgb(var(--color-text))]">
            <AppIcon name={icon} size="sm" tone="primary" className="mt-0.5 shrink-0" />
            <span>{children}</span>
        </li>
    );
}

interface UdzurSheetProps {
    udzur: UdzurState;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Called once the mode was turned on. */
    onStarted?: () => void;
}

/** Start or end udzur mode. Which one follows from whether a period is active. */
export default function UdzurSheet({ udzur, open, onOpenChange, onStarted }: UdzurSheetProps) {
    const { t } = useLocale();
    const inputId = useId();
    const [kind, setKind] = useState<UdzurKind>("haid");
    const [when, setWhen] = useState(() => toInputValue(new Date()));
    const [keepAlerts, setKeepAlerts] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // After ending: the checklist, with one celebratory moment.
    const [ended, setEnded] = useState(false);

    const ending = Boolean(udzur.active) || ended;
    const now = new Date();
    const min = ending && udzur.active
        ? toInputValue(new Date(udzur.active.startedAt))
        : toInputValue(new Date(now.getTime() - UDZUR_MAX_BACKDATE_DAYS * 86_400_000));
    const madzhab = getStorageService().getOptional<Madzhab>(STORAGE_KEYS.RAMADHAN_FASTING_MADZHAB);

    const handleOpenChange = (next: boolean) => {
        if (next) {
            setWhen(toInputValue(new Date()));
            setError(null);
            setEnded(false);
        }
        onOpenChange(next);
    };

    const fail = (cause: unknown) => {
        const code = cause instanceof UdzurInputError ? cause.code : null;
        setError(t[code && code in ERROR_KEYS ? ERROR_KEYS[code as keyof typeof ERROR_KEYS] : "udzurErrorGeneric"]);
    };

    const submit = () => {
        const date = new Date(when);
        if (Number.isNaN(date.getTime())) return setError(t.udzurErrorGeneric);
        try {
            if (udzur.active) {
                udzur.end(date);
                setEnded(true);
                toast.success(t.udzurEndedToast);
            } else {
                udzur.start(kind, date, { keepAlerts });
                toast.success(t.udzurStartedToast);
                onOpenChange(false);
                onStarted?.();
            }
            setError(null);
        } catch (cause) {
            fail(cause);
        }
    };

    const removeActive = () => {
        if (!udzur.active) return;
        udzur.remove(udzur.active.id);
        toast.info(t.udzurDeletedToast);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                closeLabel={t.udzurClose}
                className="max-h-[90dvh] overflow-y-auto border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))]"
            >
                {ended ? (
                    <>
                        <DialogHeader className="items-center text-center sm:text-center">
                            <LottieMoment
                                src="/lottie/stars.lottie"
                                hideOnComplete
                                quietLoad
                                className="pointer-events-none h-16 w-32"
                                fallback={<AppIcon name="sparkles" size="xl" tone="primary" />}
                            />
                            <DialogTitle className="text-lg font-bold text-[rgb(var(--color-text-strong))]">{t.udzurEndTitle}</DialogTitle>
                            <DialogDescription className="text-sm text-[rgb(var(--color-text-muted))]">{t.udzurEndChecklistTitle}</DialogDescription>
                        </DialogHeader>
                        <ul className="space-y-3">
                            <Note icon="shower-head">{t.udzurGhusl}</Note>
                            <Note icon="mosque">{t.udzurCurrentDue}</Note>
                            <Note icon="scale">{t[madzhab && madzhab in COMBINE_KEYS ? COMBINE_KEYS[madzhab] : "udzurCombineUnset"]}</Note>
                            <Note icon="droplets">{t.udzurDischargeNote}</Note>
                        </ul>
                        <Button className="min-h-11 w-full" onClick={() => onOpenChange(false)}>{t.udzurClose}</Button>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2.5 pr-12">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--color-primary))]/10">
                                    <AppIcon name="flower" size="md" tone="primary" />
                                </span>
                                <DialogTitle className="text-left text-lg font-bold text-[rgb(var(--color-text-strong))]">
                                    {ending ? t.udzurEndButton : t.udzurStartTitle}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-left text-sm leading-relaxed text-[rgb(var(--color-text))]">
                                {ending ? t.udzurDischargeNote : t.udzurStartDesc}
                            </DialogDescription>
                        </DialogHeader>

                        {!ending && (
                            <fieldset>
                                <legend className="mb-2 text-xs font-bold text-[rgb(var(--color-text-muted))]">{t.udzurKindLabel}</legend>
                                <div className="grid grid-cols-2 gap-2" role="radiogroup">
                                    {(["haid", "nifas"] as const).map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            role="radio"
                                            aria-checked={kind === option}
                                            onClick={() => setKind(option)}
                                            className={cn(
                                                "flex min-h-11 items-center justify-center gap-1.5 rounded-[var(--radius-control)] border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-surface))]",
                                                // Solid fill and a check, so the choice reads in every theme and not by colour alone.
                                                kind === option
                                                    ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] shadow-[var(--shadow-card)]"
                                                    : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-primary))]/10",
                                            )}
                                        >
                                            {kind === option && <Check className="size-4 shrink-0" aria-hidden="true" />}
                                            {option === "haid" ? t.udzurKindHaid : t.udzurKindNifas}
                                        </button>
                                    ))}
                                </div>
                            </fieldset>
                        )}

                        <div>
                            <label htmlFor={inputId} className="mb-2 block text-xs font-bold text-[rgb(var(--color-text-muted))]">
                                {ending ? t.udzurEndedLabel : t.udzurStartedLabel}
                            </label>
                            <input
                                id={inputId}
                                type="datetime-local"
                                value={when}
                                min={min}
                                max={toInputValue(now)}
                                onChange={(event) => setWhen(event.target.value)}
                                className="min-h-11 w-full rounded-[var(--radius-control)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] px-3 text-sm text-[rgb(var(--color-text-strong))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-ring))]"
                            />
                            {error && <p role="alert" className="mt-2 text-xs font-semibold text-[rgb(var(--color-danger))]">{error}</p>}
                        </div>

                        {!ending && (
                            <>
                                <ul className="space-y-2.5 rounded-[var(--radius-card)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] p-3">
                                    <Note icon="heart-handshake">{t.udzurReassurance}</Note>
                                    <Note icon="clock">{t.udzurCurrentPrayerNote}</Note>
                                    <Note icon="warning">{t.udzurIstihadahNote}</Note>
                                    <Note icon="lock">{t.udzurPrivacyNote}</Note>
                                </ul>
                                <div className="flex min-h-11 items-center justify-between gap-3 text-sm">
                                    <label htmlFor={`${inputId}-alerts`}>{t.udzurKeepAlerts}</label>
                                    <Switch id={`${inputId}-alerts`} checked={keepAlerts} onCheckedChange={setKeepAlerts} />
                                </div>
                            </>
                        )}

                        <Button className="min-h-11 w-full" onClick={submit}>
                            {ending ? t.udzurEndConfirm : t.udzurStartButton}
                        </Button>

                        <div className="flex flex-col items-center gap-1">
                            <Link
                                href="/hadith?topic=women"
                                onClick={() => onOpenChange(false)}
                                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[rgb(var(--color-primary-strong))] underline-offset-4 hover:underline"
                            >
                                <AppIcon name="book-heart" size="sm" tone="primary" />
                                {t.udzurLearnLink}
                            </Link>
                            {ending && (
                                <Button variant="ghost" size="sm" className="min-h-11 text-[rgb(var(--color-text-muted))]" onClick={removeActive}>
                                    {t.udzurDelete}
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
