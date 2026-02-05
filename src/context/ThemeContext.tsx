"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

export type ThemeId = "default" | "midnight" | "sunset" | "lavender" | "ocean" | "royal";

export interface ThemePattern {
    type: 'geometric' | 'organic' | 'stars' | 'waves' | 'damask' | 'none';
    opacity: number;
}

export interface Theme {
    id: ThemeId;
    name: string;
    description: string;
    isPremium: boolean;
    pattern?: ThemePattern;
    colors: {
        primary: string;
        primaryLight: string;
        primaryDark: string;
        accent: string;
        background: string;
        surface: string;
    };
}

export const THEMES: Record<ThemeId, Theme> = {
    default: {
        id: "default",
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
    },
    midnight: {
        id: "midnight",
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
    },
    sunset: {
        id: "sunset",
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
    },
    lavender: {
        id: "lavender",
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
    },
    ocean: {
        id: "ocean",
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
    },
    royal: {
        id: "royal",
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
    },
};

interface ThemeContextType {
    currentTheme: ThemeId;
    setTheme: (themeId: ThemeId) => void;
    theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<ThemeId>("default");

    // Load saved theme on mount
    useEffect(() => {
        const storage = getStorageService();
        const saved = storage.getOptional(STORAGE_KEYS.SETTINGS_THEME) as ThemeId;
        if (saved && THEMES[saved]) {
            setCurrentTheme(saved);
        }
    }, []);

    // Apply theme to document
    useEffect(() => {
        const theme = THEMES[currentTheme];
        const root = document.documentElement;

        // Apply CSS variables
        root.style.setProperty("--color-primary", theme.colors.primary);
        root.style.setProperty("--color-primary-light", theme.colors.primaryLight);
        root.style.setProperty("--color-primary-dark", theme.colors.primaryDark);
        root.style.setProperty("--color-accent", theme.colors.accent);
        root.style.setProperty("--color-background", theme.colors.background);
        root.style.setProperty("--color-surface", theme.colors.surface);

        // Also set data attribute for potential CSS selectors
        root.setAttribute("data-theme", currentTheme);
    }, [currentTheme]);

    const setTheme = (themeId: ThemeId) => {
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
                theme: THEMES[currentTheme],
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
