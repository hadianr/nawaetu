const APP_ICON_NAME_LIST = [
    // Lucide
    "alarm-clock", "bell", "book", "book-check", "book-heart", "book-marked", "calendar", "calendar-clock", "clock",
    "cloud-rain", "cloud-sun", "compass", "door-open", "droplets", "eclipse", "fingerprint", "gift", "hand-coins",
    "hand-heart", "handshake", "heart-handshake", "heart-pulse", "help", "home", "library", "lightbulb", "lock",
    "message", "message-heart", "moon", "moon-star", "notebook-pen", "refresh", "scale", "scroll", "settings",
    "shield-check", "signpost", "sliders", "soup", "sparkles", "star", "sun", "sun-dim", "sun-medium", "sunrise",
    "sunset", "target", "trophy", "undo", "users", "utensils", "utensils-crossed", "volume", "warning",
    // Nawaetu's own glyphs (src/components/icons/NawaetuIcons.tsx)
    "calendar-heart", "dua", "flower", "goal", "headphones", "hijab", "kaaba", "ketupat", "mosque", "muslim", "prayer-rug",
    "shower-head", "tasbih",
] as const;

export type AppIconName = typeof APP_ICON_NAME_LIST[number];

const LEGACY_ICON_NAMES: Record<string, AppIconName> = {
    "🌙": "moon", "☀️": "sun", "🌤️": "cloud-sun", "🌅": "sunrise", "🌃": "moon", "🌆": "sunset",
    "🌑": "moon", "✨": "sparkles", "❓": "help", "🤲": "dua", "📿": "tasbih", "🕌": "mosque",
    "🕋": "kaaba", "📖": "book", "📚": "library", "📅": "calendar", "🗓️": "calendar", "🔒": "lock", "💧": "droplets",
    // Names renamed in the icon audit; may still be stored on devices.
    hands: "dua", landmark: "mosque",
};

const APP_ICON_NAMES = new Set<string>(APP_ICON_NAME_LIST);

export function resolveAppIconName(value?: string): AppIconName {
    if (value && APP_ICON_NAMES.has(value)) return value as AppIconName;
    return (value && LEGACY_ICON_NAMES[value]) || "help";
}
