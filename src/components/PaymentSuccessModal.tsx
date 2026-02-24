"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Check, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface PaymentSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PaymentSuccessModal({ isOpen, onClose }: PaymentSuccessModalProps) {
    const [timeLeft, setTimeLeft] = useState(10);
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    useEffect(() => {
        if (isOpen) {
            // Trigger confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={cn(
                "max-w-sm sm:max-w-md p-0 rounded-3xl overflow-hidden shadow-2xl transition-all",
                isDaylight
                    ? "bg-white border-slate-200 text-slate-900 shadow-emerald-500/10"
                    : "bg-gradient-to-b from-slate-900 to-[#0F172A] border-white/10 text-white shadow-emerald-900/40"
            )}>
                <div className="relative flex flex-col items-center justify-center p-8 pt-12 text-center">

                    {/* Animated Checkmark Background */}
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />

                    {/* Main Icon */}
                    <div className="relative mb-6">
                        <div className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-500",
                            isDaylight
                                ? "bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-emerald-500/20"
                                : "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
                        )}>
                            <Check className="w-12 h-12 text-white stroke-[3]" />
                        </div>
                        <div className={cn(
                            "absolute -bottom-2 -right-2 rounded-full p-2 shadow-md animate-bounce",
                            isDaylight ? "bg-emerald-50 text-emerald-600" : "bg-white text-emerald-600"
                        )}>
                            <Heart className="w-4 h-4 fill-emerald-600" />
                        </div>
                    </div>

                    <h2 className={cn("text-2xl font-bold mb-2", isDaylight ? "text-slate-900" : "text-white")}>Alhamdulillah!</h2>
                    <p className="text-emerald-500 font-bold mb-6">Pembayaran Berhasil</p>

                    <p className={cn("text-sm leading-relaxed mb-8", isDaylight ? "text-slate-600" : "text-slate-300")}>
                        Terima kasih, Orang Baik. Infaq Anda telah kami terima dan akan digunakan untuk operasional serta pengembangan aplikasi Nawaetu.
                        <br /><br />
                        <span className={cn("text-xs italic", isDaylight ? "text-slate-400" : "text-white/60")}>"Semoga menjadi amal jariyah yang tak terputus pahalanya."</span>
                    </p>

                    <div className="w-full space-y-3">
                        <Button
                            onClick={onClose}
                            className={cn(
                                "w-full font-bold h-12 rounded-xl shadow-lg transition-all active:scale-[0.98]",
                                isDaylight
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                            )}
                        >
                            Aamiin, Tutup
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
