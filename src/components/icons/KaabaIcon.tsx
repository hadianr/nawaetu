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

export function KaabaIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect x="2" y="5" width="20" height="16" rx="2" fill="currentColor" />
            <path d="M2 9H22" stroke="#FBBF24" strokeWidth="2" />
            <path d="M8 5V21" stroke="#FBBF24" strokeWidth="0.5" strokeOpacity="0.3" />
            <path d="M16 5V21" stroke="#FBBF24" strokeWidth="0.5" strokeOpacity="0.3" />
            <rect x="14" y="11" width="4" height="6" rx="1" fill="#FBBF24" fillOpacity="0.8" />
        </svg>
    );
}
