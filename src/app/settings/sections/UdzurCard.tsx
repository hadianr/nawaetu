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

"use client";

import { toast } from "sonner";
import { AppIcon } from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/button";
import { useUdzur } from "@/hooks/useUdzur";
import type { TranslationTree } from "@/context/LocaleContext";

/** Udzur (haid/nifas) privacy: what is kept where, and a way to delete it. Shown once there is something to delete. */
export default function UdzurCard({ t }: { t: TranslationTree }) {
    const udzur = useUdzur();
    if (!udzur.available || udzur.periods.length === 0) return null;

    const clear = () => {
        if (!window.confirm(t.udzurClearConfirm)) return;
        udzur.clearHistory();
        toast.success(t.udzurCleared);
    };

    return (
        <div className="bg-[rgb(var(--color-surface))]/70 border border-[rgb(var(--color-border))]/20 rounded-2xl p-4 space-y-3 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2">
                <AppIcon name="flower" size="sm" tone="primary" />
                <span className="text-sm font-semibold text-[rgb(var(--color-text-strong))]">{t.udzurSettingsTitle}</span>
            </div>
            <p className="text-xs leading-relaxed text-[rgb(var(--color-text-muted))]">{t.udzurSettingsDesc}</p>
            <Button variant="outline" className="min-h-11 w-full" onClick={clear}>
                {t.udzurClearHistory}
            </Button>
        </div>
    );
}
