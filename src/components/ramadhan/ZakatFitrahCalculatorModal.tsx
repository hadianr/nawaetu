"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState } from "react";
import { X, Calculator, Plus, Trash2, HeartHandshake, Info } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useLocale } from "@/context/LocaleContext";
import { zakatIntentions, ZakatIntention, doaMenerimaZakat } from "@/data/ramadhan/zakat-intentions";

type ZakatFitrahCalculatorModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type Recipient = {
    id: string;
    name: string;
    type: ZakatIntention["target"];
    isPaid: boolean;
};

// BAZNAS 2026 Rates (per jiwa)
const BAZNAS_RATES = [
    { label: "Standar BAZNAS 2026", value: 50000, desc: "Sesuai Keputusan BAZNAS RI No. 14 Tahun 2026" },
    { label: "Beras Premium", value: 55000, desc: "Untuk konsumsi beras kualitas tinggi" },
    { label: "Beras Medium", value: 45000, desc: "Untuk konsumsi beras standar" },
];

export default function ZakatFitrahCalculatorModal({ open, onOpenChange }: ZakatFitrahCalculatorModalProps) {
    const { t } = useLocale();
    
    // Preset and Custom Price Logic
    const [selectedRatePreset, setSelectedRatePreset] = useState<number | "custom">(50000);
    const [customPrice, setCustomPrice] = useState<number>(50000);

    const activePrice = selectedRatePreset === "custom" ? customPrice : selectedRatePreset;

    // Recipients State
    const [recipients, setRecipients] = useState<Recipient[]>([
        { id: "1", name: "Saya Sendiri", type: "self", isPaid: false }
    ]);

    // Active intention view
    const [activeIntentionId, setActiveIntentionId] = useState<string | null>(null);

    const totalZakat = recipients.length * activePrice;
    
    // Formatting currency
    const formattedTotal = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(totalZakat);

    const addRecipient = () => {
        const newId = Date.now().toString();
        setRecipients([...recipients, { id: newId, name: `Anggota ${recipients.length + 1}`, type: "family", isPaid: false }]);
    };

    const removeRecipient = (id: string) => {
        if (recipients.length > 1) {
            setRecipients(recipients.filter(r => r.id !== id));
        }
    };

    const togglePaidStatus = (id: string) => {
        setRecipients(recipients.map(r => r.id === id ? { ...r, isPaid: !r.isPaid } : r));
    };

    const updateRecipientStr = (id: string, field: keyof Recipient, value: string) => {
        setRecipients(recipients.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const getIntentionForType = (type: ZakatIntention["target"]) => {
        return zakatIntentions.find(i => i.target === type) || zakatIntentions[0];
    };

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                {/* Overlay with blur effect */}
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-all duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in" />

                {/* Content wrapper */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <DialogPrimitive.Content className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border border-white/20 bg-emerald-950/90 shadow-2xl backdrop-blur-xl transition-all duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 focus:outline-none">
                        
                        {/* Header (Sticky) */}
                        <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6 bg-emerald-950/50 backdrop-blur-xl">
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

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
                            
                            {/* Section 1: Tanggungan List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-emerald-200">Daftar Tanggungan ({recipients.length} Jiwa)</h3>
                                    <button 
                                        onClick={addRecipient}
                                        className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1.5 rounded-lg transition-colors border border-emerald-500/20"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Tambah Orang
                                    </button>
                                </div>
                                
                                <div className="space-y-2">
                                    {recipients.map((recipient) => (
                                        <div key={recipient.id} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-all focus-within:border-emerald-500/50">
                                            <div className="flex items-start gap-3">
                                                {/* Checkbox */}
                                                <button 
                                                    onClick={() => togglePaidStatus(recipient.id)}
                                                    className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${recipient.isPaid ? 'bg-emerald-500 border-emerald-500' : 'border-white/30 bg-transparent'} transition-colors`}
                                                >
                                                    {recipient.isPaid && <HeartHandshake className="h-3.5 w-3.5 text-emerald-950" />}
                                                </button>
                                                
                                                {/* Inputs */}
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            value={recipient.name}
                                                            onChange={(e) => updateRecipientStr(recipient.id, "name", e.target.value)}
                                                            placeholder="Nama Anggota"
                                                            className={`w-full bg-transparent px-1 pb-1 text-sm font-semibold outline-none border-b border-transparent focus:border-emerald-500/50 transition-colors ${recipient.isPaid ? 'text-white/50 line-through decoration-white/30' : 'text-white'}`}
                                                        />
                                                        <select 
                                                            value={recipient.type}
                                                            onChange={(e) => updateRecipientStr(recipient.id, "type", e.target.value as any)}
                                                            className="bg-black/20 text-xs text-white/80 rounded-md border border-white/10 px-2 outline-none focus:border-emerald-500/50"
                                                            disabled={recipient.isPaid}
                                                        >
                                                            <option value="self">Diri Sendiri</option>
                                                            <option value="wife">Istri</option>
                                                            <option value="son">Anak Laki-laki</option>
                                                            <option value="daughter">Anak Perempuan</option>
                                                            <option value="family">Keluarga (Umum)</option>
                                                            <option value="represented">Diwakilkan</option>
                                                        </select>
                                                        {recipients.length > 1 && (
                                                            <button 
                                                                onClick={() => removeRecipient(recipient.id)}
                                                                className="text-white/30 hover:text-red-400 p-1"
                                                                disabled={recipient.isPaid}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Niat Button Drawer Toggle */}
                                                    {!recipient.isPaid && (
                                                        <button 
                                                            onClick={() => setActiveIntentionId(activeIntentionId === recipient.id ? null : recipient.id)}
                                                            className="text-xs text-emerald-400/80 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                                                        >
                                                            <BookOpenIcon className="h-3 w-3" /> Lihat Niat Zakat
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Niat Collapsible Box */}
                                            {activeIntentionId === recipient.id && !recipient.isPaid && (
                                                <div className="mt-2 rounded-xl bg-black/30 p-3 pt-4 border border-white/5 text-center relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-30"></div>
                                                    <h4 className="text-xs font-semibold text-emerald-300 mb-2">{getIntentionForType(recipient.type).title}</h4>
                                                    <p className="font-arabic text-xl sm:text-2xl leading-loose text-white mb-3" dir="rtl">
                                                        {getIntentionForType(recipient.type).arabic}
                                                    </p>
                                                    <p className="text-xs text-emerald-200/80 italic mb-2">
                                                        "{getIntentionForType(recipient.type).latin}"
                                                    </p>
                                                    <p className="text-[10px] text-white/60 leading-relaxed">
                                                        Artinya: {getIntentionForType(recipient.type).translation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section 2: Besaran Zakat (BAZNAS Presets) */}
                            <div className="space-y-3 pt-2 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-medium text-emerald-200">Besaran Zakat Fitrah (per jiwa)</h3>
                                    <div className="group relative">
                                        <Info className="h-4 w-4 text-white/40 cursor-help" />
                                        <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 scale-95 rounded-lg border border-white/10 bg-emerald-950 p-2 text-[10px] leading-relaxed text-white/80 opacity-0 shadow-xl transition-all group-hover:scale-100 group-hover:opacity-100 pointer-events-none z-10">
                                            Sesuaikan besaran dengan pengumuman BAZNAS kabupaten/kota atau DKM Masjid tempat tinggal Anda.
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {BAZNAS_RATES.map((rate) => (
                                        <button
                                            key={rate.value}
                                            onClick={() => setSelectedRatePreset(rate.value)}
                                            className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                                                selectedRatePreset === rate.value 
                                                ? 'border-emerald-500 bg-emerald-500/20' 
                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                            }`}
                                        >
                                            <span className="text-sm font-bold text-white">Rp {rate.value.toLocaleString('id-ID')}</span>
                                            <span className="text-[10px] text-white/50">{rate.label}</span>
                                        </button>
                                    ))}
                                    
                                    <div className={`flex flex-col justify-center rounded-xl border p-2.5 transition-all ${
                                        selectedRatePreset === "custom" 
                                        ? 'border-emerald-500 bg-emerald-500/20' 
                                        : 'border-white/10 bg-white/5 focus-within:border-emerald-500/50'
                                    }`}>
                                        <div className="flex items-center gap-2 w-full">
                                            <span className="text-sm font-bold text-white/50">Rp</span>
                                            <input 
                                                type="number"
                                                value={customPrice}
                                                onChange={(e) => {
                                                    setCustomPrice(Math.max(0, parseInt(e.target.value) || 0));
                                                    setSelectedRatePreset("custom");
                                                }}
                                                onFocus={() => setSelectedRatePreset("custom")}
                                                className="w-full bg-transparent text-sm font-bold text-white outline-none"
                                            />
                                        </div>
                                        <span className="text-[10px] text-white/50">Nominal Custom (Lainnya)</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer (Sticky Result) */}
                        <div className="border-t border-white/10 bg-gradient-to-t from-emerald-950/80 to-emerald-950/50 p-5 sm:p-6 backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-emerald-200/80 mb-0.5">
                                        Total Zakat ({recipients.length} jiwa)
                                    </p>
                                    <p className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                                        {formattedTotal}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-white/40">Sisa belum dibayar:</p>
                                    <p className="text-sm font-semibold text-amber-400">
                                        {recipients.filter(r => !r.isPaid).length} Orang
                                    </p>
                                </div>
                            </div>
                        </div>

                    </DialogPrimitive.Content>
                </div>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

// Simple Book icon as it wasn't imported from lucide
function BookOpenIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    )
}
