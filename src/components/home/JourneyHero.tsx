import type { ReactNode } from "react";
import LottieMoment from "@/components/ui/LottieMoment";
import { useLocale } from "@/context/LocaleContext";

/** Gradient top of the journey dialogs, same family as the streak dialog: lanterns, big number, days to go. */
export default function JourneyHero({ title, daysLeft, sub }: { title: ReactNode; daysLeft: number; sub?: string }) {
    const { t } = useLocale();
    const days = String(daysLeft === 1 ? t.journeyDayLeftOne : t.journeyDaysLeft).replace("{days}", String(daysLeft));
    return (
        <div className="bg-gradient-to-br from-[rgb(var(--color-primary))] via-[rgb(var(--color-primary-light))] to-[rgb(var(--color-accent))] px-6 pb-5 pt-6 text-center text-[rgb(var(--color-primary-foreground))]">
            {/* Dark backing keeps the gold lanterns readable on every theme's gradient. */}
            <div className="mx-auto w-48 rounded-2xl bg-black/30">
                <LottieMoment src="/lottie/lights.lottie" className="h-24 w-full" fallback={<div className="h-24 w-full" />} />
            </div>
            <div className="mt-3 text-xs font-bold uppercase tracking-wider">{title}</div>
            <p className="mt-1 text-4xl font-black tabular-nums">{daysLeft}</p>
            <p className="text-sm font-bold">{days}</p>
            {sub && <p className="mt-0.5 text-xs opacity-90">{sub}</p>}
        </div>
    );
}
