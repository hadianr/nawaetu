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

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/context/LocaleContext';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface TajweedRule {
    name: string;
    color: string;
    desc: string;
    instruction: string;
    example?: string;
}

const TAJWEED_RULES: TajweedRule[] = [
    {
        name: "Ghunnah",
        color: "bg-[#4ade80]",
        desc: "Nun/Mim Tasydid & Idgham Bigunnah",
        instruction: "Dengung ditahan 2 harakat"
    },
    {
        name: "Ikhfa'",
        color: "bg-[#fb923c]",
        desc: "Samar-samar",
        instruction: "Samar, dengung 2 harakat"
    },
    {
        name: "Idgham",
        color: "bg-[#c084fc]",
        desc: "Idgham Bilagunnah & Mutajanisain",
        instruction: "Lebur masuk huruf berikutnya"
    },
    {
        name: "Iqlab",
        color: "bg-[#22d3ee]",
        desc: "Ganti Mim Mati",
        instruction: "Bunyi 'N' jadi 'M', dengung 2 harakat"
    },
    {
        name: "Qalqalah",
        color: "bg-[#38bdf8]",
        desc: "Pantulan",
        instruction: "Dipantulkan (kecil/besar)"
    },
    {
        name: "Mad Wajib/Jaiz",
        color: "bg-[#fb7185]",
        desc: "Panjang 4-5 Harakat",
        instruction: "Baca panjang sedang"
    },
    {
        name: "Mad Lazim",
        color: "bg-[#f43f5e]",
        desc: "Panjang 6 Harakat",
        instruction: "Baca panjang berat (6 harakat)"
    },
    {
        name: "Hamzah Wasl / Silent",
        color: "bg-[#facc15]",
        desc: "Tidak dibaca",
        instruction: "Dianggap tidak ada"
    }
];

export default function TajweedLegend() {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLocale();

    return (
        <div className="w-full mb-6">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full flex items-center justify-between p-3 rounded-xl border transition-all group bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-subtle))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-ring))]"
                        >
                            <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                                <span className="text-sm font-bold transition-colors text-[rgb(var(--color-text-strong))] group-hover:text-[rgb(var(--color-primary-strong))]">
                                    {t.quranTajweedGuide || "Panduan Kode Warna Tajwid"}
                                </span>
                            </div>
                            {isOpen ? <ChevronUp className="w-4 h-4 text-[rgb(var(--color-text-muted))]" /> : <ChevronDown className="w-4 h-4 text-[rgb(var(--color-text-muted))]" />}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        {t.quranTajweedGuide || "Panduan Tajwid"}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Collapsible Content */}
            <div className={cn(
                "grid transition-all duration-300 ease-in-out border-x border-b rounded-b-xl overflow-hidden",
                "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]",
                isOpen ? "grid-rows-[1fr] opacity-100 p-4 pt-1" : "grid-rows-[0fr] opacity-0 border-none"
            )}>
                <div className="overflow-hidden min-h-0 container-snap">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {TAJWEED_RULES.map((rule) => (
                            <div key={rule.name} className="flex items-start gap-3 p-3 rounded-lg border bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]">
                                <div className={cn("w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)]", rule.color)} />
                                <div>
                                    <h4 className="text-sm font-bold leading-none mb-1 text-[rgb(var(--color-text-strong))]">{rule.name}</h4>
                                    <p className="text-[10px] font-medium mb-0.5 uppercase tracking-wide text-[rgb(var(--color-text-muted))]">{rule.desc}</p>
                                    <p className="text-xs text-[rgb(var(--color-primary-light))] italic">{rule.instruction}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-3 rounded-lg flex items-start gap-2 bg-[rgb(var(--color-info))]/10 border border-[rgb(var(--color-info))]/25">
                        <Info className="w-4 h-4 mt-0.5 shrink-0 text-[rgb(var(--color-info))]" />
                        <p className="text-xs leading-relaxed text-[rgb(var(--color-text))]">
                            Fitur ini menggunakan standar pewarnaan mushaf modern untuk memudahkan pemula. Pastikan tetap belajar dengan guru (talaqqi) untuk makhraj yang sempurna.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
