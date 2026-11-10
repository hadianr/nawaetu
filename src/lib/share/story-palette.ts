/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Colors for the story card. Pure functions, so any app theme can drive the card and be tested without a canvas.
 */

export type StoryTheme = "dark" | "light";

/** Every color the card uses, so any app theme can drive it. */
export interface StoryPalette {
    mode: StoryTheme;
    bg: [top: string, middle: string, bottom: string];
    /** Soft light behind the content; omitted by the original palettes. */
    glow?: string;
    pattern: string;
    patternAlpha: number;
    frame: string;
    pillBg: string;
    pillBorder: string;
    pillText: string;
    arabic: string;
    heading: string;
    label: string;
    body: string;
    muted: string;
    panelBg: string;
    panelBorder: string;
    panelText: string;
    cardBg: string;
    watermark: string;
}

/** The original Dark Emerald look. Used when no palette is passed. */
export const DARK_PALETTE: StoryPalette = {
    mode: "dark",
    bg: ["#042017", "#083324", "#02120d"],
    pattern: "#34d399",
    patternAlpha: 0.055,
    frame: "rgba(52, 211, 153, 0.25)",
    pillBg: "rgba(6, 40, 28, 0.95)",
    pillBorder: "#34d399",
    pillText: "#6ee7b7",
    arabic: "#6ee7b7",
    heading: "#d1fae5",
    label: "#a7f3d0",
    body: "#f8fafc",
    muted: "rgba(255, 255, 255, 0.7)",
    panelBg: "rgba(6, 40, 28, 0.6)",
    panelBorder: "rgba(52, 211, 153, 0.4)",
    panelText: "rgba(255, 255, 255, 0.9)",
    cardBg: "rgba(6, 40, 28, 0.78)",
    watermark: "rgba(255, 255, 255, 0.5)",
};

/** The original Light Ceramic look. Used when no palette is passed. */
export const LIGHT_PALETTE: StoryPalette = {
    mode: "light",
    bg: ["#f8fafc", "#f1f5f9", "#e2e8f0"],
    pattern: "#10b981",
    patternAlpha: 0.045,
    frame: "rgba(16, 185, 129, 0.2)",
    pillBg: "rgba(241, 245, 249, 0.95)",
    pillBorder: "#10b981",
    pillText: "#047857",
    arabic: "#065f46",
    heading: "#065f46",
    label: "#047857",
    body: "#1e293b",
    muted: "#64748b",
    panelBg: "rgba(16, 185, 129, 0.08)",
    panelBorder: "rgba(16, 185, 129, 0.3)",
    panelText: "#334155",
    cardBg: "rgba(255, 247, 237, 0.88)",
    watermark: "rgba(15, 23, 42, 0.5)",
};

/** The app theme tokens the card needs; each is an "r g b" string, as in ThemeContext. */
export interface StoryThemeInput {
    mode: StoryTheme;
    canvas: string;
    primary: string;
    primaryStrong: string;
    text: string;
    textStrong: string;
    textMuted: string;
}

type RGB = [number, number, number];
const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];
const parseRgb = (value: string): RGB => {
    const [r, g, b] = value.trim().split(/\s+/).map(Number);
    return [r || 0, g || 0, b || 0];
};
const mix = (a: RGB, b: RGB, amount: number): RGB => a.map((channel, i) => Math.round(channel + (b[i] - channel) * amount)) as RGB;
const css = (color: RGB, alpha = 1) => (alpha === 1 ? `rgb(${color.join(", ")})` : `rgba(${color.join(", ")}, ${alpha})`);

/**
 * Builds a card palette from an app theme: a gradient from the theme's own background tinted with its primary,
 * the star pattern and glow in the primary, text from the theme's text tokens. Clean on every theme, light or dark.
 */
export function buildStoryPalette(theme: StoryThemeInput): StoryPalette {
    const canvas = parseRgb(theme.canvas);
    const primary = parseRgb(theme.primary);
    const strong = parseRgb(theme.primaryStrong);
    const textStrong = parseRgb(theme.textStrong);
    const text = parseRgb(theme.text);
    const muted = parseRgb(theme.textMuted);

    if (theme.mode === "dark") {
        const accentText = css(mix(strong, WHITE, 0.3));
        const tint = mix(canvas, primary, 0.18);
        return {
            mode: "dark",
            bg: [css(mix(canvas, primary, 0.12)), css(mix(canvas, primary, 0.22)), css(mix(canvas, primary, 0.05))],
            glow: css(primary, 0.2),
            pattern: css(strong),
            patternAlpha: 0.055,
            frame: css(strong, 0.25),
            pillBg: css(tint, 0.95),
            pillBorder: css(strong),
            pillText: accentText,
            arabic: accentText,
            heading: css(mix(strong, WHITE, 0.6)),
            label: css(mix(strong, WHITE, 0.45)),
            body: css(textStrong),
            muted: css(textStrong, 0.7),
            panelBg: css(tint, 0.6),
            panelBorder: css(strong, 0.4),
            panelText: css(textStrong, 0.9),
            cardBg: css(tint, 0.78),
            watermark: css(textStrong, 0.5),
        };
    }
    const deep = css(mix(strong, BLACK, 0.3));
    return {
        mode: "light",
        bg: [css(mix(canvas, primary, 0.04)), css(mix(canvas, primary, 0.09)), css(mix(canvas, primary, 0.16))],
        glow: css(primary, 0.14),
        pattern: css(strong),
        patternAlpha: 0.045,
        frame: css(strong, 0.22),
        pillBg: css(mix(canvas, WHITE, 0.6), 0.95),
        pillBorder: css(strong),
        pillText: css(mix(strong, BLACK, 0.15)),
        arabic: deep,
        heading: deep,
        label: css(mix(strong, BLACK, 0.15)),
        body: css(textStrong),
        muted: css(muted),
        panelBg: css(primary, 0.08),
        panelBorder: css(strong, 0.3),
        panelText: css(text),
        cardBg: css(mix(canvas, WHITE, 0.5), 0.88),
        watermark: css(textStrong, 0.5),
    };
}
