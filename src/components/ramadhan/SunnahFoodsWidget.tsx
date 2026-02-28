"use client";

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

import { useState } from "react";
import { SUNNAH_FOODS_SAHUR, SUNNAH_FOODS_IFTAR } from "@/data/ramadhan";
import DalilBadge from "./DalilBadge";
import { useLocale } from "@/context/LocaleContext";
import { Utensils, Moon, Sun } from "lucide-react";

export default function SunnahFoodsWidget() {
    const [activeTab, setActiveTab] = useState<"sahur" | "iftar">("iftar");
    const { t, locale } = useLocale();

    const currentFoods = activeTab === "iftar" ? SUNNAH_FOODS_IFTAR : SUNNAH_FOODS_SAHUR;

    return (
        <div className="w-full rounded-xl overflow-hidden shadow-xl backdrop-blur-md border border-white/5 bg-white/5"
            style={{
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)"
            }}
        >
            {/* Header section with tabs */}
            <div className="p-2 sm:p-2.5 border-b border-white/5 bg-white/5">
                {/* Tabs */}
                <div className="flex p-1 bg-black/60 rounded-full w-full max-w-[280px] mx-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab("iftar")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all ${activeTab === "iftar"
                            ? "bg-white text-black shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
                            : "text-white/50 hover:text-white/80"
                            }`}
                    >
                        <Moon className={`w-3.5 h-3.5 ${activeTab === "iftar" ? "text-black" : "text-white/50"}`} />
                        {locale === "en" ? "Iftar" : "Berbuka"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("sahur")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all ${activeTab === "sahur"
                            ? "bg-white text-black shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
                            : "text-white/50 hover:text-white/80"
                            }`}
                    >
                        <Sun className={`w-3.5 h-3.5 ${activeTab === "sahur" ? "text-black" : "text-white/50"}`} />
                        {locale === "en" ? "Suhoor" : "Sahur"}
                    </button>
                </div>
            </div>

            {/* Content List - Horizontal Scroll */}
            <div className="p-3 sm:p-4 pt-0">
                <div className="flex gap-3 overflow-x-auto pb-4 pt-4 scrollbar-hide snap-x" style={{ WebkitOverflowScrolling: "touch" }}>
                    {currentFoods.map((food, index) => (
                        <div
                            key={food.id}
                            className="snap-start shrink-0 w-[180px] sm:w-[200px] bg-white/10 rounded-xl p-3 sm:p-4 border border-white/10 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-2xl sm:text-3xl filter drop-shadow">
                                    {food.icon}
                                </div>
                                <DalilBadge dalil={food.dalil} variant="pill" />
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-white leading-tight mb-1.5">
                                {locale === "en" && food.name_en ? food.name_en : food.name}
                            </h3>
                            <p className="text-[10px] sm:text-[11px] text-white/70 leading-relaxed font-medium">
                                {locale === "en" && food.description_en ? food.description_en : food.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
