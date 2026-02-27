"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState } from "react";
import { Coins, Wheat, Calculator, HandHeart, BookOpen } from "lucide-react";
import ZakatFitrahCalculatorModal from "./ZakatFitrahCalculatorModal";
import { useLocale } from "@/context/LocaleContext";
import DalilBadge from "./DalilBadge";

export default function ZakatFitrahCard() {
    const [calcModalOpen, setCalcModalOpen] = useState(false);
    const { t } = useLocale();

    return (
        <>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent backdrop-blur-lg shadow-xl">
                {/* Header */}
                <div className="px-3 pt-3 pb-2 sm:px-4 sm:pt-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">⚖️</span>
                        <h3 className="font-bold text-white text-sm sm:text-base">
                            {t.zakatCardTitle || "Zakat Fitrah"}
                        </h3>
                    </div>
                    <p className="text-xs text-white/50">
                        {t.zakatCardSubtitle || "Tunaikan kewajiban sebelum shalat Idul Fitri"}
                    </p>
                </div>

                {/* Info Grid */}
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-3">
                    {/* Kewajiban / Amount Info */}
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <HandHeart className="h-4 w-4 text-emerald-400" />
                            <h4 className="font-semibold text-white/90 text-sm">{t.zakatObligationTitle || "Kewajiban Zakat"}</h4>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed mb-3">
                            {t.zakatObligationDesc || "Zakat fitrah wajib bagi setiap muslim yang merdeka dan memiliki kelebihan makanan untuk dirinya dan keluarganya pada hari raya Idul Fitri. Besarannya adalah 1 sha' (kurang lebih 2,5 kg atau 3,5 liter) makanan pokok."}
                        </p>

                        {/* Dalil Dropdown / Badge style built-in or using generic component */}
                        <div className="mt-2">
                            <DalilBadge
                                dalil={{
                                    id: "zakat-fitrah",
                                    shortRef: t.zakatDalilTitle || "Dalil Zakat Fitrah",
                                    translation: t.zakatDalilText || "Rasulullah shallallahu 'alaihi wa sallam mewajibkan zakat fitrah, yaitu sedekah (makanan) sebagai penyuci bagi orang yang berpuasa dari perbuatan sia-sia dan kotor, serta sebagai makanan bagi orang-orang miskin.",
                                    source: t.zakatDalilSource || "HR. Abu Dawud No. 1609, Ibnu Majah No. 1827"
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Makanan Pokok */}
                        <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-3">
                            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 backdrop-blur-sm">
                                <Wheat className="h-4 w-4 text-amber-300" />
                            </div>
                            <h4 className="mb-1 font-semibold text-white/90 text-xs">
                                {t.zakatFoodTitle || "Bentuk Makanan"}
                            </h4>
                            <p className="text-[10px] text-white/60 leading-relaxed line-clamp-4">
                                {t.zakatFoodDesc || "Zakat dibayarkan berupa makanan pokok yang mengenyangkan menurut kebiasaan masyarakat setempat (seperti beras, gandum, kurma, dll)."}
                            </p>
                        </div>

                        {/* Uang */}
                        <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-3">
                            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 backdrop-blur-sm">
                                <Coins className="h-4 w-4 text-emerald-300" />
                            </div>
                            <h4 className="mb-1 font-semibold text-white/90 text-xs">
                                {t.zakatMoneyTitle || "Membayar dengan Uang"}
                            </h4>
                            <p className="text-[10px] text-white/60 leading-relaxed line-clamp-4">
                                {t.zakatMoneyDesc || "Menurut mazhab Hanafi, diperbolehkan membayar zakat fitrah dengan uang yang senilai dengan harga makanan pokok pembagian zakat, untuk memudahkan penerima."}
                            </p>
                        </div>
                    </div>

                    {/* Calculator Button */}
                    <button
                        onClick={() => setCalcModalOpen(true)}
                        className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 active:scale-[0.98]"
                    >
                        <Calculator className="h-4 w-4 transition-transform group-hover:rotate-12" />
                        {t.zakatCalcButton || "Kalkulator Zakat"}
                    </button>
                </div>
            </div>

            <ZakatFitrahCalculatorModal open={calcModalOpen} onOpenChange={setCalcModalOpen} />
        </>
    );
}
