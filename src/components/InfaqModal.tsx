"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Check, Copy, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useInfaq } from "@/context/InfaqContext";
import { toast } from "sonner";

interface InfaqModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const INFAQ_OPTIONS = [
    { value: 10000, label: "Rp 10.000", emoji: "🍬" },
    { value: 25000, label: "Rp 25.000", emoji: "☕" },
    { value: 50000, label: "Rp 50.000", emoji: "🍛" },
    { value: 100000, label: "Rp 100.000", emoji: "🎁" },
];

export default function InfaqModal({ isOpen, onClose }: InfaqModalProps) {
    const { submitInfaq } = useInfaq();
    const [selectedAmount, setSelectedAmount] = useState<number>(25000);
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customValue, setCustomValue] = useState("");
    const [step, setStep] = useState<'selection' | 'transfer' | 'success'>('selection');

    // Bank Details (Configured)
    const BANK_INFO = {
        bankName: "Bank BSI",
        accountNumber: "7341164197",
        accountName: "Hadian Rahmat",
        waNumber: "6282116622724"
    };

    const handleCopyRekening = () => {
        navigator.clipboard.writeText(BANK_INFO.accountNumber);
        toast.success("Nomor rekening disalin!");
    };

    const handleInfaqConfirmation = () => {
        const finalAmount = isCustomMode ? parseInt(customValue) || 0 : selectedAmount;

        if (isCustomMode && finalAmount < 1000) {
            toast.error("Minimal infaq Rp 1.000 ya kak.");
            return;
        }

        // 1. Record Infaq (Trust Based / Husnuzan)
        submitInfaq(finalAmount);

        // 2. Generate WA Link
        const message = `Assalamualaikum, saya sudah infaq sebesar Rp ${finalAmount.toLocaleString('id-ID')} untuk membantu biaya server dan pengembangan aplikasi Nawaetu. Semoga menjadi amal jariyah.`;
        const waLink = `https://wa.me/${BANK_INFO.waNumber}?text=${encodeURIComponent(message)}`;

        // 3. Open WA
        window.open(waLink, '_blank');

        // 4. Show Success Step
        setStep('success');
        setIsCustomMode(false);
        setCustomValue("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                setTimeout(() => setStep('selection'), 300); // Reset after animation
            }
        }}>
            <DialogContent className="max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 to-[#0F172A] border-white/10 text-white p-0 rounded-3xl overflow-hidden">
                {/* Header Graphic */}
                <div className="relative h-32 bg-emerald-600/20 w-full flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute -bottom-10 w-full h-20 bg-gradient-to-t from-[#0F172A] to-transparent z-10"></div>

                    <div className="relative z-20 flex flex-col items-center animate-in zoom-in duration-500">
                        {step === 'success' ? (
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-2 scale-110 animate-[bounce_2s_infinite]">
                                <Sparkles className="w-8 h-8 text-white fill-white" />
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-2 rotate-3 transform hover:rotate-6 transition-transform">
                                <Heart className="w-8 h-8 text-white fill-white" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 pb-8 relative z-30 -mt-4">
                    <DialogTitle className="text-center text-xl font-bold mb-2">
                        {step === 'selection' ? "Dukung Nawaetu 🕌" : step === 'transfer' ? "Selesaikan Infaq ✨" : "Jazakumullah Khair! ✨"}
                    </DialogTitle>

                    <p className="text-center text-xs text-slate-400 mb-6 leading-relaxed">
                        {step === 'selection'
                            ? "Aplikasi ini gratis dan bebas iklan. Infaq Anda digunakan untuk biaya operasional server dan pengembangan aplikasi agar terus bermanfaat."
                            : step === 'transfer'
                                ? "Silakan transfer ke rekening di bawah ini. Akadnya saling percaya (husnuzan) ya kak."
                                : "Terima kasih sudah menjadi bagian dari perjuangan kami. Semoga setiap ayat yang dibaca menjadi pahala jariyah untuk Anda."}
                    </p>

                    {step === 'selection' ? (
                        /* STEP 1: SELECT AMOUNT */
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {INFAQ_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSelectedAmount(option.value);
                                            setIsCustomMode(false);
                                        }}
                                        className={cn(
                                            "p-3 rounded-xl border transition-all text-left relative overflow-hidden group",
                                            !isCustomMode && selectedAmount === option.value
                                                ? "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/20"
                                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xl">{option.emoji}</span>
                                            {!isCustomMode && selectedAmount === option.value && (
                                                <div className="bg-emerald-500 rounded-full p-0.5">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className={cn("font-bold", !isCustomMode && selectedAmount === option.value ? "text-emerald-400" : "text-white")}>
                                            {option.label}
                                        </div>
                                    </button>
                                ))}

                                {/* Custom Amount Button */}
                                <button
                                    onClick={() => setIsCustomMode(true)}
                                    className={cn(
                                        "p-3 rounded-xl border transition-all text-left relative overflow-hidden group col-span-2",
                                        isCustomMode
                                            ? "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/20"
                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                                    )}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">✨</span>
                                            <span className={cn("font-bold", isCustomMode ? "text-emerald-400" : "text-white")}>
                                                Nominal Lainnya
                                            </span>
                                        </div>
                                        {isCustomMode && (
                                            <div className="bg-emerald-500 rounded-full p-0.5">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </div>

                            {isCustomMode && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                                        <input
                                            type="number"
                                            placeholder="Masukkan nominal..."
                                            value={customValue}
                                            onChange={(e) => setCustomValue(e.target.value)}
                                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 px-1 italic">Mulai dari Rp 1.000 seikhlasnya.</p>
                                </div>
                            )}

                            <Button
                                onClick={() => {
                                    if (isCustomMode && (!customValue || parseInt(customValue) < 1000)) {
                                        toast.error("Silakan masukkan nominal minimal Rp 1.000.");
                                        return;
                                    }
                                    setStep('transfer');
                                }}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20"
                            >
                                Lanjut Infaq
                            </Button>
                        </div>
                    ) : step === 'transfer' ? (
                        /* STEP 2: TRANSFER INFO */
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Bank Card */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-5 rounded-2xl relative group">
                                <div className="absolute top-3 right-3 opacity-50 grayscale group-hover:grayscale-0 transition-all">
                                    <span className="font-bold text-white/50 italic">BSI</span>
                                </div>

                                <p className="text-xs text-slate-400 mb-1">Transfer Bank Syariah Indonesia</p>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-2xl font-mono font-bold tracking-wider text-white">
                                        {BANK_INFO.accountNumber}
                                    </span>
                                    <button onClick={handleCopyRekening} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-emerald-400">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm font-medium text-slate-300">a.n {BANK_INFO.accountName}</p>
                            </div>

                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex gap-3 items-start">
                                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-emerald-200/80 leading-relaxed">
                                    "Akad kita adalah kepercayaan. Setelah transfer, silakan konfirmasi via WhatsApp untuk pencatatan administratif. Semoga menjadi amal jariyah."
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleInfaqConfirmation}
                                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                                >
                                    <span className="w-5 h-5 bg-white text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold">WA</span>
                                    Saya Sudah Transfer
                                    <ExternalLink className="w-4 h-4 opacity-70" />
                                </Button>

                                <button
                                    onClick={() => setStep('selection')}
                                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors py-2"
                                >
                                    Kembali pilih nominal
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* STEP 3: SUCCESS FEEDBACK */
                        <div className="space-y-6 animate-in fade-in zoom-in duration-500 text-center">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <p className="text-sm text-slate-300 mb-4 italic leading-relaxed">
                                    "Apabila manusia meninggal dunia, maka terputuslah amalannya kecuali tiga perkara: sedekah jariyah, ilmu yang bermanfaat, atau doa anak yang shalih."
                                </p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">(HR. Muslim)</p>
                            </div>

                            <Button
                                onClick={onClose}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20"
                            >
                                Sama-sama, lanjutkan Ibadah ✨
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
