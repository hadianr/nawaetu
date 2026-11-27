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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocale } from "@/context/LocaleContext";
import { AppIcon } from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/button";
import type { AppIconName } from "@/lib/icon-names";

const SHARE_URL = "https://nawaetu.com/?utm_source=stats_together&utm_medium=social&utm_campaign=app_share";

/** What signed-in users worship together: real acts, framed as one community, with a way to invite. */
export default function GlobalStatsWidget() {
    const { t } = useLocale();
    const [stats, setStats] = useState({ prayers: 0, intentions: 0, activeThisWeek: 0 });
    useEffect(() => {
        fetch("/api/stats/global", { cache: "no-store" })
            .then((response) => response.ok ? response.json() : null)
            .then((data) => data && setStats(data))
            .catch(() => undefined);
    }, []);

    const share = async () => {
        try {
            if (navigator.share) return await navigator.share({ text: t.globalImpactShareText, url: SHARE_URL });
            await navigator.clipboard.writeText(`${t.globalImpactShareText}\n${SHARE_URL}`);
            toast.success(t.copied);
        } catch (error) {
            if ((error as Error).name !== "AbortError") toast.error(t.globalImpactShareFailed);
        }
    };

    const tiles: { icon: AppIconName; value: number; label: string }[] = [
        { icon: "mosque", value: stats.prayers, label: t.globalImpactPrayers },
        { icon: "hand-heart", value: stats.intentions, label: t.globalImpactIntentions },
        { icon: "users", value: stats.activeThisWeek, label: t.globalImpactActiveWeek },
    ];

    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            aria-labelledby="worship-together-title"
            className="w-full relative overflow-hidden rounded-2xl border border-[rgb(var(--color-primary))]/20 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 via-[rgb(var(--color-surface-subtle))] to-transparent p-4 shadow-[var(--shadow-card)]"
        >
            <div className="flex items-center gap-2 mb-2">
                <AppIcon name="users" size="sm" tone="primary" />
                <h2 id="worship-together-title" className="font-bold text-sm text-[rgb(var(--color-text-strong))]">{t.globalImpactTitle}</h2>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-[rgb(var(--color-text))]">{t.globalImpactMessage}</p>

            <div className="grid grid-cols-3 gap-2">
                {tiles.map((tile) => (
                    <div key={tile.label} className="flex flex-col items-center text-center p-2 rounded-xl bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))] shadow-[var(--shadow-card)]">
                        <AppIcon name={tile.icon} size="md" tone="primary" className="mb-1" />
                        <span className="text-lg font-bold text-[rgb(var(--color-text-strong))]">{tile.value.toLocaleString()}</span>
                        <span className="text-xs text-[rgb(var(--color-text-muted))] leading-tight mt-0.5">{tile.label}</span>
                    </div>
                ))}
            </div>

            <figure className="mt-4 text-center">
                <blockquote className="text-xs italic leading-relaxed text-[rgb(var(--color-primary-strong))]">{t.globalImpactHadith}</blockquote>
                <figcaption className="mt-1 text-xs text-[rgb(var(--color-text-muted))]">{t.globalImpactHadithSource}</figcaption>
            </figure>
            <Button variant="outline" className="mt-3 min-h-11 w-full gap-2" onClick={share}>
                <AppIcon name="message-heart" size="sm" tone="primary" />
                {t.globalImpactShare}
            </Button>
        </motion.section>
    );
}
