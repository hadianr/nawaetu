import { useMemo } from "react";
import { Check, Snowflake } from "lucide-react";
import StreakFlame from "@/components/streak/StreakFlame";
import { AppIcon } from "@/components/ui/AppIcon";
import { useLocale } from "@/context/LocaleContext";
import { useStreakDates } from "@/hooks/useStreakDates";
import { cn } from "@/lib/utils";

/** The last seven days of the streak: counted, frozen (Hari Jeda), today and empty. One source for the dialog and the Home card. */
export default function StreakWeek({ compact = false }: { compact?: boolean }) {
    const { locale, t } = useLocale();
    const { activeDates, protectedDates } = useStreakDates();
    const week = useMemo(() => {
        const today = new Date();
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - index));
            const key = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
            return {
                key,
                label: new Intl.DateTimeFormat(locale, { weekday: compact ? "long" : "narrow" }).format(date),
                active: activeDates.has(key),
                protected: protectedDates.has(key),
                today: index === 6,
            };
        });
    }, [activeDates, compact, locale, protectedDates]);

    if (compact) {
        // One Lottie flame per card is enough (the done row has it), so the dots stay light.
        return (
            <ul className="flex items-center gap-2" aria-label={String(t.streakLastSevenDays)}>
                {week.map(day => (
                    <li key={day.key} className="flex size-4 items-center justify-center">
                        <span className="sr-only">
                            {day.label}
                            {day.protected ? `: ${String(t.streakProtectedDay)}` : day.active ? `: ${String(t.streakCompleted)}` : ""}
                        </span>
                        <span
                            aria-hidden="true"
                            className={cn(
                                "flex size-3.5 items-center justify-center rounded-full border",
                                day.protected
                                    ? "border-sky-400/60 bg-sky-500/15 text-sky-400"
                                    : day.active
                                        ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] text-[rgb(var(--color-accent-foreground))]"
                                        : "border-[rgb(var(--color-text-muted))]/60",
                                day.today && "outline outline-2 outline-offset-2 outline-[rgb(var(--color-text-muted))]",
                            )}
                        >
                            {day.protected
                                ? <Snowflake className="size-2.5" />
                                : day.active && <Check className="size-2.5" strokeWidth={4} />}
                        </span>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div className="grid grid-cols-7 gap-2" aria-label={String(t.streakLastSevenDays)}>
            {week.map((day) => (
                <div key={day.key} className="space-y-1 text-center">
                    <span className="text-[10px] font-semibold text-[rgb(var(--color-text-muted))]">{day.label}</span>
                    <span className={cn(
                        "flex aspect-square items-center justify-center rounded-full border text-xs",
                        day.protected
                            ? "border-sky-400/60 bg-sky-500/15 text-sky-400"
                            : day.active
                                ? "border-[rgb(var(--color-primary-light))] bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))]"
                                : day.today
                                    ? "border-[rgb(var(--color-accent))]"
                                    : "border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))]",
                    )}>
                        {day.protected
                            ? <Snowflake className="h-3.5 w-3.5" aria-label={String(t.streakProtectedDay)} />
                            : day.active
                                ? <StreakFlame className="size-8" fallbackClassName="h-3.5 w-3.5 text-[rgb(var(--color-primary-foreground))]" label={String(t.streakCompleted)} />
                                : <AppIcon name="target" size="xs" tone="muted" />}
                    </span>
                </div>
            ))}
        </div>
    );
}
