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

import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from "react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { DEFAULT_THEME_ID, THEMES, resolveThemeId, themeCssVariables, type Theme, type ThemeId } from "@/context/themes";

// Named re-exports: a "use client" module cannot use `export *`.
export { DEFAULT_THEME_ID, THEMES, hasCompleteThemeTokens, resolveThemeId, themeCssVariables } from "@/context/themes";
export type { Theme, ThemeId, ThemeMode, ThemePattern, ThemeToken, ThemeTokens } from "@/context/themes";

export function applyTheme(theme: Theme): void {
    const root = document.documentElement;
    const { id, mode, variables } = themeCssVariables(theme);

    Object.entries(variables).forEach(([name, value]) => root.style.setProperty(name, value));
    root.dataset.theme = id;
    root.dataset.colorMode = mode;
    root.style.colorScheme = mode;
}

interface ThemeContextType {
    currentTheme: ThemeId;
    setTheme: (themeId: ThemeId) => void;
    theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<ThemeId>(DEFAULT_THEME_ID);

    // Resolve persisted theme before the first client paint without changing
    // the server/client render output used for hydration.
    useIsomorphicLayoutEffect(() => {
        const resolvedTheme = resolveThemeId(getStorageService().getOptional(STORAGE_KEYS.SETTINGS_THEME));
        if (resolvedTheme !== currentTheme) setCurrentTheme(resolvedTheme);
        applyTheme(THEMES[resolvedTheme]);
    }, []);

    useIsomorphicLayoutEffect(() => {
        applyTheme(THEMES[currentTheme] || THEMES[DEFAULT_THEME_ID]);
    }, [currentTheme]);

    const setTheme = (themeId: ThemeId) => {
        // Validate theme exists
        if (!THEMES[themeId]) {
            return;
        }

        const storage = getStorageService();
        setCurrentTheme(themeId);
        storage.set(STORAGE_KEYS.SETTINGS_THEME, themeId);
        window.dispatchEvent(new CustomEvent("theme_changed", { detail: { themeId } }));
    };

    return (
        <ThemeContext.Provider
            value={{
                currentTheme,
                setTheme,
                theme: THEMES[currentTheme] || THEMES[DEFAULT_THEME_ID],
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}
