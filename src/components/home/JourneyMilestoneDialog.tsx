"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import LottieMoment from "@/components/ui/LottieMoment";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { getJourneyMilestone, JOURNEY_DAYS } from "@/lib/ramadhan-journey";

export default function JourneyMilestoneDialog({ daysLeft, dayNumber }: { daysLeft: number; dayNumber: number }) {
    const { t } = useLocale();
    const storage = getStorageService();
    const [milestone, setMilestone] = useState(() =>
        getJourneyMilestone(daysLeft, storage.getOptional<number[]>(STORAGE_KEYS.JOURNEY_MILESTONES_SEEN) ?? []),
    );
    if (milestone === null) return null;

    const close = () => {
        const seen = storage.getOptional<number[]>(STORAGE_KEYS.JOURNEY_MILESTONES_SEEN) ?? [];
        storage.set(STORAGE_KEYS.JOURNEY_MILESTONES_SEEN, [...seen, milestone]);
        setMilestone(null);
    };

    return (
        <Dialog open onOpenChange={open => { if (!open) close(); }}>
            <DialogContent showCloseButton={false} className="max-w-[min(24rem,calc(100%-2rem))] text-center">
                <LottieMoment
                    src="/lottie/lights.lottie"
                    className="mx-auto h-40 w-full"
                    fallback={<div className="h-40 w-full" />}
                />
                <DialogTitle className="text-xl text-[rgb(var(--color-text-strong))]">
                    {String(t.journeyDayOf).replace("{day}", String(dayNumber)).replace("{total}", String(JOURNEY_DAYS))}
                </DialogTitle>
                <DialogDescription className="text-[15px] text-[rgb(var(--color-text))]">
                    {String(t[`journeyMilestone${milestone}`])}
                </DialogDescription>
                <Button size="lg" className="w-full rounded-xl text-[rgb(var(--color-accent-foreground))]" onClick={close}>
                    {String(t.journeyMilestoneClose)}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
