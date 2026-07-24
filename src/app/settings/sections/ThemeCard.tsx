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

import { Palette, Lock, Crown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEMES, ThemeId } from "@/context/ThemeContext";

interface ThemeCardProps {
    t: any;
    currentTheme: string;
    isMuhsinin: boolean;
    handleThemeSelect: (themeId: ThemeId) => void;
}

export default function ThemeCard({ t, currentTheme, isMuhsinin, handleThemeSelect }: ThemeCardProps) {
    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-[rgb(var(--color-primary))]">
                <Palette className="w-4 h-4" />
                <span className="text-sm font-semibold text-white">{t.themeTitle}</span>
            </div>

            <div className="relative">
                <div className="flex items-center gap-5 overflow-x-auto py-6 px-4 scrollbar-hide snap-x">
                    {/* Physical Spacer to prevent clipping (40px) */}
                    <div className="min-w-[40px] shrink-0" />

                    {Object.values(THEMES).sort((a, b) => (a.isPremium === b.isPremium ? 0 : a.isPremium ? 1 : -1)).map((theme, index, array) => {
                        const isSelected = currentTheme === theme.id;
                        const isLocked = theme.isPremium && !isMuhsinin;

                        // Check if this is the first PRO item to add a divider
                        const showDivider = index > 0 && theme.isPremium && !array[index - 1].isPremium;

                        return (
                            <div key={theme.id} className="flex items-center gap-4 snap-start">
                                {showDivider && (
                                    <div className="h-12 w-px bg-white/10 mx-2" />
                                )}

                                <button
                                    onClick={() => handleThemeSelect(theme.id)}
                                    className="flex flex-col items-center gap-3 group transition-all relative py-2 px-2"
                                >
                                    <div className={cn(
                                        "relative rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                                        isSelected ? "w-16 h-16 z-10 ring-2 ring-[rgb(var(--color-primary))] ring-offset-4 ring-offset-black" : "w-12 h-12 hover:scale-110 opacity-60 hover:opacity-100 grayscale hover:grayscale-0"
                                    )}>

                                        {/* Ambient Glow for Selected */}
                                        {isSelected && theme?.colors && (
                                            <div
                                                className="absolute inset-0 rounded-full blur-md opacity-60 transition-all duration-500 animate-pulse"
                                                style={{ backgroundColor: `rgb(${theme.colors.primary})` }}
                                            />
                                        )}

                                        {/* Main Circle Content */}
                                        <div className="absolute inset-0 rounded-full overflow-hidden flex flex-col border border-white/10 z-10 shadow-2xl bg-black">
                                            <div className="h-1/2 w-full transition-colors duration-500" style={{ backgroundColor: theme?.colors ? `rgb(${theme.colors.primary})` : 'rgb(16 185 129)' }} />
                                            <div className="h-1/2 w-full flex">
                                                <div className="w-1/2 h-full transition-colors duration-500" style={{ backgroundColor: theme?.colors ? `rgb(${theme.colors.accent})` : 'rgb(251 191 36)' }} />
                                                <div className="w-1/2 h-full transition-colors duration-500" style={{ backgroundColor: theme?.colors ? `rgb(${theme.colors.surface})` : 'rgb(15 23 42)' }} />
                                            </div>
                                        </div>

                                        {/* Premium/Lock Indicators - Floating outside for pop styling */}
                                        {theme.isPremium && (
                                            <div className={cn(
                                                "absolute -bottom-1 -right-1 rounded-full border-2 border-black z-20 shadow-lg flex items-center justify-center transition-all duration-300",
                                                isSelected ? "w-6 h-6 bg-[rgb(var(--color-accent))]" : "w-4 h-4 bg-slate-800 border-[rgb(var(--color-accent))]/30"
                                            )}>
                                                {isLocked ? (
                                                    <Lock className={cn("text-black transition-all", isSelected ? "w-3 h-3" : "w-2 h-2")} />
                                                ) : (
                                                    <Crown className={cn("transition-all", isSelected ? "w-3 h-3 text-black" : "w-2 h-2 text-[rgb(var(--color-accent))]")} />
                                                )}
                                            </div>
                                        )}

                                        {/* Selected Check Indicator */}
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 bg-[rgb(var(--color-primary))] rounded-full p-1 border-2 border-black z-20 shadow-lg scale-100 animate-in zoom-in duration-300">
                                                <Check className="w-3 h-3 text-black" strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>

                                    <span className={cn(
                                        "text-[10px] font-bold transition-all duration-300 truncate max-w-[70px]",
                                        isSelected ? "text-[rgb(var(--color-primary-light))] scale-110 translate-y-1" : "text-white/40 group-hover:text-white"
                                    )}>
                                        {theme.name}
                                    </span>
                                </button>
                            </div>
                        );
                    })}
                    {/* Physical Spacer End (40px) */}
                    <div className="min-w-[40px] shrink-0" />
                </div>
            </div>
        </div>
    );
}
