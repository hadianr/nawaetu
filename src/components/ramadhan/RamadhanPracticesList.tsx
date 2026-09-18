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

import { RAMADHAN_PRACTICES } from "@/data/ramadhan";
import DalilBadge from "./DalilBadge";
import IntentionCard from "./IntentionCard";
import { useLocale } from "@/context/LocaleContext";
import { useState } from "react";
import { AppIcon } from "@/components/ui/AppIcon";

export default function RamadhanPracticesList() {
    const { t, locale } = useLocale();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] backdrop-blur-md shadow-[var(--shadow-card)] transition-all duration-300">
            {/* Header */}
            <div className="px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3">
                <div className="flex items-center gap-2">
                    <AppIcon name="hands" size="sm" tone="primary" />
                    <h3 className="font-bold text-[rgb(var(--color-text-strong))] text-base">
                        {t.practicesTitle}
                    </h3>
                </div>
                <p className="text-xs text-[rgb(var(--color-text-muted))] mt-0.5">
                    {t.practicesTapHint}
                </p>
            </div>

            {/* Amalan list */}
            <div className="divide-y divide-[rgb(var(--color-border))]">
                {RAMADHAN_PRACTICES.map((practice) => {
                    const isExpanded = expandedId === practice.id;
                    const localizedTitle = locale === "en" && practice.title_en ? practice.title_en : practice.title;
                    const localizedDesc = locale === "en" && practice.description_en ? practice.description_en : practice.description;
                    const localizedTips = locale === "en" && practice.tips_en ? practice.tips_en : practice.tips;

                    return (
                        <div key={practice.id} className="transition-all duration-300">
                            {/* Practice row */}
                            <div
                                onClick={() => setExpandedId(isExpanded ? null : practice.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setExpandedId(isExpanded ? null : practice.id);
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                className="w-full flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 text-left hover:bg-[rgb(var(--color-surface-subtle))] transition-all cursor-pointer outline-none focus-visible:bg-[rgb(var(--color-surface-subtle))]"
                            >
                                <AppIcon name={practice.iconKey} size="lg" tone="primary" className="shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[rgb(var(--color-text-strong))] text-xs sm:text-sm">{localizedTitle}</p>
                                    <p className="text-[10px] sm:text-xs text-[rgb(var(--color-text-muted))] truncate">{localizedDesc}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <DalilBadge dalil={practice.dalil} variant="pill" />
                                    <span className={`text-[rgb(var(--color-text-muted))] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Expanded detail */}
                            {isExpanded && (
                                <div className="px-3 pb-4 pt-2 space-y-3 sm:px-4 sm:pb-6 sm:space-y-4 animate-in slide-in-from-top-2 fade-in duration-300 bg-[rgb(var(--color-surface-subtle))] backdrop-blur-sm">
                                    {/* Tips */}
                                    {localizedTips && localizedTips.length > 0 && (
                                        <div className="rounded-xl bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] p-4 shadow-[var(--shadow-card)] backdrop-blur-sm">
                                            <p className="text-[10px] font-bold text-[rgb(var(--color-text-muted))] uppercase tracking-[0.2em] mb-4">
                                                {t.practicesTipsLabel}
                                            </p>
                                            <ul className="space-y-1.5">
                                                {localizedTips.map((tip, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-xs text-[rgb(var(--color-text))]">
                                                        <AppIcon name="sparkles" size="xs" tone="primary" className="shrink-0 mt-0.5" />
                                                        <span>{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Intention */}
                                    {practice.intention && (
                                        <IntentionCard intention={practice.intention} compact />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
