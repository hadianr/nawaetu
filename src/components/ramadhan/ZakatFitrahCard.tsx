"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState } from "react";
import { Coins, Wheat, Calculator, HandHeart, Clock, ThumbsUp, AlertCircle } from "lucide-react";
import ZakatFitrahCalculatorModal from "./ZakatFitrahCalculatorModal";
import { useLocale } from "@/context/LocaleContext";
import DalilBadge from "./DalilBadge";
import { doaMenerimaZakat } from "@/data/ramadhan/zakat-intentions";

export default function ZakatFitrahCard() {
    const [calcModalOpen, setCalcModalOpen] = useState(false);
    const { t } = useLocale();

    // Determine current Zakat Phase (Mock logic based on current date relative to Eid)
    // For a real app, this would use the user's Hijri calendar data
    // 0: Belum Waktunya, 1: Waktu Mubah (Awal Ramadhan - Akhir Ramadhan), 
    // 2: Waktu Wajib (Maghrib terakhir Ramadhan), 3: Waktu Afdhal (Ba'da Subuh - Sebelum Shalat Id),
    // 4: Waktu Makruh/Haram (Setelah Shalat Id)
    
    // For this POC, we'll just hardcode phase 1 (Waktu Mubah) to show the UI
    const currentPhase: number = 1;

    return (
        <>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent backdrop-blur-lg shadow-xl">
                {/* Header */}
                <div className="px-3 pt-3 pb-2 sm:px-4 sm:pt-4 flex items-center justify-between">
                    <div>
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

                    {/* Timeline Alert Pill */}
                    {currentPhase === 1 && (
                        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 backdrop-blur-sm">
                            <Clock className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-[10px] font-semibold text-emerald-300">Waktu Mubah</span>
                        </div>
                    )}
                    {currentPhase === 3 && (
                        <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 backdrop-blur-sm animate-pulse">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-[10px] font-semibold text-amber-300">Waktu Afdhal</span>
                        </div>
                    )}
                </div>

                {/* Info Grid */}
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-3">
                    
                    {/* Waktu Pembayaran Timeline Guide */}
                    <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
                        <h4 className="font-semibold text-white/80 text-xs mb-2 flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" /> Panduan Waktu Pembayaran
                        </h4>
                        <div className="space-y-1.5">
                            <div className={`flex items-start gap-2 text-[10px] ${currentPhase === 1 ? 'text-emerald-300' : 'text-white/50'}`}>
                                <div className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${currentPhase === 1 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-white/20'}`} />
                                <p><strong className="font-semibold">Waktu Mubah (Boleh):</strong> Sejak awal Ramadhan hingga hari terakhir Ramadhan.</p>
                            </div>
                            <div className={`flex items-start gap-2 text-[10px] ${currentPhase === 2 ? 'text-amber-300' : 'text-white/50'}`}>
                                <div className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${currentPhase === 2 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-white/20'}`} />
                                <p><strong className="font-semibold">Waktu Wajib:</strong> Sejak terbenam matahari (Maghrib) di akhir Ramadhan.</p>
                            </div>
                            <div className={`flex items-start gap-2 text-[10px] ${currentPhase === 3 ? 'text-emerald-300' : 'text-white/50'}`}>
                                <div className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${currentPhase === 3 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-white/20'}`} />
                                <p><strong className="font-semibold">Waktu Afdhal (Utama):</strong> Sesudah shalat Subuh hingga sebelum shalat Idul Fitri dimulai.</p>
                            </div>
                        </div>
                    </div>

                    {/* Kewajiban / Amount Info */}
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <HandHeart className="h-4 w-4 text-emerald-400" />
                            <h4 className="font-semibold text-white/90 text-sm">{t.zakatObligationTitle || "Kewajiban Zakat"}</h4>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed mb-3">
                            {t.zakatObligationDesc || "Zakat fitrah wajib bagi setiap muslim yang merdeka dan memiliki kelebihan makanan untuk dirinya dan keluarganya pada hari raya Idul Fitri. Besarannya adalah 1 sha' (kurang lebih 2,5 kg atau 3,5 liter) makanan pokok."}
                        </p>

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
                                {t.zakatMoneyDesc || "Diperbolehkan membayar dengan uang yang senilai dengan harga makanan pokok (2,5 kg) untuk memudahkan penerima."}
                            </p>
                        </div>
                    </div>

                    {/* Doa Menerima Zakat (Bagi Panitia/Mustahiq) */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <h4 className="font-semibold text-emerald-300 text-xs mb-2 flex items-center gap-2">
                            <ThumbsUp className="h-3.5 w-3.5" /> Doa Menerima Zakat (Mustahiq)
                        </h4>
                        <p className="font-arabic text-right text-lg text-white mb-2 leading-loose" dir="rtl">
                            {doaMenerimaZakat.arabic}
                        </p>
                        <p className="text-[10px] text-emerald-200/80 italic mb-1">
                            "{doaMenerimaZakat.latin}"
                        </p>
                        <p className="text-[10px] text-white/50 leading-relaxed">
                            Artinya: {doaMenerimaZakat.translation}
                        </p>
                    </div>

                    {/* Calculator Button */}
                    <button
                        onClick={() => setCalcModalOpen(true)}
                        className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 py-3.5 text-sm font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/40 active:scale-[0.98] shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    >
                        <Calculator className="h-4 w-4 transition-transform group-hover:rotate-12" />
                        Hitung & Bayar Zakat Fitrah
                    </button>
                </div>
            </div>

            <ZakatFitrahCalculatorModal open={calcModalOpen} onOpenChange={setCalcModalOpen} />
        </>
    );
}
