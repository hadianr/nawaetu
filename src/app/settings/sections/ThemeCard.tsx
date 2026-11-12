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

import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEMES, ThemeId } from "@/context/ThemeContext";
import type { TranslationTree } from "@/context/LocaleContext";

interface ThemeCardProps {
    t: TranslationTree;
    currentTheme: string;
    handleThemeSelect: (themeId: ThemeId) => void;
}

/**
 * Every theme is free, so the picker is just swatches: two rows (light, dark) that wrap instead of scrolling, with the
 * chosen theme's name beside the title. Each swatch keeps a 44px touch target around a 32px circle.
 */
export default function ThemeCard({ t, currentTheme, handleThemeSelect }: ThemeCardProps) {
    const themes = Object.values(THEMES);
    const groups = [
        { mode: "light" as const, label: t.themeModeLight, items: themes.filter((theme) => theme.mode === "light") },
        { mode: "dark" as const, label: t.themeModeDark, items: themes.filter((theme) => theme.mode === "dark") },
    ];
    const nameOf = (theme: (typeof themes)[number]) => {
        const translated = t[theme.nameKey];
        return typeof translated === "string" ? translated : theme.name;
    };
    const chosen = themes.find((theme) => theme.id === currentTheme);

    return (
        <div className="bg-[rgb(var(--color-surface))]/70 border border-[rgb(var(--color-border))]/20 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[rgb(var(--color-primary))]">
                    <Palette className="w-4 h-4" />
                    <span className="text-sm font-semibold text-[rgb(var(--color-text-strong))]">{t.themeTitle}</span>
                </div>
                {chosen && <span className="text-xs font-medium text-[rgb(var(--color-text-muted))]" data-testid="theme-chosen">{nameOf(chosen)}</span>}
            </div>

            {groups.map((group) => (
                <section key={group.mode} className="flex items-center gap-3" aria-labelledby={`theme-group-${group.mode}`}>
                    <h3 id={`theme-group-${group.mode}`} className="w-11 shrink-0 text-[9px] font-black uppercase tracking-[0.16em] text-[rgb(var(--color-text-muted))]">
                        {group.label}
                    </h3>
                    <div className="flex flex-wrap items-center">
                        {group.items.map((theme) => {
                            const isSelected = currentTheme === theme.id;
                            const themeName = nameOf(theme);
                            const description = t[theme.descriptionKey];
                            const themeDescription = typeof description === "string" ? description : theme.description;

                            return (
                                <button
                                    key={theme.id}
                                    type="button"
                                    onClick={() => handleThemeSelect(theme.id)}
                                    aria-label={`${themeName}: ${themeDescription}`}
                                    aria-pressed={isSelected}
                                    title={themeName}
                                    className="group flex size-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-ring))]"
                                >
                                    <span className={cn(
                                        "relative block size-8 rounded-full transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-110",
                                        isSelected && "ring-2 ring-[rgb(var(--color-primary))] ring-offset-2 ring-offset-[rgb(var(--color-surface))]",
                                    )}>
                                        <span className="absolute inset-0 flex flex-col overflow-hidden rounded-full border border-[rgb(var(--color-border))]/30 bg-[rgb(var(--color-canvas))]">
                                            <span className="h-1/2 w-full" style={{ backgroundColor: `rgb(${theme.colors.primary})` }} />
                                            <span className="flex h-1/2 w-full">
                                                <span className="h-full w-1/2" style={{ backgroundColor: `rgb(${theme.colors.accent})` }} />
                                                <span className="h-full w-1/2" style={{ backgroundColor: `rgb(${theme.colors.surface})` }} />
                                            </span>
                                        </span>
                                        {isSelected && (
                                            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full border-2 border-[rgb(var(--color-surface))] bg-[rgb(var(--color-primary))]">
                                                <Check className="size-2.5 text-[rgb(var(--color-primary-foreground))]" strokeWidth={4} />
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}
