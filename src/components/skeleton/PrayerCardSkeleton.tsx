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


export default function PrayerCardSkeleton() {
    return (
        <div className="w-full max-w-md rounded-3xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-6 backdrop-blur-md shadow-[var(--shadow-card)]">
            {/* Prayer Times Skeleton (7 items to match Imsak + 5 Prayers + Sunrise) */}
            <div className="space-y-3">
                {[...Array(7)].map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between rounded-xl bg-[rgb(var(--color-surface-subtle))] p-4"
                    >
                        <div className="h-4 w-16 animate-pulse rounded bg-[rgb(var(--color-border))]/20" />
                        <div className="h-5 w-12 animate-pulse rounded bg-[rgb(var(--color-border))]/20" />
                    </div>
                ))}
            </div>
        </div>
    );
}
