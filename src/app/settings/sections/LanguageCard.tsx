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

interface LanguageCardProps {
    t: any;
    locale: string;
    handleLocaleChange: (value: string) => void;
}

export default function LanguageCard({ t, locale, handleLocaleChange }: LanguageCardProps) {
    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                <span className="text-sm font-semibold text-white">{t.languageTitle}</span>
            </div>

            <Select value={locale} onValueChange={handleLocaleChange}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white h-11">
                    <SelectValue placeholder="Bahasa Indonesia">
                        {locale && LANGUAGE_OPTIONS.find(l => l.id === locale) ? (
                            <span className="flex items-center gap-2">
                                <span>{LANGUAGE_OPTIONS.find(l => l.id === locale)?.flag}</span>
                                <span>{LANGUAGE_OPTIONS.find(l => l.id === locale)?.label}</span>
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <span>🇮🇩</span>
                                <span>Bahasa Indonesia</span>
                            </span>
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                    {LANGUAGE_OPTIONS.map((lang) => (
                        <SelectItem
                            key={lang.id}
                            value={lang.id}
                            textValue={lang.label}
                            className="text-white text-sm hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-lg">{lang.flag}</span>
                                <span>{lang.label}</span>
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
