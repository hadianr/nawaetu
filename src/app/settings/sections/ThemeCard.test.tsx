// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { THEMES } from "@/context/ThemeContext";
import ThemeCard from "./ThemeCard";

const t = { themeTitle: "App Appearance", themeModeLight: "Light", themeModeDark: "Dark" } as never;

describe("ThemeCard", () => {
    it("lists every theme once in a single row, light themes first, and marks only the chosen one", () => {
        render(<ThemeCard t={t} currentTheme="midnight" handleThemeSelect={vi.fn()} />);

        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(Object.keys(THEMES).length);
        expect(buttons.filter((button) => button.getAttribute("aria-pressed") === "true")).toHaveLength(1);
        expect(screen.getByRole("button", { name: /^Midnight:/ }).getAttribute("aria-pressed")).toBe("true");

        // No Light / Dark labels or groups, and the light themes come before the dark ones.
        expect(screen.queryByRole("region")).toBeNull();
        expect(screen.queryByText("Light")).toBeNull();
        expect(screen.queryByText("Dark")).toBeNull();
        const modes = buttons.map((button) => Object.values(THEMES).find((theme) => button.getAttribute("title") === theme.name)?.mode);
        expect(modes.join(",")).toBe([...modes].sort((a, b) => (a === "light" ? -1 : 1) - (b === "light" ? -1 : 1)).join(","));
        expect(modes[0]).toBe("light");
        expect(modes.at(-1)).toBe("dark");
    });

    it("shows the chosen theme's name once, beside the title, instead of a label under every swatch", () => {
        render(<ThemeCard t={t} currentTheme="blossom" handleThemeSelect={vi.fn()} />);
        expect(screen.getByTestId("theme-chosen").textContent).toBe(THEMES.blossom.name);
        // A name is still available to everyone, on every swatch, through its accessible name and tooltip.
        const swatch = screen.getByRole("button", { name: new RegExp(`^${THEMES.daylight.name}:`) });
        expect(swatch.getAttribute("title")).toBe(THEMES.daylight.name);
    });

    it("selects a theme on click, with no gate: every theme is free", () => {
        const select = vi.fn();
        render(<ThemeCard t={t} currentTheme="midnight" handleThemeSelect={select} />);
        for (const theme of Object.values(THEMES)) {
            fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${theme.name}:`) }));
            expect(select).toHaveBeenLastCalledWith(theme.id);
        }
        expect(select).toHaveBeenCalledTimes(Object.keys(THEMES).length);
    });

    it("carries no premium markers and does not scroll sideways", () => {
        const { container } = render(<ThemeCard t={t} currentTheme="midnight" handleThemeSelect={vi.fn()} />);
        expect(container.querySelector("svg.lucide-lock, svg.lucide-crown")).toBeNull();
        expect(container.querySelector(".overflow-x-auto, .scrollbar-hide, .snap-x, .flex-wrap")).toBeNull();
        expect(container.querySelector(".grayscale")).toBeNull(); // no swatch is dimmed as if it were locked
    });
});
