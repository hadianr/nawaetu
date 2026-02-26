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

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Check, Sparkles, ExternalLink, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useInfaq } from "@/context/InfaqContext";
import { toast } from "sonner";
import { useSession, signIn } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    headerTitle?: string;
    headerDescription?: string;
}

const DONATION_OPTIONS = [
    { value: 5000, label: "Rp 5.000", emoji: "🍬" },
    { value: 10000, label: "Rp 10.000", emoji: "☕" },
    { value: 25000, label: "Rp 25.000", emoji: "🍛" },
    { value: 50000, label: "Rp 50.000", emoji: "🎁" },
    { value: 75000, label: "Rp 75.000", emoji: "🌟" },
    { value: 100000, label: "Rp 100.000", emoji: "💎" },
];

export default function DonationModal({ isOpen, onClose, headerTitle, headerDescription }: DonationModalProps) {
    const { isMuhsinin } = useInfaq();
    const { data: session } = useSession();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const [selectedAmount, setSelectedAmount] = useState<number>(10000);
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customValue, setCustomValue] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        const finalAmount = isCustomMode ? parseInt(customValue) || 0 : selectedAmount;

        if (finalAmount < 5000) {
            toast.error("Minimal infaq Rp 5.000 ya kak (batas payment gateway).");
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
            <DialogContent className={cn(
                "max-w-sm sm:max-w-md border p-0 rounded-3xl overflow-hidden",
                isDaylight
                    ? "bg-white border-slate-200 text-slate-900"
                    : "bg-gradient-to-b from-slate-900 to-[#0F172A] border-white/10 text-white"
            )}>
                {/* Header Graphic */}
                <div className={cn(
                    "relative h-32 w-full flex items-center justify-center overflow-hidden",
                    isDaylight ? "bg-emerald-50" : "bg-emerald-600/20"
                )}>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className={cn(
                        "absolute -bottom-10 w-full h-20 z-10",
                        isDaylight ? "bg-gradient-to-t from-white to-transparent" : "bg-gradient-to-t from-[#0F172A] to-transparent"
                    )}></div>

                    <div className="relative z-20 flex flex-col items-center animate-in zoom-in duration-500">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl mb-2 rotate-3 transform hover:rotate-6 transition-transform",
                            isDaylight
                                ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
                                : "bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/30"
                        )}>
                            <Heart className="w-8 h-8 text-white fill-white" />
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-8 relative z-30 -mt-4">
                    <DialogTitle className={cn(
                        "text-center text-xl font-bold mb-2",
                        isDaylight ? "text-slate-900" : "text-white"
                    )}>
                        {headerTitle || "Dukung Nawaetu 🕌"}
                    </DialogTitle>

                    <p className={cn(
                        "text-center text-xs mb-6 leading-relaxed",
                        isDaylight ? "text-slate-500" : "text-slate-400"
                    )}>
                        {headerDescription || "Infaq Anda digunakan untuk biaya operasional server dan pengembangan aplikasi agar terus bermanfaat."}
                    </p>

                    {!session ? (
                        <div className="space-y-4">
                            <div className={cn(
                                "rounded-2xl p-5 text-center border transition-all shadow-sm",
                                isDaylight
                                    ? "bg-amber-50/50 border-amber-200/50"
                                    : "bg-amber-500/10 border-amber-500/20"
                            )}>
                                <Sparkles className={cn(
                                    "w-7 h-7 mx-auto mb-3",
                                    isDaylight ? "text-amber-600" : "text-amber-400"
                                )} />
                                <h3 className={cn(
                                    "text-base font-bold mb-1.5",
                                    isDaylight ? "text-amber-900" : "text-amber-200"
                                )}>Login Diperlukan</h3>
                                <p className={cn(
                                    "text-xs mb-0 leading-relaxed font-medium px-2",
                                    isDaylight ? "text-amber-800/80" : "text-amber-200/70"
                                )}>
                                    Agar status "Muhsinin" dan riwayat infaq Anda tersimpan permanen di database, mohon login terlebih dahulu.
                                </p>
                            </div>
                            <Button
                                onClick={() => signIn('google')}
                                className={cn(
                                    "w-full h-12 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-md hover:shadow-lg",
                                    isDaylight
                                        ? "bg-white border border-slate-200 text-slate-900"
                                        : "bg-white text-slate-900 hover:bg-slate-200"
                                )}
                            >
                                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
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
                                                ? isDaylight
                                                    ? "bg-emerald-50 border-emerald-200 shadow-sm"
                                                    : "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/20"
                                                : isDaylight
                                                    ? "bg-slate-50 border-slate-100 hover:bg-slate-100"
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
                                        <div className={cn(
                                            "font-bold",
                                            !isCustomMode && selectedAmount === option.value
                                                ? "text-emerald-600"
                                                : isDaylight ? "text-slate-900" : "text-white"
                                        )}>
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
                                            ? isDaylight
                                                ? "bg-emerald-50 border-emerald-200 shadow-sm"
                                                : "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/20"
                                            : isDaylight
                                                ? "bg-slate-50 border-slate-100 hover:bg-slate-100"
                                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                    )}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">✨</span>
                                            <span className={cn(
                                                "font-bold",
                                                isCustomMode
                                                    ? "text-emerald-600"
                                                    : isDaylight ? "text-slate-900" : "text-white"
                                            )}>
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
                                            className={cn(
                                                "w-full h-12 border rounded-xl pl-12 pr-4 font-bold focus:ring-1 outline-none transition-all",
                                                isDaylight
                                                    ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500"
                                                    : "bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500"
                                            )}
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 px-1 italic">Minimal Rp 5.000 (Ketentuan Payment Gateway)</p>
                                </div>
                            )}

                            <Button
                                onClick={handlePayment}
                                disabled={loading}
                                className={cn(
                                    "w-full h-12 font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all",
                                    isDaylight
                                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                                )}
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
