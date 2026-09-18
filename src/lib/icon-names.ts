export type AppIconName =
    | "bell" | "book" | "book-marked" | "calendar" | "cloud-sun" | "compass" | "droplets"
    | "fingerprint" | "hands" | "heart-handshake" | "home" | "kaaba" | "landmark" | "library"
    | "lock" | "moon" | "refresh" | "scroll" | "settings" | "shield-check" | "sliders"
    | "sparkles" | "star" | "sun" | "target" | "trophy" | "utensils" | "volume" | "warning" | "help";

const LEGACY_ICON_NAMES: Record<string, AppIconName> = {
    "🌙": "moon", "☀️": "sun", "🌤️": "cloud-sun", "🌅": "sun", "🌃": "moon", "🌆": "sun",
    "🌑": "moon", "✨": "sparkles", "❓": "help", "🤲": "hands", "📿": "hands", "🕌": "landmark",
    "🕋": "kaaba", "📖": "book", "📚": "library", "📅": "calendar", "🗓️": "calendar", "🔒": "lock", "💧": "droplets",
};

const APP_ICON_NAMES = new Set<AppIconName>([
    "bell", "book", "book-marked", "calendar", "cloud-sun", "compass", "droplets", "fingerprint", "hands",
    "heart-handshake", "home", "kaaba", "landmark", "library", "lock", "moon", "refresh", "scroll", "settings",
    "shield-check", "sliders", "sparkles", "star", "sun", "target", "trophy", "utensils", "volume", "warning", "help",
]);

export function resolveAppIconName(value?: string): AppIconName {
    if (value && APP_ICON_NAMES.has(value as AppIconName)) return value as AppIconName;
    return (value && LEGACY_ICON_NAMES[value]) || "help";
}
