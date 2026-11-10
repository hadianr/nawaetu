"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import LottieMoment from "@/components/ui/LottieMoment";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { getJourneyMilestone, JOURNEY_DAYS } from "@/lib/ramadhan-journey";

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

    const title = mode === "welcome"
        ? String(t.journeyWelcomeTitle).replace("{day}", String(dayNumber))
        : String(t.journeyDayOf).replace("{day}", String(dayNumber)).replace("{total}", String(JOURNEY_DAYS));
    const message = mode === "welcome" ? String(t.journeyWelcomeBody) : String(t[`journeyMilestone${daysLeft}`]);
    const action = mode === "welcome" ? String(t.journeyWelcomeStart) : String(t.journeyMilestoneClose);

    return (
        <Dialog open onOpenChange={open => { if (!open) close(); }}>
            <DialogContent showCloseButton={false} className="max-w-[min(24rem,calc(100%-2rem))] text-center">
                <LottieMoment
                    src="/lottie/lights.lottie"
                    className="mx-auto h-40 w-full"
                    fallback={<div className="h-40 w-full" />}
                />
                <DialogTitle className="text-xl text-[rgb(var(--color-text-strong))]">{title}</DialogTitle>
                <DialogDescription className="text-[15px] text-[rgb(var(--color-text))]">{message}</DialogDescription>
                <Button size="lg" className="w-full rounded-xl text-[rgb(var(--color-accent-foreground))]" onClick={close}>
                    {action}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
