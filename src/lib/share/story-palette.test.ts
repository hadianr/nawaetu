import { describe, expect, it } from "vitest";
import { THEMES } from "@/context/ThemeContext";
import { buildStoryPalette, DARK_PALETTE, LIGHT_PALETTE, type StoryPalette } from "./story-palette";

type RGB = [number, number, number];
const parse = (color: string): { rgb: RGB; alpha: number } => {
    const hex = color.match(/^#([0-9a-f]{6})$/i);
    if (hex) return { rgb: [0, 2, 4].map(i => parseInt(hex[1].slice(i, i + 2), 16)) as RGB, alpha: 1 };
    const parts = color.match(/^rgba?\(([^)]+)\)$/)![1].split(",").map(Number);
    return { rgb: parts.slice(0, 3) as RGB, alpha: parts.length === 4 ? parts[3] : 1 };
};
const over = (fg: string, bg: string): RGB => {
    const { rgb, alpha } = parse(fg);
    const base = parse(bg).rgb;
    return rgb.map((c, i) => c * alpha + base[i] * (1 - alpha)) as RGB;
};
const luminance = ([r, g, b]: RGB) => {
    const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const contrast = (fg: string, bg: string) => {
    const [a, b] = [luminance(over(fg, bg)), luminance(parse(bg).rgb)].sort((x, y) => y - x);
    return (a + 0.05) / (b + 0.05);
};

const fromTheme = (id: keyof typeof THEMES): StoryPalette => {
    const { mode, tokens } = THEMES[id];
    return buildStoryPalette({ mode, ...tokens });
};

describe("buildStoryPalette", () => {
    it.each(Object.keys(THEMES) as (keyof typeof THEMES)[])("%s: every text color is readable on the card background", id => {
        const palette = fromTheme(id);
        for (const background of palette.bg) {
            for (const name of ["arabic", "heading", "label", "body", "muted", "pillText", "panelText"] as const) {
                const against = name === "pillText" ? palette.bg[0] : background;
                expect(contrast(palette[name], against), `${id} ${name}`).toBeGreaterThanOrEqual(4.5);
            }
        }
    });

    it("follows the theme's mode: dark themes get a dark card with a glow, light themes a pale one", () => {
        const dark = fromTheme("midnight");
        const light = fromTheme("blossom");
        expect(dark.mode).toBe("dark");
        expect(light.mode).toBe("light");
        expect(luminance(parse(dark.bg[1]).rgb)).toBeLessThan(0.1);
        expect(luminance(parse(light.bg[1]).rgb)).toBeGreaterThan(0.7);
        expect(dark.glow).toBeTruthy();
        expect(light.glow).toBeTruthy();
    });

    it("tints each card with its theme's own primary, so the themes look different", () => {
        const backgrounds = new Set(Object.keys(THEMES).map(id => fromTheme(id as keyof typeof THEMES).bg[1]));
        expect(backgrounds.size).toBe(Object.keys(THEMES).length);
    });

    it("keeps the original Dark Emerald and Light Ceramic looks as the defaults", () => {
        expect(DARK_PALETTE.bg).toEqual(["#042017", "#083324", "#02120d"]);
        expect(DARK_PALETTE.glow).toBeUndefined();
        expect(LIGHT_PALETTE.bg).toEqual(["#f8fafc", "#f1f5f9", "#e2e8f0"]);
    });
});
