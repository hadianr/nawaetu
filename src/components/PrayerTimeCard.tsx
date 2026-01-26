import { cn } from "@/lib/utils";

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
    const prayers = [
        { key: "Imsak", label: "Imsak" },
        { key: "Fajr", label: "Subuh" },
        { key: "Sunrise", label: "Terbit" }, // Distinct
        { key: "Dhuhr", label: "Dzuhur" },
        { key: "Asr", label: "Ashar" },
        { key: "Maghrib", label: "Maghrib" },
        { key: "Isha", label: "Isya" },
    ];

    return (
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg shadow-xl">

            <div className="space-y-3">
                {prayers.map(({ key, label }) => {
                    const isNext = key === nextPrayer;
                    const time = prayerTimes[key] || "--:--";
                    const isSunrise = key === "Sunrise";

                    return (
                        <div
                            key={key}
                            className={cn(
                                "flex items-center justify-between rounded-xl p-4 transition-all duration-300",
                                isNext
                                    ? "bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/50 scale-[1.02]"
                                    : isSunrise
                                        ? "bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/10"
                                        : "bg-white/5 hover:bg-white/10"
                            )}
                        >
                            <span
                                className={cn(
                                    "font-medium",
                                    isNext ? "text-emerald-400" : isSunrise ? "text-yellow-200/70" : "text-white/80"
                                )}
                            >
                                {label}
                            </span>
                            <span
                                className={cn(
                                    "text-lg font-bold tabular-nums",
                                    isNext ? "text-emerald-400" : isSunrise ? "text-yellow-100/90" : "text-white"
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
