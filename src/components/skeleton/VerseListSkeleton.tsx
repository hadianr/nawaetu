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


export default function VerseListSkeleton() {
    return (
        <div className="w-full max-w-4xl space-y-8 pb-24">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-5 w-32 rounded bg-white/10 animate-pulse" />
                        <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                    </div>
                </div>
                <div className="h-9 w-24 rounded-full bg-white/10 animate-pulse" />
            </div>

            {/* Bismillah Skeleton */}
            <div className="mx-auto h-8 w-64 rounded bg-white/10 animate-pulse" />

            {/* Verses Skeleton */}
            <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-6 border-b border-white/5 pb-6">
                        <div className="ml-auto h-12 w-3/4 rounded bg-white/10 animate-pulse" />
                        <div className="h-4 w-1/2 rounded bg-white/10 animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
}
