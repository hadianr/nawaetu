"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * FastingTrackerWidget — Main entry-point for the Ramadan Fasting Tracker.
 * UX improvements:
 * - Short tab labels (no wrapping on iPhone SE)
 * - Removed redundant header badge (only the tab badge remains)
 * - Pill-style active tab indicator instead of underline
 * - Tighter vertical spacing
 */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { useTranslations } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { useFastingTracker } from "@/hooks/useFastingTracker";
import FastingCalendar from "./FastingCalendar";
import FastingStats from "./FastingStats";
import QadhaTracker from "./QadhaTracker";
import type { FastingStatus, Madzhab } from "@/data/fasting/types";

function buildYearRange(currentYear: number): number[] {
    const years: number[] = [];
    for (let y = currentYear - 2; y <= currentYear; y++) {
        years.push(y);
    }
    return years;
}

type TabId = "calendar" | "stats" | "qadha";

export default function FastingTrackerWidget() {
    const { data: session } = useSession();
    const { data: prayerData } = usePrayerTimesContext();
    const t = useTranslations() as any;

    const hijriDateStr = prayerData?.hijriDate ?? "";
    const hijriYearStr = hijriDateStr.split(" ").pop()?.replace("H", "") ?? "1447";
    const currentHijriYear = parseInt(hijriYearStr, 10) || 1447;
    const currentHijriDay = prayerData?.hijriDay ?? 1;

    const [selectedYear, setSelectedYear] = useState<number>(currentHijriYear);
    const [activeTab, setActiveTab] = useState<TabId>("calendar");
    const [gender, setGender] = useState<"male" | "female" | null>(null);

    useEffect(() => { setSelectedYear(currentHijriYear); }, [currentHijriYear]);

    useEffect(() => {
        const sessionGender = (session?.user as any)?.gender as string | undefined;
        if (sessionGender === "male" || sessionGender === "female") { setGender(sessionGender); return; }
        const storage = getStorageService();
        const stored = storage.getOptional<string>(STORAGE_KEYS.USER_GENDER as any);
        if (stored === "male" || stored === "female") setGender(stored as "male" | "female");
    }, [session?.user]);

    const availableYears = buildYearRange(currentHijriYear);
    const { getYearLog, getStats, getPendingQadha, defaultMadzhab, logDay, markQadhaDone } = useFastingTracker();

    const yearLog = getYearLog(selectedYear);
    const stats = getStats(selectedYear);
    const pendingQadha = getPendingQadha();

    const handleLogDay = (hijriYear: number, hijriDay: number, status: FastingStatus, madzhab?: Madzhab | null, note?: string) => {
        logDay(hijriYear, hijriDay, status, madzhab, note);
    };

    // Short labels — won't wrap on iPhone SE
    const tabs: Array<{ id: TabId; icon: string; label: string; badge?: number }> = [
        { id: "calendar", icon: "📅", label: t.fastingTabCalendar || "Calendar" },
        { id: "stats", icon: "📊", label: t.fastingTabStats || "Summary" },
        {
            id: "qadha", icon: "⌛", label: t.fastingTabQadha || "Qadha",
            badge: pendingQadha.length > 0 ? pendingQadha.length : undefined
        },
    ];

    return (
        <div className="rounded-3xl border border-white/10 overflow-hidden" style={{ background: "rgb(13,13,20)" }}>

            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/8">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{
                        background: "linear-gradient(135deg, rgba(var(--color-primary), 0.25), rgba(var(--color-primary), 0.08))",
                        border: "1px solid rgba(var(--color-primary), 0.25)",
                    }}
                >
                    🌙
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-[15px] leading-tight">{t.fastingTitle}</h3>
                    <p className="text-[11px] text-white/40 mt-0.5">{t.fastingSubtitle}</p>
                </div>
                {/* Stats pill — quick year context */}
                <div className="text-right shrink-0">
                    <p className="text-[10px] text-white/30">{stats.totalFasting}/30</p>
                    <p className="text-[10px] font-semibold text-[rgb(var(--color-primary-light,var(--color-primary)))]">
                        {Math.round((stats.totalFasting / 30) * 100)}%
                    </p>
                </div>
            </div>

            {/* ── Tabs — short single-line labels ── */}
            <div className="flex px-3 pt-2.5 pb-0 gap-1">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 ${isActive ? "text-white" : "text-white/35 hover:text-white/60"
                                }`}
                            style={
                                isActive
                                    ? {
                                        background: "rgba(var(--color-primary), 0.18)",
                                        boxShadow: "0 1px 0 0 rgb(var(--color-primary)) inset",
                                    }
                                    : undefined
                            }
                        >
                            <span className="text-base leading-none">{tab.icon}</span>
                            <span className="truncate">{tab.label}</span>
                            {tab.badge !== undefined && (
                                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[8px] font-black flex items-center justify-center leading-none">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab content ── */}
            <div className="px-3 pt-2.5 pb-4">
                {activeTab === "calendar" && (
                    <FastingCalendar
                        hijriYear={currentHijriYear}
                        hijriDay={currentHijriDay}
                        yearLog={yearLog}
                        defaultMadzhab={defaultMadzhab}
                        gender={gender}
                        availableYears={availableYears}
                        selectedYear={selectedYear}
                        onYearChange={setSelectedYear}
                        onLogDay={handleLogDay}
                    />
                )}
                {activeTab === "stats" && (
                    <FastingStats
                        stats={stats}
                        hijriYear={selectedYear}
                        onViewDetail={() => setActiveTab("qadha")}
                    />
                )}
                {activeTab === "qadha" && (
                    <QadhaTracker
                        pendingItems={pendingQadha}
                        onMarkDone={markQadhaDone}
                    />
                )}
            </div>
        </div>
    );
}
