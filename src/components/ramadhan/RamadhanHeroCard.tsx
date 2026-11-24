"use client";

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

import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { useEffect, useState } from "react";
import { getRamadhanDay, getRamadhanProgress } from "@/data/ramadhan";
import { RAMADHAN_FASTING_INTENTION, FASTING_EVIDENCE, FIRST_10_DAYS_MERCY_EVIDENCE, MIDDLE_10_DAYS_FORGIVENESS_EVIDENCE, LAST_10_DAYS_FREEDOM_EVIDENCE } from "@/data/ramadhan";
import IntentionCard from "./IntentionCard";
import DalilBadge from "./DalilBadge";
import { useLocale } from "@/context/LocaleContext";
import { AppIcon } from "@/components/ui/AppIcon";

export default function RamadhanHeroCard() {
    const { data } = usePrayerTimesContext();
    const { t, locale } = useLocale();

    const hijriDay = data?.hijriDay ?? 1;
    const hijriYear = parseInt(data?.hijriDate?.split(" ").pop()?.replace("H", "") ?? "1447", 10) || 1447;
    const ramadhanDay = getRamadhanDay(hijriDay) || 1;
    const progress = getRamadhanProgress(ramadhanDay) || 0;

    const [today, setToday] = useState<Date | null>(null);
    useEffect(() => {
        queueMicrotask(() => setToday(new Date()));
    }, []);
    const dayName = today?.toLocaleDateString(locale === 'en' ? "en-US" : "id-ID", { weekday: "long" }) ?? "";
    const dateStr = today?.toLocaleDateString(locale === 'en' ? "en-US" : "id-ID", { day: "numeric", month: "long", year: "numeric" }) ?? "";

    // The tint deepens with each 10-day period: mercy, forgiveness, freedom from the Fire.
    const periodTint = ramadhanDay <= 10 ? 0.06 : ramadhanDay <= 20 ? 0.1 : 0.14;

    // Determine which period and its dalil
    const periodData = ramadhanDay <= 10
        ? { text: t.ramadhanPeriod1, dalil: FIRST_10_DAYS_MERCY_EVIDENCE }
        : ramadhanDay <= 20
            ? { text: t.ramadhanPeriod2, dalil: MIDDLE_10_DAYS_FORGIVENESS_EVIDENCE }
            : { text: t.ramadhanPeriod3, dalil: LAST_10_DAYS_FREEDOM_EVIDENCE };

    return (
        <div
            className="relative w-full rounded-2xl overflow-hidden border border-[rgb(var(--color-primary)/0.3)] shadow-[var(--shadow-card)]"
            style={{
                background: `linear-gradient(rgb(var(--color-primary) / ${periodTint}), rgb(var(--color-primary) / ${periodTint})), rgb(var(--color-surface))`,
            }}
        >
            <div className="relative px-3 pt-3 pb-3 sm:px-5 sm:pt-5 sm:pb-4">
                {/* Top row */}
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                            <AppIcon name="moon" size="md" tone="primary" />
                            <span className="text-xs sm:text-xs font-semibold uppercase tracking-wider sm:tracking-wider text-[rgb(var(--color-text-muted))]">
                                {data?.hijriDate ? `${data.hijriDay} ${data.hijriMonth} ${hijriYear}H` : `${t.ramadhanLabel} ${hijriYear}H`}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--color-text-strong))] leading-none">
                            {t.ramadhanDay}<span style={{ color: "rgb(var(--color-primary-strong))" }}>{ramadhanDay}</span>
                        </h1>
                        <p
                            className="text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium text-[rgb(var(--color-text-muted))]"
                        >
                            {dayName}, {dateStr}
                        </p>
                    </div>
                    <DalilBadge dalil={FASTING_EVIDENCE} variant="pill" />
                </div>

                {/* Progress bar */}
                <div className="mb-3 sm:mb-4">
                    <div className="flex justify-between text-xs sm:text-xs text-[rgb(var(--color-text-muted))] mb-1">
                        <span>{t.ramadhanDay1}</span>
                        <span className="font-medium" style={{ color: "rgb(var(--color-primary-strong))" }}>{progress}% {t.ramadhanCompleted}</span>
                        <span>{t.ramadhanDay30}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[rgb(var(--color-surface-subtle))] overflow-hidden">
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
                                className="flex-1 h-1 rounded-full transition-all bg-[rgb(var(--color-surface-subtle))]"
                                style={i < ramadhanDay ? { backgroundColor: "rgb(var(--color-primary-light) / 0.6)" } : undefined}
                            />
                        ))}
                    </div>
                </div>

                {/* Motivational text */}
                <div className="rounded-xl bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))] px-3 py-2 mb-2 sm:px-4 sm:py-3 sm:mb-3 shadow-[var(--shadow-card)]">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs sm:text-xs text-[rgb(var(--color-text-strong))] leading-relaxed font-bold">
                            {periodData.text}
                        </p>
                        <DalilBadge dalil={periodData.dalil} variant="pill" />
                    </div>
                </div>

                {/* Fasting Intention Card */}
                <IntentionCard intention={RAMADHAN_FASTING_INTENTION} variant="pill" />
            </div>
        </div>
    );
}
