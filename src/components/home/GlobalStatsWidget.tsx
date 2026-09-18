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

import { motion } from "framer-motion";
import { Users, Globe2, HeartHandshake } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { AppIcon } from "@/components/ui/AppIcon";

export default function GlobalStatsWidget() {
    const { t } = useLocale();
    const [stats, setStats] = useState({ missionsCompleted: 0, activeWorshipDays: 0, users: 0 });
    useEffect(() => {
        fetch("/api/stats/global", { cache: "no-store" })
            .then((response) => response.ok ? response.json() : null)
            .then((data) => data && setStats(data))
            .catch(() => undefined);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full relative overflow-hidden rounded-2xl border border-[rgb(var(--color-primary))]/20 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 via-[rgb(var(--color-surface-subtle))] to-transparent p-4 mb-4"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--color-primary))]/5 rounded-full blur-[40px] pointer-events-none" />

            <div className="flex items-center gap-2 mb-4">
                <Globe2 className="w-5 h-5 text-[rgb(var(--color-primary-light))]" />
                <h2 className="font-bold text-sm text-[rgb(var(--color-text-strong))]">{t.globalImpactTitle}</h2>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))]">
                    <HeartHandshake className="w-5 h-5 text-[rgb(var(--color-accent))] mb-1" />
                    <span className="text-lg font-black text-[rgb(var(--color-text-strong))]">{stats.missionsCompleted.toLocaleString()}</span>
                    <span className="text-[9px] text-[rgb(var(--color-text-muted))] leading-tight mt-0.5">{t.globalImpactMissions}</span>
                </div>

                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))]">
                    <AppIcon name="landmark" size="md" tone="primary" className="mb-1" />
                    <span className="text-lg font-black text-[rgb(var(--color-text-strong))]">{stats.activeWorshipDays.toLocaleString()}</span>
                    <span className="text-[9px] text-[rgb(var(--color-text-muted))] leading-tight mt-0.5">{t.globalImpactStreakDays}</span>
                </div>

                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))]">
                    <Users className="w-5 h-5 text-[rgb(var(--color-info))] mb-1" />
                    <span className="text-lg font-black text-[rgb(var(--color-text-strong))]">{stats.users.toLocaleString()}</span>
                    <span className="text-[9px] text-[rgb(var(--color-text-muted))] leading-tight mt-0.5">{t.globalImpactUsers}</span>
                </div>
            </div>

            <div className="mt-3 text-center">
                <p className="text-[10px] text-[rgb(var(--color-primary-light))]/80 italic">
                    &quot;{t.globalImpactTagline}&quot;
                </p>
            </div>
        </motion.div>
    );
}
