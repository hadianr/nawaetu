"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedCheck from "@/components/ui/AnimatedCheck";
import { Button } from "@/components/ui/button";
import LottieMoment from "@/components/ui/LottieMoment";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { getStreakRepository } from "@/core/repositories/streak.repository";
import { useFastingTracker } from "@/hooks/useFastingTracker";
import { countRecommendedDays, getFastingGuide } from "@/lib/fasting-guide";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { DateUtils } from "@/lib/utils/date";

const fill = (template: unknown, values: Record<string, number>) =>
    Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), String(template));

/**
 * Owed fasts and today's fasting suggestion. Obligations first: qadha is offered before any voluntary fast,
 * and nothing here touches the streak unless the user says they made up a fast.
 */
export default function JourneyFasting({ adjustment, onVisible }: { adjustment: number; onVisible?: (visible: boolean) => void }) {
    const { t } = useLocale();
    const storage = getStorageService();
    const { allLogs, defaultMadzhab, getPendingQadha, markQadhaDone } = useFastingTracker();
    const today = DateUtils.today();
    const [skipped, setSkipped] = useState(() => storage.getOptional<string>(STORAGE_KEYS.JOURNEY_FAST_SKIP) === today);
    // `burst` replays the stars on each made-up fast; `cleared` is the one-time moment when the last one is done.
    const [burst, setBurst] = useState(0);
    const [cleared, setCleared] = useState(false);

    // Fidyah is paid, not fasted, so it is not a fast to make up here.
    const pending = getPendingQadha().filter(item => item.log.consequence !== "fidyah");
    const owed = pending.length;
    const total = useMemo(
        () => Object.values(allLogs).reduce(
            (sum, year) => sum + Object.values(year).filter(day => day.consequence === "qadha" || day.consequence === "choice").length,
            0,
        ),
        [allLogs],
    );
    const guide = getFastingGuide({ now: new Date(), adjustment, pendingQadha: owed, madzhab: defaultMadzhab });
    const slots = useMemo(() => (owed > 0 ? countRecommendedDays(new Date(), adjustment) : 0), [adjustment, owed]);

    const showSuggestion = !skipped && guide.today !== "none";
    const showReason = !skipped && guide.today === "none" && guide.reason !== null;
    const visible = cleared || owed > 0 || showSuggestion || showReason;
    useEffect(() => onVisible?.(visible), [onVisible, visible]);

    const madeUpOne = () => {
        const next = pending[0];
        if (!next) return;
        markQadhaDone(next.hijriYear, next.hijriDay);
        // A made-up fast is a real deed of the day, so it counts for the one streak like any mission.
        getStreakRepository().updateStreak();
        setBurst(count => count + 1);
        if (pending.length === 1) setCleared(true);
    };
    const notToday = () => {
        storage.set(STORAGE_KEYS.JOURNEY_FAST_SKIP, today);
        setSkipped(true);
    };

    if (cleared) {
        return (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                role="status"
                className="mt-3 flex items-center gap-2 rounded-xl bg-[rgb(var(--color-primary))]/15 px-3 py-2 text-sm text-[rgb(var(--color-text))]"
            >
                <LottieMoment
                    src="/lottie/lights.lottie"
                    className="size-14 shrink-0"
                    fallback={<AnimatedCheck className="size-6 shrink-0 text-[rgb(var(--color-primary))]" />}
                />
                {String(t.journeyQadhaCleared)}
            </motion.div>
        );
    }
    if (!visible) return null;

    const done = Math.max(0, total - pending.length);
    const timingCopy = guide.timing.includes("ayyamulBidh") ? t.journeyFastBidh : t.journeyFastMonThu;

    return (
        <div className="relative mt-3 rounded-xl border border-[rgb(var(--color-border))]/20 bg-[rgb(var(--color-surface-subtle))] p-3">
            {burst > 0 && (
                <LottieMoment
                    key={burst}
                    src="/lottie/stars.lottie"
                    hideOnComplete
                    className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-44 -translate-x-1/2 -translate-y-1/2"
                />
            )}
            {pending.length > 0 && (
                <div>
                    <p className="text-sm font-semibold text-[rgb(var(--color-text-strong))]">{fill(t.journeyQadhaOwed, { n: pending.length })}</p>
                    {total > 0 && (
                        <>
                            <div
                                className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgb(var(--color-text-muted))]/25"
                                role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}
                                aria-label={fill(t.journeyQadhaProgress, { done, total })}
                            >
                                <motion.div
                                    className="h-full rounded-full bg-[rgb(var(--color-primary))]"
                                    initial={false}
                                    animate={{ width: `${(done / total) * 100}%` }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                />
                            </div>
                            <p className="mt-1 text-xs text-[rgb(var(--color-text))]">{fill(t.journeyQadhaProgress, { done, total })}</p>
                        </>
                    )}
                    {slots > 0 && <p className="mt-1 text-xs text-[rgb(var(--color-text))]">{fill(t.journeyQadhaSlots, { n: slots })}</p>}
                </div>
            )}

            {showSuggestion && (
                <div className={pending.length > 0 ? "mt-3" : ""}>
                    {guide.today === "qadha" && <p className="text-sm font-medium text-[rgb(var(--color-text-strong))]">{String(t.journeyQadhaToday)}</p>}
                    <p className="text-xs text-[rgb(var(--color-text))]">{String(timingCopy)} {String(t.journeyFastEase)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        {guide.today === "qadha" && (
                            <Button size="sm" className="rounded-lg text-[rgb(var(--color-accent-foreground))]" onClick={madeUpOne}>
                                {String(t.journeyQadhaMarkDone)}
                            </Button>
                        )}
                        <button type="button" onClick={notToday} className="min-h-11 rounded-lg px-2 text-xs font-medium text-[rgb(var(--color-text))] underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]">
                            {String(t.journeyFastNotToday)}
                        </button>
                    </div>
                </div>
            )}

            {showReason && (
                <p className="text-xs text-[rgb(var(--color-text))]">
                    {String(guide.reason === "preRamadan" ? t.journeyFastPreRamadan : t.journeyFastAfterMidSyaban)}
                </p>
            )}

            {pending.length > 0 && (
                <Link href="/ramadhan" className="mt-2 inline-flex min-h-11 items-center text-xs font-medium text-[rgb(var(--color-primary-strong))] underline underline-offset-4">
                    {String(t.journeyQadhaOpen)}
                </Link>
            )}
        </div>
    );
}
