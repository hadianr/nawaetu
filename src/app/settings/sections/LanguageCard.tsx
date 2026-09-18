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

import { Globe } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LANGUAGE_OPTIONS } from "@/data/settings-data";
import type { TranslationTree } from "@/context/LocaleContext";

interface LanguageCardProps {
    t: TranslationTree;
    locale: string;
    handleLocaleChange: (value: string) => void;
}

export default function LanguageCard({ t, locale, handleLocaleChange }: LanguageCardProps) {
    return (
        <div className="bg-[rgb(var(--color-surface))]/70 border border-[rgb(var(--color-border))]/20 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                <span className="text-sm font-semibold text-[rgb(var(--color-text-strong))]">{t.languageTitle}</span>
            </div>

            <Select value={locale} onValueChange={handleLocaleChange}>
                <SelectTrigger className="w-full bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]/20 text-[rgb(var(--color-text-strong))] h-11">
                    <SelectValue placeholder="Bahasa Indonesia">
                        {locale && LANGUAGE_OPTIONS.find(l => l.id === locale) ? (
                            <span className="flex items-center gap-2">
                                <span>{LANGUAGE_OPTIONS.find(l => l.id === locale)?.label}</span>
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <span>Bahasa Indonesia</span>
                            </span>
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]/20">
                    {LANGUAGE_OPTIONS.map((lang) => (
                        <SelectItem
                            key={lang.id}
                            value={lang.id}
                            textValue={lang.label}
                            className="text-[rgb(var(--color-text))] text-sm hover:bg-[rgb(var(--color-surface-subtle))] focus:bg-[rgb(var(--color-surface-subtle))] focus:text-[rgb(var(--color-text-strong))] cursor-pointer transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span>{lang.label}</span>
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
