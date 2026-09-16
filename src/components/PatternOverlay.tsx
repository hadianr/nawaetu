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
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity, contentVisibility: 'auto' }}>
                <defs>
                    <pattern id="stars-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="1.5" fill="currentColor" opacity="0.4" />
                        <circle cx="50" cy="30" r="0.8" fill="currentColor" opacity="0.6" />
                        <circle cx="70" cy="60" r="1.2" fill="currentColor" opacity="0.3" />
                        <circle cx="30" cy="70" r="0.6" fill="currentColor" opacity="0.5" />
                        <circle cx="65" cy="15" r="1" fill="currentColor" opacity="0.4" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#stars-pattern)" className="text-white" />
            </svg>
        ),
        waves: (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity, contentVisibility: 'auto' }}>
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
                <rect width="100%" height="100%" fill="url(#waves-pattern)" className="text-white" />
            </svg>
        ),
        geometric: (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity, contentVisibility: 'auto' }}>
                <defs>
                    <pattern id="geometric-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        {/* Islamic Star Pattern */}
                        <path
                            d="M50,0 L60,30 L90,30 L65,50 L75,80 L50,60 L25,80 L35,50 L10,30 L40,30 Z"
                            fill="currentColor"
                            opacity="0.15"
                        />
                        <path
                            d="M50,0 L100,50 L50,100 L0,50 Z"
                            stroke="currentColor"
                            strokeWidth="0.5"
                            fill="none"
                            opacity="0.2"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#geometric-pattern)" className="text-white" />
            </svg>
        ),
        organic: (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity, contentVisibility: 'auto' }}>
                <defs>
                    <pattern id="organic-pattern" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
                        {/* Water Ripple Effect */}
                        <circle cx="75" cy="75" r="30" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.2" />
                        <circle cx="75" cy="75" r="45" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.15" />
                        <circle cx="75" cy="75" r="60" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.1" />
                        <ellipse cx="40" cy="40" rx="15" ry="20" fill="currentColor" opacity="0.08" />
                        <ellipse cx="110" cy="110" rx="20" ry="15" fill="currentColor" opacity="0.06" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#organic-pattern)" className="text-white" />
            </svg>
        ),
        damask: (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity, contentVisibility: 'auto' }}>
                <defs>
                    <pattern id="damask-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                        {/* Elegant Floral Damask */}
                        <path
                            d="M60,10 C70,20 75,30 75,45 C75,55 70,65 60,70 C50,65 45,55 45,45 C45,30 50,20 60,10 Z"
                            fill="currentColor"
                            opacity="0.12"
                        />
                        <path
                            d="M60,50 C65,55 70,60 70,70 C70,75 67,80 60,82 C53,80 50,75 50,70 C50,60 55,55 60,50 Z"
                            fill="currentColor"
                            opacity="0.08"
                        />
                        <ellipse cx="60" cy="30" rx="8" ry="12" fill="currentColor" opacity="0.1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#damask-pattern)" className="text-white" />
            </svg>
        ),
        floral: (
            <svg className="absolute inset-0 w-full h-full pointer-events-none text-[rgb(var(--color-primary-light))]" style={{ opacity: Math.min(0.14, opacity + 0.04), contentVisibility: 'auto' }}>
                <defs>
                    <pattern id="floral-pattern" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
                        <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.55">
                            <path d="M26 132 C34 105 45 88 66 72 C83 59 99 42 108 22" />
                            <path d="M44 102 C31 94 24 83 25 70 C38 73 47 84 44 102 Z" fill="currentColor" opacity="0.22" />
                            <path d="M65 73 C53 62 51 48 57 36 C69 43 74 57 65 73 Z" fill="currentColor" opacity="0.18" />
                            <path d="M82 56 C91 46 103 43 114 48 C108 59 96 63 82 56 Z" fill="currentColor" opacity="0.2" />
                            <circle cx="112" cy="20" r="7" fill="currentColor" opacity="0.16" />
                            <circle cx="112" cy="20" r="2" fill="currentColor" opacity="0.35" />
                            <path d="M112 10 L114 16 L120 16 L115 20 L117 26 L112 22 L107 26 L109 20 L104 16 L110 16 Z" fill="currentColor" opacity="0.22" />
                        </g>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#floral-pattern)" className="text-[rgb(var(--color-primary-light))]" />
            </svg>
        ),
        none: null,
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" style={{ contentVisibility: 'auto' }}>
            {patterns[type]}
        </div>
    );
});

export default PatternOverlay;
