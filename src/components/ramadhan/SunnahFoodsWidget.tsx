"use client";

import { useState } from "react";
import { SUNNAH_FOODS_SAHUR, SUNNAH_FOODS_IFTAR } from "@/data/ramadhan-data";
import DalilBadge from "./DalilBadge";
import { useLocale } from "@/context/LocaleContext";
import { Utensils, Moon, Sun } from "lucide-react";

export default function SunnahFoodsWidget() {
    const [activeTab, setActiveTab] = useState<"sahur" | "iftar">("iftar");
    const { t, locale } = useLocale();

    const currentFoods = activeTab === "iftar" ? SUNNAH_FOODS_IFTAR : SUNNAH_FOODS_SAHUR;

    return (
        <div className="w-full rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl border border-white/10"
            style={{
                background: "linear-gradient(135deg, rgba(var(--color-card), 0.8) 0%, rgba(var(--color-card), 0.4) 100%)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
            }}
        >
            {/* Header section with tabs */}
            <div className="p-3 sm:p-4 border-b border-white/5">
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary">
                        <Utensils className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-foreground">
                        {locale === "en" ? "Sunnah Foods" : "Makanan Sunnah"}
                    </h2>
                </div>

                {/* Tabs */}
                <div className="flex p-0.5 bg-black/20 rounded-md">
                    <button
                        type="button"
                        onClick={() => setActiveTab("iftar")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-semibold transition-all ${activeTab === "iftar"
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            }`}
                    >
                        <Moon className="w-3 h-3" />
                        {locale === "en" ? "Iftar (Berbuka)" : "Berbuka Puasa"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("sahur")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-semibold transition-all ${activeTab === "sahur"
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            }`}
                    >
                        <Sun className="w-3 h-3" />
                        {locale === "en" ? "Suhoor (Sahur)" : "Makan Sahur"}
                    </button>
                </div>
            </div>

            {/* Content List - Horizontal Scroll */}
            <div className="p-3 sm:p-4 pt-0">
                <div className="flex gap-2.5 overflow-x-auto pb-3 pt-3 scrollbar-hide snap-x" style={{ WebkitOverflowScrolling: "touch" }}>
                    {currentFoods.map((food, index) => (
                        <div
                            key={food.id}
                            className="snap-start shrink-0 w-[200px] sm:w-[240px] bg-black/20 rounded-xl p-3 sm:p-4 border border-white/5 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="text-2xl sm:text-3xl filter drop-shadow-md">
                                        {food.icon}
                                    </div>
                                    <div className="mt-1">
                                        <DalilBadge dalil={food.dalil} variant="pill" />
                                    </div>
                                </div>
                                <h3 className="text-xs sm:text-sm font-bold text-foreground mb-0.5">
                                    {locale === "en" && food.name_en ? food.name_en : food.name}
                                </h3>
                                <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-snug">
                                    {locale === "en" && food.description_en ? food.description_en : food.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
