"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Smartphone, BookOpen, Trophy, ShieldCheck, ChevronRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ONBOARDING_KEY = "hasSeenOnboarding_v1"; // Versioning to force show on major updates

const SLIDES = [
    {
        id: "pwa",
        icon: Smartphone,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        title: "Tanpa Install, Hemat Memori",
        description: "Tidak perlu download dari PlayStore/AppStore. Cukup akses web ini, ringan dan cepat.",
        highlight: "Hint: Tambahkan ke Home Screen untuk akses instan."
    },
    {
        id: "features",
        icon: BookOpen,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        title: "Al-Qur'an Lengkap & Mentor AI",
        description: "Baca Al-Qur'an dengan audio per ayat, tafsir, dan tanya jawab agama privat dengan AI Ustadz.",
        highlight: "Fitur MVP: Audio Playback & Tanya Ustadz."
    },
    {
        id: "gamification",
        icon: Trophy,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        title: "Jaga Istiqomah dengan Seru",
        description: "Kumpulkan XP, naikkan Level, dan dapatkan Badges setiap kali Anda beribadah.",
        highlight: "Jadikan ibadah kebiasaan yang menyenangkan."
    },
    {
        id: "privacy",
        icon: ShieldCheck,
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        title: "Tanpa Iklan & Privasi Terjaga",
        description: "Fokus ibadah tanpa gangguan iklan. Data tersimpan lokal di HP Anda, tidak kami jual.",
        highlight: "PENTING: Jangan 'Clear Cache' agar data tidak hilang."
    }
];

export default function OnboardingOverlay() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        // Check local storage on mount
        const hasSeen = localStorage.getItem(ONBOARDING_KEY);
        if (!hasSeen) {
            // Small delay for smooth entrance
            setTimeout(() => setIsVisible(true), 500);
        }
    }, []);

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = () => {
        setIsVisible(false);
        localStorage.setItem(ONBOARDING_KEY, "true");
    };

    if (!isVisible) return null;

    const slide = SLIDES[currentSlide];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                >
                    <div className="w-full max-w-sm relative">
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 right-0 flex gap-1 p-1">
                            {SLIDES.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "h-1 flex-1 rounded-full transition-all duration-300",
                                        idx <= currentSlide ? "bg-white" : "bg-white/20"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Content Card */}
                        <motion.div
                            key={currentSlide}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative"
                        >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

                            {/* Icon */}
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border shadow-lg relative z-10",
                                slide.bg, slide.border
                            )}>
                                <slide.icon className={cn("w-8 h-8", slide.color)} />
                            </div>

                            {/* Text */}
                            <div className="space-y-3 relative z-10">
                                <h2 className="text-2xl font-bold text-white leading-tight">
                                    {slide.title}
                                </h2>
                                <p className="text-sm text-slate-300 leading-relaxed min-h-[60px]">
                                    {slide.description}
                                </p>

                                {/* Highlight Box */}
                                <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-start gap-3 mt-4">
                                    <div className="bg-white/10 rounded-full p-1 mt-0.5">
                                        <Check className="w-3 h-3 text-emerald-400" />
                                    </div>
                                    <p className="text-xs text-slate-400 italic">
                                        {slide.highlight}
                                    </p>
                                </div>
                            </div>

                            {/* Decorative Glow */}
                            <div className={cn(
                                "absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-[50px] opacity-30",
                                slide.bg.replace('/10', '/30')
                            )} />
                        </motion.div>

                        {/* Actions */}
                        <div className="mt-8 flex items-center justify-between gap-4">
                            <button
                                onClick={handleFinish}
                                className="text-sm text-slate-500 font-medium px-4 py-2 hover:text-white transition-colors"
                            >
                                Skip
                            </button>

                            <Button
                                onClick={handleNext}
                                className="flex-1 h-12 bg-white text-black hover:bg-slate-200 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            >
                                {currentSlide === SLIDES.length - 1 ? "Mulai Sekarang 🚀" : "Lanjut"}
                                {currentSlide !== SLIDES.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
