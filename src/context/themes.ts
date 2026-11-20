
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

export type ThemeId =
    | "emerald"
    | "daylight"
    | "midnight"
    | "sunset"
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
    | "accentStrong"
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
    | "readerLineHeight"
    | "glassBlur"
    | "glassSaturation"
    | "glassBackgroundOpacity"
    | "glassBorderOpacity"
    | "glassRadius"
    | "glassTint";

export type ThemeTokens = Record<ThemeToken, string>;

export interface ThemePattern {
    type: 'stars' | 'waves' | 'floral' | 'none';
    opacity: number;
}

export interface Theme {
    id: ThemeId;
    mode: ThemeMode;
    nameKey: string;
    descriptionKey: string;
    name: string;
    description: string;
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
            // Dark themes need a luminous accent for text and controls; light
            // themes use the darker shade for contrast on pale surfaces.
            primaryStrong: isLight ? colors.primaryDark : colors.primaryLight,
            // Text on a solid primary fill. Dark ink passes AA on the bright primaries;
            // Daylight's deep emerald (and any other dark primary) overrides it with white.
            primaryForeground: isLight ? "255 255 255" : "15 23 42",
            accent: colors.accent,
            // Accent as text; light themes override it with a deeper shade that passes AA.
            accentStrong: colors.accent,
            accentForeground: isLight ? "63 39 51" : "15 23 42",
            // Stock 400 shades disappear on pale surfaces, so light themes use the 700 shades (AA on paper).
            info: isLight ? "29 78 216" : "96 165 250",
            success: isLight ? "21 128 61" : "52 211 153",
            warning: isLight ? "161 98 7" : "251 191 36",
            danger: isLight ? "185 28 28" : "248 113 113",
            dangerForeground: "255 255 255",
            // Keep dark-theme borders quiet; components may add opacity on top.
            border: isLight ? "226 232 240" : "51 65 85",
            ring: colors.primaryLight,
            shadowCard: isLight ? "0 4px 20px rgb(15 23 42 / 0.08)" : "0 4px 20px rgb(0 0 0 / 0.24)",
            shadowFloating: isLight ? "0 12px 32px rgb(15 23 42 / 0.16)" : "0 12px 32px rgb(0 0 0 / 0.4)",
            radiusControl: "0.625rem",
            radiusCard: "0.75rem",
            spacePage: "1rem",
            spaceSection: "1.5rem",
            // Families loaded with next/font in layout.tsx; the rest are fallbacks while they load.
            fontUi: "var(--font-face-ui), system-ui, -apple-system, \"Segoe UI\", sans-serif",
            fontReading: "var(--font-face-arabic), serif",
            fontEditorial: "var(--font-face-display), Georgia, serif",
            readerLineHeight: "1.9",
            glassBlur: isLight ? "14px" : "18px",
            glassSaturation: isLight ? "1.25" : "1.2",
            glassBackgroundOpacity: isLight ? "0.54" : "0.48",
            glassBorderOpacity: isLight ? "0.44" : "0.24",
            glassRadius: "1.25rem",
            glassTint: isLight ? "255 255 255" : colors.surface,
            ...overrides,
        },
    };
};

export const THEMES: Record<ThemeId, Theme> = {
    emerald: createTheme({
        id: "emerald",
        mode: "dark",
        nameKey: "themeEmeraldName",
        descriptionKey: "themeEmeraldDescription",
        name: "Emerald",
        description: "Tema gelap yang tenang dengan aksen hijau emerald dan emas",
        // Brand emerald and gold from the app icon, on warm green-black neutrals.
        colors: {
            primary: "52 168 118",       // #34A876
            primaryLight: "94 196 148",  // #5EC494
            primaryDark: "31 138 92",    // #1F8A5C
            accent: "214 172 86",        // #D6AC56 brand gold
            background: "14 19 17",      // #0E1311
            surface: "22 29 26",         // #161D1A
        },
        tokens: {
            surfaceSubtle: "30 39 35",
            textStrong: "240 237 228",
            text: "208 212 206",
            textMuted: "146 156 150",
            primaryForeground: "14 19 17",
            accentForeground: "14 19 17",
            border: "44 54 49",
        },
    }),
    daylight: createTheme({
        id: "daylight",
        mode: "light",
        nameKey: "themeDaylightName",
        descriptionKey: "themeDaylightDescription",
        name: "Daylight",
        description: "Cerah, ringan, dan nyaman untuk siang hari",
        // Default for new users: warm paper, green-black ink, brand emerald and gold.
        colors: {
            primary: "21 128 87",        // #158057 brand emerald
            primaryLight: "61 164 118",  // #3DA476
            primaryDark: "14 99 66",     // #0E6342
            accent: "184 137 46",        // #B8892E brand gold, highlights only
            background: "250 248 243",   // #FAF8F3
            surface: "255 255 255",
        },
        tokens: {
            surfaceSubtle: "243 240 232",
            textStrong: "23 33 28",
            text: "52 64 58",
            textMuted: "90 102 95",
            primaryStrong: "14 99 66",
            accentStrong: "138 99 22",
            accentForeground: "23 33 28",
            border: "228 223 211",
            ring: "21 128 87",
            shadowCard: "0 1px 2px rgb(23 33 28 / 0.05), 0 1px 1px rgb(23 33 28 / 0.03)",
            shadowFloating: "0 12px 32px rgb(23 33 28 / 0.12)",
        },
    }),
    midnight: createTheme({
        id: "midnight",
        mode: "dark",
        nameKey: "themeMidnightName",
        descriptionKey: "themeMidnightDescription",
        name: "Midnight",
        description: "Biru gelap malam dengan bintang berkilauan",
        pattern: {
            type: 'stars',
            opacity: 0.12,
        },
        colors: {
            primary: "59 130 246", // blue-500
            primaryLight: "96 165 250", // blue-400
            primaryDark: "37 99 235", // blue-600
            accent: "147 197 253", // blue-300
            background: "3 7 18", // very dark blue
            surface: "30 41 59", // slate-800 with blue tint
        },
    }),
    sunset: createTheme({
        id: "sunset",
        mode: "dark",
        nameKey: "themeSunsetName",
        descriptionKey: "themeSunsetDescription",
        name: "Sunset",
        description: "Kehangatan senja dengan gelombang lembut",
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
    }),
    blossom: createTheme({
        id: "blossom",
        mode: "light",
        nameKey: "themeBlossomName",
        descriptionKey: "themeBlossomDescription",
        name: "Blossom",
        description: "Merah muda lembut dengan sentuhan bunga yang elegan",
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
            primaryForeground: "66 40 52",
            accentStrong: "158 62 98",
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
    accentStrong: "--color-accent-strong",
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
    glassBlur: "--glass-blur",
    glassSaturation: "--glass-saturation",
    glassBackgroundOpacity: "--glass-background-opacity",
    glassBorderOpacity: "--glass-border-opacity",
    glassRadius: "--glass-radius",
    glassTint: "--glass-tint",
};

export const hasCompleteThemeTokens = (theme: Theme): boolean =>
    Object.keys(THEME_TOKEN_CSS_NAMES).every((token) => {
        const value = theme.tokens[token as ThemeToken];
        return typeof value === "string" && value.trim().length > 0;
    });


/** Theme for anyone who has not saved one. Saved choices are always kept. */
export const DEFAULT_THEME_ID: ThemeId = "daylight";

/** Ids saved by older versions (in localStorage and synced settings), read as their current theme. */
const LEGACY_THEME_IDS: Record<string, ThemeId> = { default: "emerald" };

const hasOwn = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);

/** The theme for a saved value: legacy ids map to their new name, anything unknown gets the default. */
export function resolveThemeId(saved: unknown): ThemeId {
    if (typeof saved !== "string") return DEFAULT_THEME_ID;
    const id = hasOwn(LEGACY_THEME_IDS, saved) ? LEGACY_THEME_IDS[saved] : saved;
    return hasOwn(THEMES, id) ? (id as ThemeId) : DEFAULT_THEME_ID;
}

/** Every CSS variable a theme sets on <html>, shared by applyTheme and the pre-paint script. */
export function themeCssVariables(theme: Theme): { id: ThemeId; mode: ThemeMode; variables: Record<string, string> } {
    const valid = hasCompleteThemeTokens(theme) ? theme : THEMES[DEFAULT_THEME_ID];
    const variables: Record<string, string> = {};
    (Object.keys(valid.tokens) as ThemeToken[]).forEach((token) => {
        variables[THEME_TOKEN_CSS_NAMES[token]] = valid.tokens[token];
    });
    // Compatibility variables for screens that have not migrated yet.
    variables["--color-primary-light"] = valid.colors.primaryLight;
    variables["--color-primary-dark"] = valid.colors.primaryDark;
    variables["--color-background"] = valid.colors.background;
    return { id: valid.id, mode: valid.mode, variables };
}

/** JSON for an inline <script>: escapes characters that could close the tag or end a JS string. */
function scriptJson(value: unknown): string {
    return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

/**
 * Inline <head> script that applies the saved theme before first paint, so returning
 * users never see a flash of the wrong theme. Mirrors applyTheme.
 */
export function prePaintThemeScript(storageKey: string): string {
    const themes = Object.fromEntries(
        Object.values(THEMES).map((theme) => {
            const { mode, variables } = themeCssVariables(theme);
            return [theme.id, { m: mode, v: variables }];
        }),
    );
    return `(function(){try{var t=${scriptJson(themes)},a=${scriptJson(LEGACY_THEME_IDS)},h=function(o,k){return Object.prototype.hasOwnProperty.call(o,k)},s=null;try{s=localStorage.getItem(${scriptJson(storageKey)})}catch(e){}if(s&&h(a,s))s=a[s];var id=s&&h(t,s)?s:${scriptJson(DEFAULT_THEME_ID)},x=t[id],r=document.documentElement;for(var k in x.v)r.style.setProperty(k,x.v[k]);r.setAttribute("data-theme",id);r.setAttribute("data-color-mode",x.m);r.style.colorScheme=x.m}catch(e){}})();`;
}
