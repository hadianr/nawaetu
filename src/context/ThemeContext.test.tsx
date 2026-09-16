/**
 * @vitest-environment jsdom
 */
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";

import {
    applyTheme,
    hasCompleteThemeTokens,
    THEMES,
    ThemeProvider,
    useTheme,
} from "@/context/ThemeContext";
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
            "default",
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
        expect(THEMES.blossom.isPremium).toBe(true);
    });

    it("persists a selected theme using the existing storage key", async () => {
        render(
            <ThemeProvider>
                <ThemeProbe />
            </ThemeProvider>
        );

        await waitFor(() => expect(screen.getByTestId("theme")).toHaveTextContent("default"));
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

        await waitFor(() => expect(screen.getByTestId("theme")).toHaveTextContent("default"));
        expect(window.localStorage.getItem(STORAGE_KEYS.SETTINGS_THEME)).toBe("unknown-theme");
    });
});
