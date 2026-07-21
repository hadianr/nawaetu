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

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface PaymentSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function triggerNativeConfetti() {
    if (typeof window === "undefined") return;
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        canvas.remove();
        return;
    }
    const context = ctx;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);
    const colors = ["#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6", "#F43F5E"];

    const particles = Array.from({ length: 60 }, () => ({
        x: width * (0.2 + Math.random() * 0.6),
        y: height * 0.35,
        vx: (Math.random() - 0.5) * 14,
        vy: -(Math.random() * 12 + 6),
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
    }));

    let frameId: number;
    const startTime = Date.now();
    const duration = 2200;

    function animate() {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
            cancelAnimationFrame(frameId);
            canvas.remove();
            return;
        }

        context.clearRect(0, 0, width, height);
        const progress = elapsed / duration;

        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.4;
            p.rotation += p.vRot;

            context.save();
            context.globalAlpha = Math.max(0, 1 - progress);
            context.translate(p.x, p.y);
            context.rotate(p.rotation);
            context.fillStyle = p.color;
            context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            context.restore();
        });

        frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);
}

export default function PaymentSuccessModal({ isOpen, onClose }: PaymentSuccessModalProps) {
    const [timeLeft, setTimeLeft] = useState(10);
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    useEffect(() => {
        if (isOpen) {
            triggerNativeConfetti();
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
