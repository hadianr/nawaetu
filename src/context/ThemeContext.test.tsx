/**
 * @vitest-environment jsdom
 */
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";

import {
    applyTheme,
    DEFAULT_THEME_ID,
    hasCompleteThemeTokens,
    THEMES,
    ThemeProvider,
    useTheme,
} from "@/context/ThemeContext";
import { prePaintThemeScript } from "@/context/themes";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { SETTINGS_EN } from "@/data/translations/en";
import { SETTINGS_ID } from "@/data/translations/id";

function ThemeProbe() {
    const { currentTheme, setTheme, theme } = useTheme();

    return (
        <div>
            <span data-testid="theme">{currentTheme}</span>
            <span data-testid="mode">{theme.mode}</span>
            <button type="button" onClick={() => setTheme("blossom")}>Blossom</button>
        </div>
    );
}

describe("ThemeContext", () => {
    beforeEach(() => {
        window.localStorage.clear();
        document.documentElement.removeAttribute("data-theme");
        document.documentElement.removeAttribute("data-color-mode");
        document.documentElement.style.cssText = "";
    });

    it("defines complete tokens for every theme", () => {
        expect(Object.keys(THEMES)).toEqual(expect.arrayContaining([
            "emerald",
            "daylight",
            "blossom",
        ]));
        Object.values(THEMES).forEach((theme) => {
            expect(hasCompleteThemeTokens(theme)).toBe(true);
        });
    });

    it("has translated names and descriptions for every theme", () => {
        Object.values(THEMES).forEach((theme) => {
            expect(typeof SETTINGS_EN[theme.nameKey as keyof typeof SETTINGS_EN]).toBe("string");
            expect(typeof SETTINGS_EN[theme.descriptionKey as keyof typeof SETTINGS_EN]).toBe("string");
            expect(typeof SETTINGS_ID[theme.nameKey as keyof typeof SETTINGS_ID]).toBe("string");
            expect(typeof SETTINGS_ID[theme.descriptionKey as keyof typeof SETTINGS_ID]).toBe("string");
        });
    });

    it("applies the blossom theme and mode to the document", () => {
        applyTheme(THEMES.blossom);

        expect(document.documentElement.dataset.theme).toBe("blossom");
        expect(document.documentElement.dataset.colorMode).toBe("light");
        expect(document.documentElement.style.colorScheme).toBe("light");
        expect(document.documentElement.style.getPropertyValue("--color-primary")).toBe("224 155 178");
        expect(document.documentElement.style.getPropertyValue("--color-primary-strong")).toBe("132 45 75");
        expect(document.documentElement.style.getPropertyValue("--glass-blur")).toBe("14px");
        expect(document.documentElement.style.getPropertyValue("--glass-saturation")).toBe("1.25");
        expect(document.documentElement.style.getPropertyValue("--glass-background-opacity")).toBe("0.54");
        expect(document.documentElement.style.getPropertyValue("--glass-border-opacity")).toBe("0.44");
        expect(document.documentElement.style.getPropertyValue("--glass-radius")).toBe("1.25rem");
        expect(document.documentElement.style.getPropertyValue("--glass-tint")).toBe("255 255 255");

        applyTheme(THEMES.emerald);
        expect(document.documentElement.dataset.colorMode).toBe("dark");
        expect(document.documentElement.style.getPropertyValue("--glass-blur")).toBe("18px");
        expect(document.documentElement.style.getPropertyValue("--glass-background-opacity")).toBe("0.48");
        expect(document.documentElement.style.getPropertyValue("--glass-tint")).toBe("22 29 26");
    });

    it("persists a selected theme using the existing storage key", async () => {
        render(
            <ThemeProvider>
                <ThemeProbe />
            </ThemeProvider>
        );

        await waitFor(() => expect(screen.getByTestId("theme")).toHaveTextContent("daylight"));
        act(() => screen.getByRole("button", { name: "Blossom" }).click());

        await waitFor(() => expect(screen.getByTestId("theme")).toHaveTextContent("blossom"));
        expect(window.localStorage.getItem(STORAGE_KEYS.SETTINGS_THEME)).toBe("blossom");
        expect(document.documentElement.dataset.colorMode).toBe("light");
    });

    it("falls back safely for an unknown persisted theme", async () => {
        window.localStorage.setItem(STORAGE_KEYS.SETTINGS_THEME, "unknown-theme");

        render(
            <ThemeProvider>
                <ThemeProbe />
            </ThemeProvider>
        );

        await waitFor(() => expect(screen.getByTestId("theme")).toHaveTextContent("daylight"));
        expect(window.localStorage.getItem(STORAGE_KEYS.SETTINGS_THEME)).toBe("unknown-theme");
    });

    it.each([
        ["emerald", "emerald"],
        ["default", "emerald"], // legacy id from older versions and synced settings
        ["midnight", "midnight"],
        ["sunset", "sunset"],
    ])("keeps a saved %s theme instead of the light default", async (saved, expected) => {
        window.localStorage.setItem(STORAGE_KEYS.SETTINGS_THEME, saved);

        render(
            <ThemeProvider>
                <ThemeProbe />
            </ThemeProvider>
        );

        await waitFor(() => expect(screen.getByTestId("theme")).toHaveTextContent(expected));
        expect(document.documentElement.dataset.colorMode).toBe("dark");
    });

    describe("pre-paint script", () => {
        const runScript = () => new Function(prePaintThemeScript(STORAGE_KEYS.SETTINGS_THEME))();
        const appliedStyle = () => document.documentElement.style.cssText;

        it("applies the light default when nothing is saved", () => {
            runScript();
            expect(document.documentElement.dataset.theme).toBe(DEFAULT_THEME_ID);
            expect(document.documentElement.dataset.colorMode).toBe("light");
            expect(document.documentElement.style.getPropertyValue("--color-canvas")).toBe("250 248 243");
        });

        it.each(Object.keys(THEMES))("sets exactly what applyTheme sets for a saved %s theme", (id) => {
            window.localStorage.setItem(STORAGE_KEYS.SETTINGS_THEME, id);
            runScript();
            const fromScript = appliedStyle();
            const datasetFromScript = { ...document.documentElement.dataset };

            document.documentElement.style.cssText = "";
            applyTheme(THEMES[id as keyof typeof THEMES]);

            expect(fromScript).toBe(appliedStyle());
            expect(datasetFromScript).toEqual({ ...document.documentElement.dataset });
        });

        it("reads the legacy \"default\" id as Emerald", () => {
            window.localStorage.setItem(STORAGE_KEYS.SETTINGS_THEME, "default");
            runScript();
            expect(document.documentElement.dataset.theme).toBe("emerald");
            expect(document.documentElement.dataset.colorMode).toBe("dark");
        });

        it("falls back to the default for an unknown saved value", () => {
            window.localStorage.setItem(STORAGE_KEYS.SETTINGS_THEME, "toString");
            runScript();
            expect(document.documentElement.dataset.theme).toBe(DEFAULT_THEME_ID);
        });
    });
});
