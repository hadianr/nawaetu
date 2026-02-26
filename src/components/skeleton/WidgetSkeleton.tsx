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

import React from "react";

export default function WidgetSkeleton() {
    return (
        <div className="h-full w-full rounded-3xl bg-white/5 border border-white/5 animate-pulse flex flex-col justify-between p-4">
            <div className="h-4 w-20 bg-white/10 rounded-md" />
            <div className="h-8 w-16 bg-white/10 rounded-md self-center" />
            <div className="h-3 w-24 bg-white/10 rounded-md self-center" />
        </div>
    );
}
