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

'use client';

import type { TranslationTree } from '@/context/LocaleContext';
import { AppIcon } from '@/components/ui/AppIcon';
import type { AppIconName } from '@/lib/icon-names';
import { mostMissedPrayer, statsMessageKind, type StatsMessageKind } from '@/lib/stats/message';

const ICONS: Record<StatsMessageKind, AppIconName> = {
    udzur: 'flower',
    start: 'compass',
    return: 'hand-heart',
    grow: 'target',
    strong: 'sparkles',
};

interface StatsMessageProps {
    t: TranslationTree;
    prayed: number;
    due: number;
    excusedToday: boolean;
    hasHistory: boolean;
    last14Days: string[];
    prayerMap: Record<string, Set<string>>;
    excusedDates: ReadonlySet<string>;
}

/** What the numbers mean for this person, and one next step, with its source. */
export function StatsMessage({ t, prayed, due, excusedToday, hasHistory, last14Days, prayerMap, excusedDates }: StatsMessageProps) {
    const m = t.stats.message;
    const kind = statsMessageKind({ prayed, due, excusedToday, hasHistory });
    const prayer = mostMissedPrayer(last14Days, prayerMap, excusedDates);
    const text = m[kind]
        .replace('{{prayed}}', String(prayed))
        .replace('{{due}}', String(due))
        .replace('{{prayer}}', prayer ? t.stats.insights.prayers.names[prayer] : '');
    const source = kind === 'udzur' ? m.udzurSource : kind === 'return' ? m.returnSource : m.consistencySource;

    return (
        <section className="mx-auto max-w-2xl px-6 pt-4" aria-labelledby="stats-message-title">
            <div className="rounded-2xl border border-[rgb(var(--color-primary))]/25 bg-[rgb(var(--color-primary))]/10 p-4 shadow-[var(--shadow-card)]">
                <div className="mb-2 flex items-center gap-2">
                    <AppIcon name={ICONS[kind]} size="sm" tone="primary" />
                    <h2 id="stats-message-title" className="text-sm font-bold text-[rgb(var(--color-text-strong))]">{m.title}</h2>
                </div>
                <p className="text-sm leading-relaxed text-[rgb(var(--color-text))]">{text}</p>
                <p className="mt-2 text-xs italic leading-relaxed text-[rgb(var(--color-primary-strong))]">{source}</p>
            </div>
        </section>
    );
}
