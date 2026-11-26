"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Daily Prayer & Sunnah Tracker for Ramadhan
 * Tracks: fardhu prayer location (masjid/rumah) + sunnah prayer checklist
 */

import { useState, useMemo } from "react";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { useLocale } from "@/context/LocaleContext";
import { useRamadhanDailyLog, type DailyLogEntry, type PrayerKey, type SunnahKey } from "@/hooks/useRamadhanDailyLog";
import { MapPin, Home } from "@/components/ui/icons";
import { AppIcon } from "@/components/ui/AppIcon";
import type { AppIconName } from "@/lib/icon-names";

const FARDHU_PRAYERS: { key: PrayerKey; labelKey: "prayerFajr" | "prayerDhuhr" | "prayerAsr" | "prayerMaghrib" | "prayerIsha"; fieldTrue: string; fieldFalse: string }[] = [
    { key: "fajr",    labelKey: "prayerFajr",   fieldTrue: "fajrAtMasjid",    fieldFalse: "fajrAtMasjid" },
    { key: "dhuhr",   labelKey: "prayerDhuhr",  fieldTrue: "dhuhrAtMasjid",   fieldFalse: "dhuhrAtMasjid" },
    { key: "asr",     labelKey: "prayerAsr",   fieldTrue: "asrAtMasjid",     fieldFalse: "asrAtMasjid" },
    { key: "maghrib", labelKey: "prayerMaghrib", fieldTrue: "maghribAtMasjid", fieldFalse: "maghribAtMasjid" },
    { key: "isha",    labelKey: "prayerIsha",    fieldTrue: "ishaAtMasjid",    fieldFalse: "ishaAtMasjid" },
];

const SUNNAH_PRAYERS = [
    { key: "dhuha",       labelKey: "dailySunnahDhuha",          icon: "sun" },
    { key: "rawatibQabl", labelKey: "dailySunnahQabliyah",        icon: "mosque" },
    { key: "rawatibBad",  labelKey: "dailySunnahBadiyah",        icon: "mosque" },
    { key: "witir",       labelKey: "dailySunnahWitir",           icon: "moon" },
    { key: "istikharah",  labelKey: "dailySunnahIstikharah",      icon: "signpost" },
    { key: "hajat",       labelKey: "dailySunnahHajat",           icon: "dua" },
    { key: "taubat",      labelKey: "dailySunnahTaubat",          icon: "droplets" },
] as const;

const LOCATION_KEY_MAP: Record<PrayerKey, keyof Pick<DailyLogEntry, "fajrAtMasjid" | "dhuhrAtMasjid" | "asrAtMasjid" | "maghribAtMasjid" | "ishaAtMasjid">> = {
    fajr:    "fajrAtMasjid",
    dhuhr:   "dhuhrAtMasjid",
    asr:     "asrAtMasjid",
    maghrib: "maghribAtMasjid",
    isha:    "ishaAtMasjid",
};

export default function DailyPrayerTracker() {
    const { data } = usePrayerTimesContext();
    const { t } = useLocale();
    const hijriYear = parseInt(data?.hijriDate?.split(" ").pop()?.replace("H", "") ?? "1447", 10);
    const currentHijriDay = data?.hijriDay ?? 1;

    const [viewDay, setViewDay] = useState<number>(currentHijriDay);
    const { log, updateDay } = useRamadhanDailyLog(hijriYear);

    const dayKey = `${hijriYear}-${viewDay}`;
    const dayData = log[dayKey];

    const isFuture = viewDay > currentHijriDay;

    // Stats for the top bar
    const { totalMasjidDays, totalSunnahDone } = useMemo(() => {
        let masjid = 0, sunnah = 0;
        for (const entry of Object.values(log)) {
            if (!entry) continue;
            const atMasjid = [entry.fajrAtMasjid, entry.dhuhrAtMasjid, entry.asrAtMasjid, entry.maghribAtMasjid, entry.ishaAtMasjid]
                .filter(v => v === true).length;
            const total = [entry.fajrAtMasjid, entry.dhuhrAtMasjid, entry.asrAtMasjid, entry.maghribAtMasjid, entry.ishaAtMasjid]
                .filter(v => v !== null && v !== undefined).length;
            if (total > 0 && atMasjid > total / 2) masjid++;
            sunnah += [entry.dhuha, entry.rawatibQabl, entry.rawatibBad, entry.witir, entry.istikharah, entry.hajat, entry.taubat]
                .filter(Boolean).length;
        }
        return { totalMasjidDays: masjid, totalSunnahDone: sunnah };
    }, [log]);

    const handlePrayerLocation = (prayer: PrayerKey, atMasjid: boolean) => {
        if (isFuture) return;
        const field = LOCATION_KEY_MAP[prayer];
        const current = dayData?.[field];
        // Toggle: if already set to same value, clear it (set null)
        updateDay(viewDay, { [field]: current === atMasjid ? null : atMasjid });
    };

    const handleSunnah = (key: SunnahKey) => {
        if (isFuture) return;
        const current = dayData?.[key];
        updateDay(viewDay, { [key]: !current });
    };

    return (
        <div className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] shadow-[var(--shadow-card)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3">
                <div className="flex items-center gap-2">
                    <AppIcon name="mosque" size="sm" tone="primary" />
                    <div>
                        <h3 className="font-bold text-[rgb(var(--color-text-strong))] text-sm leading-tight">{t.dailyPrayerTitle}</h3>
                        <p className="text-xs text-[rgb(var(--color-text-muted))]">{t.dailyPrayerSubtitle}</p>
                    </div>
                </div>
                {/* Stats pills */}
                <div className="flex gap-1.5">
                    <div className="rounded-full px-2 py-0.5 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-xs text-[rgb(var(--color-text-muted))]">
                        <span className="text-[rgb(var(--color-primary-strong))]">{totalMasjidDays}</span>x {t.dailyPrayerMasjid}
                    </div>
                    <div className="rounded-full px-2 py-0.5 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-xs text-[rgb(var(--color-text-muted))]">
                        <span className="text-[rgb(var(--color-primary-strong))]">{totalSunnahDone}</span> {t.dailyPrayerSunnahCount}
                    </div>
                </div>
            </div>

            {/* Day Selector — show current ±3 days */}
            <div className="px-3 sm:px-4 mb-2 overflow-x-auto">
                <div className="flex gap-1.5 min-w-max">
                    {Array.from({ length: currentHijriDay }, (_, i) => i + 1).slice(-7).map(day => {
                        const isActive = day === viewDay;
                        const dKey = `${hijriYear}-${day}`;
                        const hasLog = log[dKey] && (
                            [log[dKey].fajrAtMasjid, log[dKey].dhuhrAtMasjid, log[dKey].asrAtMasjid, log[dKey].maghribAtMasjid, log[dKey].ishaAtMasjid].some(v => v !== null)
                            || [log[dKey].dhuha, log[dKey].rawatibQabl, log[dKey].rawatibBad, log[dKey].witir].some(Boolean)
                        );
                        return (
                            <button
                                key={day}
                                type="button"
                                aria-pressed={isActive}
                                aria-label={String(t.dailyPrayerDay).replace("{day}", String(day))}
                                onClick={() => setViewDay(day)}
                                className={`flex flex-col items-center rounded-xl px-3 py-1.5 border transition-all ${
                                    isActive ? "bg-[rgb(var(--color-primary))]/15 border-[rgb(var(--color-primary))]/40 scale-105" : "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-subtle))]"
                                }`}
                            >
                                <span className="text-xs text-[rgb(var(--color-text-muted))] font-bold">{day}</span>
                                {hasLog ? <AppIcon name="shield-check" size="xs" tone="success" /> : <span className="h-3" aria-hidden="true" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {isFuture ? (
                <div className="px-4 pb-4 text-center text-xs text-[rgb(var(--color-text-muted))] py-6">{t.dailyPrayerNotYet}</div>
            ) : (
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-3 border-t border-[rgb(var(--color-border))] pt-3">
                    <p className="text-xs font-bold text-[rgb(var(--color-text-muted))] text-center mb-1">
                        {String(t.dailyPrayerDayLocation).replace("{day}", String(viewDay))}
                    </p>

                    {/* Fardhu Prayer Location Grid */}
                    <div className="grid grid-cols-5 gap-1">
                        {FARDHU_PRAYERS.map(({ key, labelKey }) => {
                            const label = String(t[labelKey]);
                            const field = LOCATION_KEY_MAP[key] as keyof typeof dayData;
                            const val = dayData?.[field] as boolean | null | undefined;
                            return (
                                <div key={key} className="flex flex-col items-center gap-1">
                            <span className="text-xs text-[rgb(var(--color-text-muted))] font-semibold">{label}</span>
                                    {/* Masjid button */}
                                    <button
                                        type="button"
                                        aria-pressed={val === true}
                                        aria-label={String(t.dailyPrayerAtMasjid).replace("{prayer}", label)}
                                        onClick={() => handlePrayerLocation(key, true)}
                                        className={`w-full py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-0.5 transition-all active:scale-95 ${
                                            val === true
                                                ? "border-[rgb(var(--color-primary-light))]/50 bg-[rgb(var(--color-primary))]/25 text-[rgb(var(--color-primary-strong))]"
                                                : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-subtle))]"
                                        }`}
                                    >
                                        <MapPin className="w-2.5 h-2.5" aria-hidden="true" />
                                    </button>
                                    {/* Rumah button */}
                                    <button
                                        type="button"
                                        aria-pressed={val === false}
                                        aria-label={String(t.dailyPrayerAtHome).replace("{prayer}", label)}
                                        onClick={() => handlePrayerLocation(key, false)}
                                        className={`w-full py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-0.5 transition-all active:scale-95 ${
                                            val === false
                                                ? "border-[rgb(var(--color-warning))]/40 bg-[rgb(var(--color-warning))]/15 text-[rgb(var(--color-warning))]"
                                                : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-subtle))]"
                                        }`}
                                    >
                                        <Home className="w-2.5 h-2.5" aria-hidden="true" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 text-xs text-[rgb(var(--color-text-muted))]">
                        <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" aria-hidden="true" /> {t.dailyPrayerMasjid}</span>
                        <span className="flex items-center gap-1"><Home className="w-2.5 h-2.5" aria-hidden="true" /> {t.dailyPrayerHome}</span>
                    </div>

                    {/* Sunnah Section */}
                    <div className="border-t border-[rgb(var(--color-border))] pt-3">
                        <p className="text-xs font-bold text-[rgb(var(--color-text-muted))] text-center mb-2">
                            {t.dailyPrayerSunnahTitle}
                        </p>
                        <div className="grid grid-cols-4 gap-1.5">
                            {SUNNAH_PRAYERS.map(({ key, labelKey, icon }) => {
                                const isDone = Boolean(dayData?.[key as keyof typeof dayData]);
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        aria-pressed={isDone}
                                        onClick={() => handleSunnah(key)}
                                        className={`flex flex-col items-center justify-center rounded-xl py-2 border transition-all active:scale-95 ${
                                            isDone
                                                ? "border-[rgb(var(--color-success))]/40 bg-[rgb(var(--color-success))]/15 shadow-[var(--shadow-card)]"
                                                : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:bg-[rgb(var(--color-surface-subtle))]"
                                        }`}
                                    >
                                        <AppIcon name={icon as AppIconName} size="sm" tone={isDone ? "success" : "muted"} />
                                        <span className={`text-xs font-semibold mt-1 ${isDone ? "text-[rgb(var(--color-success))]" : "text-[rgb(var(--color-text-muted))]"}`}>
                                            {String(t[labelKey])}
                                        </span>
                                        {isDone && <AppIcon name="shield-check" size="xs" tone="success" className="mt-0.5" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
