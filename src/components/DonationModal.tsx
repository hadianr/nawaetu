"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Check, Sparkles, ExternalLink, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useInfaq } from "@/context/InfaqContext";
import { toast } from "sonner";
import { useSession, signIn } from "next-auth/react";

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    headerTitle?: string;
    headerDescription?: string;
}

const DONATION_OPTIONS = [
    { value: 10000, label: "Rp 10.000", emoji: "🍬" },
    { value: 25000, label: "Rp 25.000", emoji: "☕" },
    { value: 50000, label: "Rp 50.000", emoji: "🍛" },
    { value: 100000, label: "Rp 100.000", emoji: "🎁" },
];

export default function DonationModal({ isOpen, onClose, headerTitle, headerDescription }: DonationModalProps) {
    const { isMuhsinin } = useInfaq();
    const { data: session } = useSession();
    const [selectedAmount, setSelectedAmount] = useState<number>(25000);
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customValue, setCustomValue] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        const finalAmount = isCustomMode ? parseInt(customValue) || 0 : selectedAmount;

        if (finalAmount < 10000) {
            toast.error("Minimal infaq Rp 10.000 ya kak (batas payment gateway).");
            return;
        }

        if (!session) {
            toast.error("Silakan login terlebih dahulu untuk mencatat infaq.");
            signIn('google');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/payment/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: finalAmount })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal membuat link pembayaran");

            // Redirect to Mayar
            window.location.href = data.link;

        } catch (e: any) {
            toast.error(e.message || "Terjadi kesalahan. Coba lagi nanti.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 to-[#0F172A] border-white/10 text-white p-0 rounded-3xl overflow-hidden">
                {/* Header Graphic */}
                <div className="relative h-32 bg-emerald-600/20 w-full flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute -bottom-10 w-full h-20 bg-gradient-to-t from-[#0F172A] to-transparent z-10"></div>

                    <div className="relative z-20 flex flex-col items-center animate-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-2 rotate-3 transform hover:rotate-6 transition-transform">
                            <Heart className="w-8 h-8 text-white fill-white" />
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-8 relative z-30 -mt-4">
                    <DialogTitle className="text-center text-xl font-bold mb-2">
                        {headerTitle || "Dukung Nawaetu 🕌"}
                    </DialogTitle>

                    <p className="text-center text-xs text-slate-400 mb-6 leading-relaxed">
                        {headerDescription || "Infaq Anda digunakan untuk biaya operasional server dan pengembangan aplikasi agar terus bermanfaat."}
                    </p>

                    {!session ? (
                        <div className="space-y-4">
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                                <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                                <h3 className="text-sm font-bold text-amber-200 mb-1">Login Diperlukan</h3>
                                <p className="text-xs text-amber-200/70 mb-0">
                                    Agar status "Muhsinin" dan riwayat infaq Anda tersimpan permanen di database, mohon login terlebih dahulu.
                                </p>
                            </div>
                            <Button
                                onClick={() => signIn('google')}
                                className="w-full h-12 bg-white text-slate-900 hover:bg-slate-200 font-bold rounded-xl flex items-center gap-2"
                            >
                                <LogIn className="w-4 h-4" />
                                Login dengan Google
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {DONATION_OPTIONS.map((option) => (
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
                                    <p className="text-[10px] text-slate-500 px-1 italic">Minimal Rp 10.000 (Ketentuan Payment Gateway)</p>
                                </div>
                            )}

                            <Button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                            >
                                {loading ? (
                                    "Memproses..."
                                ) : (
                                    <>
                                        Lanjut Pembayaran
                                        <ExternalLink className="w-4 h-4 opacity-70" />
                                    </>
                                )}
                            </Button>

                            <p className="text-[10px] text-center text-slate-600">
                                Powered by Mayar.id • Aman & Terverifikasi
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
