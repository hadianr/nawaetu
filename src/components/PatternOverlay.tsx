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

import { useTheme } from "@/context/ThemeContext";
import { memo } from "react";

const PatternOverlay = memo(function PatternOverlay() {
    const { theme } = useTheme();

    if (!theme?.pattern || theme.pattern.type === 'none') {
        return null;
    }

    const { type, opacity } = theme.pattern;

    // SVG Pattern Definitions
    const patterns = {
        stars: (
            <div
                className="absolute inset-0 bg-[rgb(var(--color-primary-light))]"
                style={{
                    opacity,
                    maskImage: "url('/patterns/midnight.svg')",
                    WebkitMaskImage: "url('/patterns/midnight.svg')",
                    maskRepeat: 'repeat',
                    WebkitMaskRepeat: 'repeat',
                    maskSize: '420px 420px',
                    WebkitMaskSize: '420px 420px',
                }}
            />
        ),
        waves: (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
                <defs>
                    <pattern id="waves-pattern" x="0" y="0" width="200" height="40" patternUnits="userSpaceOnUse">
                        <path
                            d="M0,20 Q50,5 100,20 T200,20"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            opacity="0.6"
                        />
                        <path
                            d="M0,30 Q50,15 100,30 T200,30"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            opacity="0.3"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#waves-pattern)" className="text-[rgb(var(--color-primary-strong))]" />
            </svg>
        ),
        floral: (
            <div
                className="absolute inset-0 bg-[rgb(var(--color-primary))]"
                style={{
                    opacity,
                    maskImage: "url('/patterns/blossom.svg')",
                    WebkitMaskImage: "url('/patterns/blossom.svg')",
                    maskRepeat: 'repeat',
                    WebkitMaskRepeat: 'repeat',
                    maskSize: '520px 520px',
                    WebkitMaskSize: '520px 520px',
                }}
            />
        ),
        none: null,
    };

    return (
        <div className="pattern-overlay fixed inset-0 pointer-events-none z-[1]" aria-hidden="true">
            {patterns[type]}
        </div>
    );
});

export default PatternOverlay;
