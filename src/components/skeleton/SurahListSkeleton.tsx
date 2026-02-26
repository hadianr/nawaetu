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


export default function SurahListSkeleton() {
    return (
        <div className="w-full max-w-4xl space-y-6">
            {/* Search Header Skeleton */}
            <div className="h-10 w-full rounded-md bg-white/10 animate-pulse" />

            {/* Grid Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="flex h-24 w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-white/10 animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
                                <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-6 w-16 rounded bg-white/10 animate-pulse" />
                            <div className="h-3 w-12 rounded bg-white/10 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
