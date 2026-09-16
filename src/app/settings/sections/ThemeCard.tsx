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
import type { TranslationTree } from "@/context/LocaleContext";

interface ThemeCardProps {
    t: TranslationTree;
    currentTheme: string;
    isMuhsinin: boolean;
    handleThemeSelect: (themeId: ThemeId) => void;
}

export default function ThemeCard({ t, currentTheme, isMuhsinin, handleThemeSelect }: ThemeCardProps) {
    const themes = Object.values(THEMES).sort((a, b) => (a.isPremium === b.isPremium ? 0 : a.isPremium ? 1 : -1));
    const groups = [
        { mode: "light" as const, label: t.themeModeLight, items: themes.filter((theme) => theme.mode === "light") },
        { mode: "dark" as const, label: t.themeModeDark, items: themes.filter((theme) => theme.mode === "dark") },
    ];

    return (
        <div className="bg-[rgb(var(--color-surface))]/70 border border-[rgb(var(--color-border))]/20 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-[rgb(var(--color-primary))]">
                <Palette className="w-4 h-4" />
                <span className="text-sm font-semibold text-[rgb(var(--color-text-strong))]">{t.themeTitle}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {groups.map((group) => (
                    <section key={group.mode} className="min-w-0" aria-labelledby={`theme-group-${group.mode}`}>
                        <h3 id={`theme-group-${group.mode}`} className="mb-1 text-[9px] font-black uppercase tracking-[0.16em] text-[rgb(var(--color-text-muted))]">
                            {group.label}
                        </h3>
                        <div className="relative">
                            <div className="flex items-center gap-3 overflow-x-auto py-2 px-1 scrollbar-hide snap-x">
                                {group.items.map((theme, index, array) => {
                        const isSelected = currentTheme === theme.id;
                        const isLocked = theme.isPremium && !isMuhsinin;
                        const translatedName = t[theme.nameKey];
                        const themeName = typeof translatedName === "string" ? translatedName : theme.name;
                        const translatedDescription = t[theme.descriptionKey];
                        const themeDescription = typeof translatedDescription === "string" ? translatedDescription : theme.description;

                        // Check if this is the first PRO item to add a divider
                        const showDivider = index > 0 && theme.isPremium && !array[index - 1].isPremium;

                        return (
                            <div key={theme.id} className="flex items-center gap-4 snap-start">
                                {showDivider && (
                                    <div className="h-12 w-px bg-[rgb(var(--color-border))]/20 mx-2" />
                                )}

                                <button
                                    onClick={() => handleThemeSelect(theme.id)}
                                    type="button"
                                    aria-label={`${themeName}: ${themeDescription}`}
                                    aria-pressed={isSelected}
                                    className="flex flex-col items-center gap-3 group transition-all relative py-2 px-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                                >
                                    <div className={cn(
                                        "relative rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                                        isSelected ? "w-16 h-16 z-10 ring-2 ring-[rgb(var(--color-primary))] ring-offset-4 ring-offset-[rgb(var(--color-surface))]" : "w-12 h-12 hover:scale-110 opacity-60 hover:opacity-100 grayscale hover:grayscale-0"
                                    )}>

                                        {/* Ambient Glow for Selected */}
                                        {isSelected && theme?.colors && (
                                            <div
                                                className="absolute inset-0 rounded-full blur-md opacity-60 transition-all duration-500 animate-pulse"
                                                style={{ backgroundColor: `rgb(${theme.colors.primary})` }}
                                            />
                                        )}

                                        {/* Main Circle Content */}
                                        <div className="absolute inset-0 rounded-full overflow-hidden flex flex-col border border-[rgb(var(--color-border))]/20 z-10 shadow-[var(--shadow-card)] bg-[rgb(var(--color-canvas))]">
                                            <div className="h-1/2 w-full transition-colors duration-500" style={{ backgroundColor: `rgb(${theme.colors.primary})` }} />
                                            <div className="h-1/2 w-full flex">
                                                <div className="w-1/2 h-full transition-colors duration-500" style={{ backgroundColor: `rgb(${theme.colors.accent})` }} />
                                                <div className="w-1/2 h-full transition-colors duration-500" style={{ backgroundColor: `rgb(${theme.colors.surface})` }} />
                                            </div>
                                        </div>

                                        {/* Premium/Lock Indicators - Floating outside for pop styling */}
                                        {theme.isPremium && (
                                            <div className={cn(
                                                "absolute -bottom-1 -right-1 rounded-full border-2 border-[rgb(var(--color-surface))] z-20 shadow-[var(--shadow-card)] flex items-center justify-center transition-all duration-300",
                                                isSelected ? "w-6 h-6 bg-[rgb(var(--color-accent))]" : "w-4 h-4 bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-accent))]/30"
                                            )}>
                                                {isLocked ? (
                                                    <Lock className={cn("text-[rgb(var(--color-accent-foreground))] transition-all", isSelected ? "w-3 h-3" : "w-2 h-2")} />
                                                ) : (
                                                    <Crown className={cn("transition-all", isSelected ? "w-3 h-3 text-[rgb(var(--color-accent-foreground))]" : "w-2 h-2 text-[rgb(var(--color-accent))]")} />
                                                )}
                                            </div>
                                        )}

                                        {/* Selected Check Indicator */}
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 bg-[rgb(var(--color-primary))] rounded-full p-1 border-2 border-[rgb(var(--color-surface))] z-20 shadow-[var(--shadow-card)] scale-100 animate-in zoom-in duration-300">
                                                <Check className="w-3 h-3 text-[rgb(var(--color-primary-foreground))]" strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>

                                    <span className={cn(
                                        "text-[10px] font-bold transition-all duration-300 truncate max-w-[70px]",
                                        isSelected ? "text-[rgb(var(--color-primary))] scale-110 translate-y-1" : "text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-text-strong))]"
                                    )}>
                                        {themeName}
                                    </span>
                                </button>
                            </div>
                        );
                                })}
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
