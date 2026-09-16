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

export type ThemeId =
    | "default"
    | "daylight"
    | "midnight"
    | "sunset"
    | "lavender"
    | "ocean"
    | "royal"
    | "blossom";

export type ThemeMode = "light" | "dark";

export type ThemeToken =
    | "canvas"
    | "surface"
    | "surfaceSubtle"
    | "textStrong"
    | "text"
    | "textMuted"
    | "primary"
    | "primaryStrong"
    | "primaryForeground"
    | "accent"
    | "accentForeground"
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "dangerForeground"
    | "border"
    | "ring"
    | "shadowCard"
    | "shadowFloating"
    | "radiusControl"
    | "radiusCard"
    | "spacePage"
    | "spaceSection"
    | "fontUi"
    | "fontReading"
    | "fontEditorial"
    | "readerLineHeight";

export type ThemeTokens = Record<ThemeToken, string>;

export interface ThemePattern {
    type: 'geometric' | 'organic' | 'stars' | 'waves' | 'damask' | 'floral' | 'none';
    opacity: number;
}

export interface Theme {
    id: ThemeId;
    mode: ThemeMode;
    nameKey: string;
    descriptionKey: string;
    name: string;
    description: string;
    isPremium: boolean;
    pattern?: ThemePattern;
    tokens: ThemeTokens;
    colors: {
        primary: string;
        primaryLight: string;
        primaryDark: string;
        accent: string;
        background: string;
        surface: string;
    };
}

type ThemeInput = Omit<Theme, "tokens"> & { tokens?: Partial<ThemeTokens> };

const createTheme = (input: ThemeInput): Theme => {
    const { colors, mode, tokens: overrides, ...theme } = input;
    const isLight = mode === "light";

    return {
        ...theme,
        mode,
        colors,
        tokens: {
            canvas: colors.background,
            surface: colors.surface,
            surfaceSubtle: isLight ? "248 250 252" : "30 41 59",
            textStrong: isLight ? "15 23 42" : "255 255 255",
            text: isLight ? "51 65 85" : "226 232 240",
            textMuted: isLight ? "71 85 105" : "148 163 184",
            primary: colors.primary,
            primaryStrong: colors.primaryDark,
            primaryForeground: "255 255 255",
            accent: colors.accent,
            accentForeground: isLight ? "63 39 51" : "15 23 42",
            info: "96 165 250",
            success: "52 211 153",
            warning: "251 191 36",
            danger: "248 113 113",
            dangerForeground: "255 255 255",
            border: isLight ? "226 232 240" : "255 255 255",
            ring: colors.primaryLight,
            shadowCard: isLight ? "0 4px 20px rgb(15 23 42 / 0.08)" : "0 4px 20px rgb(0 0 0 / 0.24)",
            shadowFloating: isLight ? "0 12px 32px rgb(15 23 42 / 0.16)" : "0 12px 32px rgb(0 0 0 / 0.4)",
            radiusControl: "0.625rem",
            radiusCard: "0.75rem",
            spacePage: "1rem",
            spaceSection: "1.5rem",
            fontUi: "system-ui, -apple-system, \"Segoe UI\", sans-serif",
            fontReading: "Amiri, Lateef, serif",
            fontEditorial: "Lora, Georgia, serif",
            readerLineHeight: "1.9",
            ...overrides,
        },
    };
};

export const THEMES: Record<ThemeId, Theme> = {
    default: createTheme({
        id: "default",
        mode: "dark",
        nameKey: "themeDefaultName",
        descriptionKey: "themeDefaultDescription",
        name: "Default",
        description: "Tema gelap klasik dengan aksen hijau emerald",
        isPremium: false,
        colors: {
            primary: "16 185 129", // emerald-500
            primaryLight: "52 211 153", // emerald-400
            primaryDark: "5 150 105", // emerald-600
            accent: "251 191 36", // amber-400
            background: "10 10 10", // near black
            surface: "15 23 42", // slate-900
        },
        tokens: { primaryStrong: "4 120 87" },
    }),
    daylight: createTheme({
        id: "daylight",
        mode: "light",
        nameKey: "themeDaylightName",
        descriptionKey: "themeDaylightDescription",
        name: "Daylight ☀️",
        description: "Cerah, ringan, dan nyaman untuk siang hari",
        isPremium: false,
        colors: {
            primary: "16 185 129",     // emerald-500
            primaryLight: "52 211 153",// emerald-400
            primaryDark: "5 150 105",  // emerald-600
            accent: "245 158 11",      // amber-500
            background: "248 250 252", // slate-50 (light)
            surface: "255 255 255",    // white
        },
        tokens: { primaryStrong: "4 120 87", border: "203 213 225" },
    }),
    midnight: createTheme({
        id: "midnight",
        mode: "dark",
        nameKey: "themeMidnightName",
        descriptionKey: "themeMidnightDescription",
        name: "Midnight",
        description: "Biru gelap malam dengan bintang berkilauan",
        isPremium: true,
        pattern: {
            type: 'stars',
            opacity: 0.25,
        },
        colors: {
            primary: "59 130 246", // blue-500
            primaryLight: "96 165 250", // blue-400
            primaryDark: "37 99 235", // blue-600
            accent: "147 197 253", // blue-300
            background: "3 7 18", // very dark blue
            surface: "30 41 59", // slate-800 with blue tint
        },
        tokens: { primaryStrong: "194 65 12" },
    }),
    sunset: createTheme({
        id: "sunset",
        mode: "dark",
        nameKey: "themeSunsetName",
        descriptionKey: "themeSunsetDescription",
        name: "Sunset",
        description: "Kehangatan senja dengan gelombang lembut",
        isPremium: true,
        pattern: {
            type: 'waves',
            opacity: 0.12,
        },
        colors: {
            primary: "251 146 60", // orange-400
            primaryLight: "253 186 116", // orange-300
            primaryDark: "249 115 22", // orange-500
            accent: "251 191 36", // amber-400
            background: "12 10 9", // warm black
            surface: "41 37 36", // stone-800
        },
        tokens: { primaryStrong: "109 40 217" },
    }),
    lavender: createTheme({
        id: "lavender",
        mode: "dark",
        nameKey: "themeLavenderName",
        descriptionKey: "themeLavenderDescription",
        name: "Lavender",
        description: "Ungu spiritual dengan motif geometric islami",
        isPremium: true,
        pattern: {
            type: 'geometric',
            opacity: 0.10,
        },
        colors: {
            primary: "139 92 246", // violet-500
            primaryLight: "167 139 250", // violet-400
            primaryDark: "124 58 237", // violet-600
            accent: "196 181 253", // violet-300
            background: "10 8 15", // dark purple-black
            surface: "46 16 101", // purple-900
        },
        tokens: { primaryStrong: "15 118 110" },
    }),
    ocean: createTheme({
        id: "ocean",
        mode: "dark",
        nameKey: "themeOceanName",
        descriptionKey: "themeOceanDescription",
        name: "Ocean",
        description: "Teal segar dengan riak air yang menenangkan",
        isPremium: true,
        pattern: {
            type: 'organic',
            opacity: 0.18,
        },
        colors: {
            primary: "20 184 166", // teal-500
            primaryLight: "45 212 191", // teal-400
            primaryDark: "15 118 110", // teal-700
            accent: "103 232 249", // cyan-300
            background: "4 12 12", // dark teal-black
            surface: "19 78 74", // teal-900
        },
        tokens: { primaryStrong: "159 18 57" },
    }),
    royal: createTheme({
        id: "royal",
        mode: "dark",
        nameKey: "themeRoyalName",
        descriptionKey: "themeRoyalDescription",
        name: "Royal",
        description: "Merah burgundy elegan dengan motif damask",
        isPremium: true,
        pattern: {
            type: 'damask',
            opacity: 0.10,
        },
        colors: {
            primary: "225 29 72", // rose-600
            primaryLight: "251 113 133", // rose-400
            primaryDark: "159 18 57", // rose-800
            accent: "244 63 94", // rose-500
            background: "12 7 9", // dark rose-black
            surface: "76 5 25", // rose-950
        },
        tokens: { primaryStrong: "159 18 57" },
    }),
    blossom: createTheme({
        id: "blossom",
        mode: "light",
        nameKey: "themeBlossomName",
        descriptionKey: "themeBlossomDescription",
        name: "Blossom",
        description: "Merah muda lembut dengan sentuhan bunga yang elegan",
        isPremium: true,
        pattern: {
            type: "floral",
            opacity: 0.08,
        },
        colors: {
            // Soft blush accents; primaryStrong remains dark enough for white-text actions.
            primary: "224 155 178",
            primaryLight: "245 211 222",
            primaryDark: "171 86 115",
            accent: "222 151 176",
            background: "255 247 250",
            surface: "255 250 252",
        },
        tokens: {
            surfaceSubtle: "253 236 243",
            textStrong: "66 40 52",
            text: "83 56 69",
            textMuted: "112 82 97",
            primaryStrong: "132 45 75",
            accentForeground: "66 40 52",
            border: "236 203 217",
            ring: "190 88 122",
        },
    }),
};

const THEME_TOKEN_CSS_NAMES: Record<ThemeToken, string> = {
    canvas: "--color-canvas",
    surface: "--color-surface",
    surfaceSubtle: "--color-surface-subtle",
    textStrong: "--color-text-strong",
    text: "--color-text",
    textMuted: "--color-text-muted",
    primary: "--color-primary",
    primaryStrong: "--color-primary-strong",
    primaryForeground: "--color-primary-foreground",
    accent: "--color-accent",
    accentForeground: "--color-accent-foreground",
    info: "--color-info",
    success: "--color-success",
    warning: "--color-warning",
    danger: "--color-danger",
    dangerForeground: "--color-danger-foreground",
    border: "--color-border",
    ring: "--color-ring",
    shadowCard: "--shadow-card",
    shadowFloating: "--shadow-floating",
    radiusControl: "--radius-control",
    radiusCard: "--radius-card",
    spacePage: "--space-page",
    spaceSection: "--space-section",
    fontUi: "--font-ui",
    fontReading: "--font-reading",
    fontEditorial: "--font-editorial",
    readerLineHeight: "--reader-line-height",
};

export const hasCompleteThemeTokens = (theme: Theme): boolean =>
    Object.keys(THEME_TOKEN_CSS_NAMES).every((token) => {
        const value = theme.tokens[token as ThemeToken];
        return typeof value === "string" && value.trim().length > 0;
    });

export function applyTheme(theme: Theme): void {
    const validTheme = hasCompleteThemeTokens(theme) ? theme : THEMES.default;
    const root = document.documentElement;

    Object.entries(validTheme.tokens).forEach(([token, value]) => {
        root.style.setProperty(THEME_TOKEN_CSS_NAMES[token as ThemeToken], value);
    });

    // Compatibility variables for screens that have not migrated yet.
    root.style.setProperty("--color-primary-light", validTheme.colors.primaryLight);
    root.style.setProperty("--color-primary-dark", validTheme.colors.primaryDark);
    root.style.setProperty("--color-background", validTheme.colors.background);

    root.dataset.theme = validTheme.id;
    root.dataset.colorMode = validTheme.mode;
    root.style.colorScheme = validTheme.mode;
}

interface ThemeContextType {
    currentTheme: ThemeId;
    setTheme: (themeId: ThemeId) => void;
    theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<ThemeId>("default");

    // Resolve persisted theme before the first client paint without changing
    // the server/client render output used for hydration.
    useIsomorphicLayoutEffect(() => {
        const saved = getStorageService().getOptional(STORAGE_KEYS.SETTINGS_THEME) as ThemeId;
        const resolvedTheme = saved && THEMES[saved] ? saved : "default";
        if (resolvedTheme !== currentTheme) setCurrentTheme(resolvedTheme);
        applyTheme(THEMES[resolvedTheme]);
        document.documentElement.classList.remove("theme-loading");
    }, []);

    useIsomorphicLayoutEffect(() => {
        applyTheme(THEMES[currentTheme] || THEMES.default);
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
                theme: THEMES[currentTheme] || THEMES['default'],
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
