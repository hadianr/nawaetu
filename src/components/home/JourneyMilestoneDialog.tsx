"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import JourneyHero from "@/components/home/JourneyHero";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { RAMADHAN_PAGE_ENABLED } from "@/lib/features";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { getJourneyMilestone, JOURNEY_DAYS } from "@/lib/ramadhan-journey";

/** Milestone and welcome moments, in the same style as the About and streak dialogs. */
export default function JourneyMilestoneDialog({ daysLeft, dayNumber, hadStreak = false }: { daysLeft: number; dayNumber: number; hadStreak?: boolean }) {
    const { t } = useLocale();
    const storage = getStorageService();
    const [mode, setMode] = useState<"milestone" | "welcome" | null>(() => {
        const seen = storage.getOptional<number[]>(STORAGE_KEYS.JOURNEY_MILESTONES_SEEN) ?? [];
        if (getJourneyMilestone(daysLeft, seen) !== null) return "milestone";
        const welcomed = storage.getOptional<boolean>(STORAGE_KEYS.JOURNEY_WELCOME_SEEN) === true;
        // People who already have a streak don't need a welcome.
        return welcomed || hadStreak || seen.length > 0 ? null : "welcome";
    });
    if (mode === null) return null;

    const close = () => {
        if (mode === "milestone") {
            const seen = storage.getOptional<number[]>(STORAGE_KEYS.JOURNEY_MILESTONES_SEEN) ?? [];
            storage.set(STORAGE_KEYS.JOURNEY_MILESTONES_SEEN, [...seen, daysLeft]);
        }
        storage.set(STORAGE_KEYS.JOURNEY_WELCOME_SEEN, true);
        setMode(null);
    };

    const dayOf = String(t.journeyDayOf).replace("{day}", String(dayNumber)).replace("{total}", String(JOURNEY_DAYS));
    const title = mode === "welcome" ? String(t.journeyWelcomeTitle).replace("{day}", String(dayNumber)) : dayOf;
    const message = mode === "welcome" ? String(t.journeyWelcomeBody) : String(t[`journeyMilestone${daysLeft}`]);
    const action = mode === "welcome" ? String(t.journeyWelcomeStart) : String(t.journeyMilestoneClose);

    return (
        <Dialog open onOpenChange={open => { if (!open) close(); }}>
            <DialogContent
                showCloseButton={false}
                className="max-h-[calc(100dvh-7rem)] max-w-[min(24rem,calc(100%-2rem))] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-surface))] p-0 text-center text-[rgb(var(--color-text-strong))] motion-reduce:animate-none"
            >
                <JourneyHero title={String(t.journeyTitle)} daysLeft={daysLeft} />
                <div className="space-y-4 overflow-y-auto p-5">
                    <div className="space-y-2">
                        <DialogTitle className="text-xl text-[rgb(var(--color-text-strong))]">{title}</DialogTitle>
                        <DialogDescription className="text-[15px] leading-relaxed text-[rgb(var(--color-text))]">{message}</DialogDescription>
                    </div>

                    {/* How far along, as a bar: the day count is already in the title, so no second number. */}
                    <Progress
                        value={(dayNumber / JOURNEY_DAYS) * 100}
                        className="h-2 bg-[rgb(var(--color-text-muted))]/25"
                        aria-label={dayOf}
                    />

                    {/* The make-up list lives on the Ramadan page, so there is nowhere to send the user while that page is off. */}
                    {mode === "welcome" && RAMADHAN_PAGE_ENABLED && (
                        <Link
                            href="/ramadhan"
                            onClick={close}
                            className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-primary))]/5 px-4 text-left text-sm font-medium text-[rgb(var(--color-text-strong))] outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                        >
                            {String(t.journeyWelcomeQadha)}
                            <ChevronRight className="size-4 shrink-0 text-[rgb(var(--color-text-muted))]" aria-hidden="true" />
                        </Link>
                    )}

                    <Button size="lg" className="w-full rounded-xl text-[rgb(var(--color-accent-foreground))]" onClick={close}>
                        {action}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
