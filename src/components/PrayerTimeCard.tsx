import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";

interface PrayerTimeCardProps {
    hijriDate: string;
    gregorianDate: string;
    prayerTimes: Record<string, string>;
    nextPrayer?: string;
}

export default function PrayerTimeCard({
    hijriDate,
    gregorianDate,
    prayerTimes,
    nextPrayer,
}: PrayerTimeCardProps) {
    const { t } = useLocale();

    // Only show formal prayer times + Imsak as a fasting reference
    const prayers: { key: string; label: string; isReference?: boolean }[] = [
        { key: "Imsak", label: t.prayerImsak, isReference: true },
        { key: "Fajr", label: t.prayerFajr },
        { key: "Dhuhr", label: t.prayerDhuhr },
        { key: "Asr", label: t.prayerAsr },
        { key: "Maghrib", label: t.prayerMaghrib },
        { key: "Isha", label: t.prayerIsha },
    ];

    return (
        <div className="w-full max-w-md rounded-2xl border border-white/5 bg-black/20 px-3 py-3 backdrop-blur-md shadow-lg">
            <div className="flex flex-col gap-1">
                {prayers.map(({ key, label, isReference }) => {
                    const isNext = key === nextPrayer;
                    const time = prayerTimes[key] || "--:--";

                    if (isReference) {
                        // Imsak: shown as muted reference, not highlighted even if "next"
                        return (
                            <div
                                key={key}
                                className="flex items-center justify-between rounded-xl px-3 py-1.5 border border-dashed border-white/5"
                            >
                                <span className="text-xs font-medium text-white/35 flex items-center gap-1.5">
                                    <span className="text-[9px] opacity-60">🌙</span>
                                    {label}
                                    <span className="text-[9px] text-white/20 font-normal">(imsak)</span>
                                </span>
                                <span className="text-xs font-semibold tabular-nums text-white/35">
                                    {time}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={key}
                            className={cn(
                                "flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-300",
                                isNext
                                    ? "bg-[rgb(var(--color-primary))]/20 ring-1 ring-[rgb(var(--color-primary))]/40 shadow-[0_0_12px_rgba(var(--color-primary),0.15)]"
                                    : "hover:bg-white/5"
                            )}
                        >
                            <span
                                className={cn(
                                    "text-sm font-medium",
                                    isNext ? "text-[rgb(var(--color-primary-light))] font-semibold" : "text-white/70"
                                )}
                            >
                                {label}
                            </span>
                            <span
                                className={cn(
                                    "text-sm font-bold tabular-nums",
                                    isNext ? "text-[rgb(var(--color-primary-light))]" : "text-white/90"
                                )}
                            >
                                {time}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
