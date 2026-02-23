"use client";

import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { getRamadhanDay, getRamadhanProgress } from "@/data/ramadhan-data";
import { NIAT_PUASA_RAMADHAN, DALIL_PUASA, DALIL_10_DAYS_MERCY, DALIL_10_DAYS_FORGIVENESS, DALIL_10_DAYS_FREEDOM } from "@/data/ramadhan-data";
import NiatCard from "./NiatCard";
import DalilBadge from "./DalilBadge";
import { useLocale } from "@/context/LocaleContext";

export default function RamadhanHeroCard() {
    const { data } = usePrayerTimes();
    const { t, locale } = useLocale();

    const hijriDay = data?.hijriDay ?? 1;
    const hijriYear = parseInt(data?.hijriDate?.split(" ").pop()?.replace("H", "") ?? "1447", 10) || 1447;
    const ramadhanDay = getRamadhanDay(hijriDay) || 1;
    const progress = getRamadhanProgress(ramadhanDay) || 0;

    const today = new Date();
    const dayName = today.toLocaleDateString(locale === 'en' ? "en-US" : "id-ID", { weekday: "long" });
    const dateStr = today.toLocaleDateString(locale === 'en' ? "en-US" : "id-ID", { day: "numeric", month: "long", year: "numeric" });

    // Progressive opacity: semakin mendekati hari ke-30, semakin solid (0.5 to 1.0)
    let progressiveOpacity = 0.5 + (ramadhanDay / 30) * 0.5;
    if (isNaN(progressiveOpacity)) progressiveOpacity = 0.5;

    let borderOpacity = 0.4 + (ramadhanDay / 30) * 0.3; // 0.4 to 0.7
    if (isNaN(borderOpacity)) borderOpacity = 0.4;

    // Determine which period and its dalil
    const periodData = ramadhanDay <= 10
        ? { text: t.ramadhanPeriod1, dalil: DALIL_10_DAYS_MERCY }
        : ramadhanDay <= 20
            ? { text: t.ramadhanPeriod2, dalil: DALIL_10_DAYS_FORGIVENESS }
            : { text: t.ramadhanPeriod3, dalil: DALIL_10_DAYS_FREEDOM };

    return (
        <div
            className="relative w-full rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl"
            style={{
                contain: "layout style paint",
                border: `1px solid color-mix(in srgb, var(--color-primary-light) 30%, transparent)`,
                background: `
                    linear-gradient(135deg, 
                        color-mix(in srgb, var(--color-primary) ${ramadhanDay <= 10 ? '40%' : ramadhanDay <= 20 ? '50%' : '60%'}, transparent) 0%,
                        color-mix(in srgb, var(--color-primary-dark) ${ramadhanDay <= 10 ? '15%' : ramadhanDay <= 20 ? '25%' : '35%'}, transparent) 40%,
                        rgba(0, 0, 0, 0.6) 100%
                    ),
                    radial-gradient(circle at top right, color-mix(in srgb, var(--color-primary-light) ${ramadhanDay <= 10 ? '20%' : ramadhanDay <= 20 ? '30%' : '40%'}, transparent) 0%, transparent 60%)
                `,
                boxShadow: `
                    0 0 40px color-mix(in srgb, var(--color-primary) 20%, transparent),
                    0 10px 30px rgba(0, 0, 0, 0.5)
                `
            }}
        >
            {/* Strong glow overlay for prominence - optimized */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    opacity: 0.3 * progressiveOpacity,
                    willChange: "opacity",
                    background: `
                        radial-gradient(ellipse at top left, color-mix(in srgb, var(--color-primary-light) 40%, transparent) 0%, transparent 50%),
                        radial-gradient(ellipse at bottom right, color-mix(in srgb, var(--color-primary) 30%, transparent) 0%, transparent 50%),
                        radial-gradient(circle at center, color-mix(in srgb, var(--color-primary) 15%, transparent) 0%, transparent 70%)
                    `
                }}
            />

            {/* Enhanced animated border glow - GPU accelerated */}
            <div
                className="absolute inset-0 rounded-2xl pointer-events-none animate-gradient-shift"
                style={{
                    willChange: "background-position",
                    transform: "translate3d(0, 0, 0)",
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--color-primary-light) 30%, transparent), color-mix(in srgb, var(--color-primary) 20%, transparent), color-mix(in srgb, var(--color-primary-light) 30%, transparent))",
                    backgroundSize: "300% 300%",
                    mixBlendMode: "overlay"
                }}
            />

            {/* Decorative moon glow — optimized with transform3d */}
            <div
                className="absolute -top-12 -right-12 h-48 w-48 rounded-full blur-3xl pointer-events-none animate-pulse-glow"
                style={{
                    willChange: "transform, opacity",
                    transform: "translate3d(0, 0, 0)",
                    backgroundColor: `color-mix(in srgb, var(--color-primary-light) ${Math.round(25 * progressiveOpacity)}%, transparent)`
                }}
            />
            <div
                className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full blur-3xl pointer-events-none animate-pulse-glow-delayed"
                style={{
                    willChange: "transform, opacity",
                    transform: "translate3d(0, 0, 0)",
                    backgroundColor: `color-mix(in srgb, var(--color-primary) ${Math.round(22 * progressiveOpacity)}%, transparent)`,
                    animation: "pulse-glow 3s ease-in-out infinite 1.5s"
                }}
            />

            {/* Top border accent - progressive and GPU accelerated */}
            <div
                className="absolute top-0 left-0 right-0 h-0.5 pointer-events-none"
                style={{
                    willChange: "opacity",
                    background: `linear-gradient(90deg, 
                        transparent 0%, 
                        color-mix(in srgb, var(--color-primary-light) ${Math.round(70 * progressiveOpacity)}%, transparent) 20%, 
                        color-mix(in srgb, var(--color-primary) ${Math.round(70 * progressiveOpacity)}%, transparent) 50%, 
                        color-mix(in srgb, var(--color-primary-light) ${Math.round(70 * progressiveOpacity)}%, transparent) 80%, 
                        transparent 100%
                    )`,
                    boxShadow: `0 0 20px color-mix(in srgb, var(--color-primary) ${Math.round(50 * progressiveOpacity)}%, transparent), 0 0 40px color-mix(in srgb, var(--color-primary-light) ${Math.round(30 * progressiveOpacity)}%, transparent)`
                }}
            />

            {/* Shimmer effect - desktop only for mobile performance */}
            <div
                className="absolute inset-0 pointer-events-none hidden md:block animate-shimmer"
                style={{
                    willChange: "background-position",
                    transform: "translate3d(0, 0, 0)",
                    opacity: 0.2 * progressiveOpacity,
                    background: "linear-gradient(110deg, transparent 25%, color-mix(in srgb, var(--color-primary-light) 50%, transparent) 50%, transparent 75%)",
                    backgroundSize: "200% 100%"
                }}
            />

            <div className="relative px-3 pt-3 pb-3 sm:px-5 sm:pt-5 sm:pb-4">
                {/* Top row */}
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                            <span className="text-xl sm:text-2xl">🌙</span>
                            <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider sm:tracking-widest text-white/70">
                                {data?.hijriDate ? `${data.hijriDay} ${data.hijriMonth} ${hijriYear}H` : `${t.ramadhanLabel} ${hijriYear}H`}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white leading-none">
                            {t.ramadhanDay}<span style={{ color: "rgb(var(--color-primary-light))" }}>{ramadhanDay}</span>
                        </h1>
                        <p
                            className="text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium"
                            style={{
                                color: `color-mix(in srgb, white ${Math.round((0.4 + (progressiveOpacity * 0.3)) * 100)}%, transparent)`,
                                textShadow: `0 0 ${10 + ramadhanDay}px color-mix(in srgb, var(--color-primary-light) ${Math.round(30 * progressiveOpacity)}%, transparent)`,
                                transition: "color 0.3s ease, text-shadow 0.3s ease"
                            }}
                        >
                            {dayName}, {dateStr}
                        </p>
                    </div>
                    <DalilBadge dalil={DALIL_PUASA} variant="pill" />
                </div>

                {/* Progress bar */}
                <div className="mb-3 sm:mb-4">
                    <div className="flex justify-between text-[10px] sm:text-xs text-white/40 mb-1">
                        <span>{t.ramadhanDay1}</span>
                        <span className="font-medium" style={{ color: "rgba(var(--color-primary-light), 0.8)" }}>{progress}% {t.ramadhanCompleted}</span>
                        <span>{t.ramadhanDay30}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${progress}%`, background: `linear-gradient(to right, rgb(var(--color-primary-dark)), rgb(var(--color-primary)), rgb(var(--color-primary-light)))` }}
                        />
                    </div>
                    {/* Day markers */}
                    <div className="flex mt-1.5 gap-0.5">
                        {Array.from({ length: 30 }, (_, i) => (
                            <div
                                key={i}
                                className="flex-1 h-1 rounded-full transition-all bg-white/10"
                                style={i < ramadhanDay ? { backgroundColor: "rgba(var(--color-primary-light), 0.6)" } : undefined}
                            />
                        ))}
                    </div>
                </div>

                {/* Motivational text */}
                <div className="rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/20 px-3 py-2 mb-2 sm:px-4 sm:py-3 sm:mb-3 backdrop-blur-md shadow-lg">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] sm:text-xs text-white leading-relaxed font-bold drop-shadow-sm">
                            {periodData.text}
                        </p>
                        <DalilBadge dalil={periodData.dalil} variant="pill" />
                    </div>
                </div>

                {/* Niat Puasa Button */}
                <NiatCard niat={NIAT_PUASA_RAMADHAN} variant="pill" />
            </div>
        </div>
    );
}
