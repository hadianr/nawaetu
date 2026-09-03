/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Dua & Supplications Data Library (Bilingual EN/ID)
 * 50 duas organized across 5 thematic groups.
 */

import { DuaItem, DuaCategoryDefinition, DuaOccasion } from "./types";
import { MORNING_DUAS } from "./morning";
import { EVENING_DUAS } from "./evening";
import { AFTER_PRAYER_DUAS } from "./after-prayer";
import { DAILY_LIFE_DUAS } from "./daily-life";
import { SOCIAL_DUAS } from "./social";

export * from "./types";

export const DUA_LIBRARY: DuaItem[] = [
    ...MORNING_DUAS,
    ...EVENING_DUAS,
    ...AFTER_PRAYER_DUAS,
    ...DAILY_LIFE_DUAS,
    ...SOCIAL_DUAS,
];

export const DUA_OCCASIONS: DuaCategoryDefinition[] = [
    { key: "morning",      labelId: "☀️ Dzikir Pagi",      labelEn: "☀️ Morning" },
    { key: "evening",      labelId: "🌙 Dzikir Petang",    labelEn: "🌙 Evening" },
    { key: "after_prayer", labelId: "🤲 Setelah Sholat",   labelEn: "🤲 After Prayer" },
    { key: "sleeping",     labelId: "😴 Sebelum Tidur",   labelEn: "😴 Sleep" },
    { key: "protection",   labelId: "🛡️ Perlindungan",    labelEn: "🛡️ Protection" },
    { key: "gratitude",    labelId: "🙏 Syukur",           labelEn: "🙏 Gratitude" },
    { key: "general",      labelId: "📖 Sehari-hari",      labelEn: "📖 Daily Life" },
    { key: "social",       labelId: "🤝 Sosial & Akhlak",  labelEn: "🤝 Social & Ethics" },
];

export function getDuaById(id: string): DuaItem | undefined {
    return DUA_LIBRARY.find(item => item.id === id);
}

export function getDuasByOccasion(occasion: string): DuaItem[] {
    if (occasion === "all") return DUA_LIBRARY;
    return DUA_LIBRARY.filter(item => item.occasion === occasion || item.additionalOccasions?.includes(occasion as DuaOccasion));
}
