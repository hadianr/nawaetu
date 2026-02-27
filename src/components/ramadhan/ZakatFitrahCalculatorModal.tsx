"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState } from "react";
import { X, Calculator } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useLocale } from "@/context/LocaleContext";

type ZakatFitrahCalculatorModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function ZakatFitrahCalculatorModal({ open, onOpenChange }: ZakatFitrahCalculatorModalProps) {
    const { t } = useLocale();
    const [familyMembers, setFamilyMembers] = useState<number>(1);
    const [pricePerPerson, setPricePerPerson] = useState<number>(50000);

    const totalZakat = familyMembers * pricePerPerson;

    // Formatting currency depending on the current language
    const formattedTotal = new Intl.NumberFormat(t.buttonOk === "OK" ? "id-ID" : "en-US", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(totalZakat);

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                {/* Overlay with blur effect */}
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-all duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in" />

                {/* Content wrapper */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <DialogPrimitive.Content className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/20 bg-emerald-950/40 p-5 sm:p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 focus:outline-none">

                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 text-emerald-400 backdrop-blur-md">
                                    <Calculator className="h-5 w-5" />
                                </div>
                                <DialogPrimitive.Title className="text-lg font-bold text-white">
                                    {t.zakatCalcModalTitle || "Kalkulator Zakat Fitrah"}
                                </DialogPrimitive.Title>
                            </div>
                            <DialogPrimitive.Close className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white focus:outline-none">
                                <X className="h-5 w-5" />
                            </DialogPrimitive.Close>
                        </div>

                        {/* Calculator Form */}
                        <div className="space-y-5">
                            {/* Family Members Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">
                                    {t.zakatCalcFamilyLabel || "Jumlah Anggota Keluarga"}
                                </label>
                                <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
                                    <button
                                        onClick={() => setFamilyMembers(prev => Math.max(1, prev - 1))}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white transition-colors hover:bg-white/10 active:bg-white/20"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={familyMembers}
                                        onChange={(e) => setFamilyMembers(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="h-10 flex-1 bg-transparent px-3 text-center text-lg font-bold text-white focus:outline-none"
                                    />
                                    <button
                                        onClick={() => setFamilyMembers(prev => prev + 1)}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white transition-colors hover:bg-white/10 active:bg-white/20"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Price per Person Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">
                                    {t.zakatCalcPriceLabel || "Harga Beras/Makanan Pokok per 2.5 kg"}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">Rp</span>
                                    <input
                                        type="number"
                                        value={pricePerPerson}
                                        onChange={(e) => setPricePerPerson(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-white/30 backdrop-blur-sm focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                                    />
                                </div>
                            </div>

                            {/* Total Result */}
                            <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 p-5 text-center shadow-lg shadow-emerald-500/10">
                                <p className="mb-1 text-sm text-emerald-200/80">
                                    {t.zakatCalcTotalLabel || "Total Zakat Fitrah Anda"}
                                </p>
                                <p className="text-3xl font-bold tracking-tight text-white">
                                    {formattedTotal}
                                </p>
                            </div>

                            {/* Note */}
                            <p className="text-xs text-center text-white/40 leading-relaxed px-2">
                                {t.zakatCalcNote || "Catatan: Harga tiap makanan pokok bisa berbeda tergantung kualitas yang biasa Anda konsumsi."}
                            </p>
                        </div>
                    </DialogPrimitive.Content>
                </div>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
