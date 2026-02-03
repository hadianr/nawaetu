"use client";

import { useState, useEffect } from "react";
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
        title: "Al-Qur'an & Mentor AI Terpercaya",
        description: "Baca Al-Qur'an, tafsir, dan tanya jawab agama. Semua konten AI dipastikan bersumber dari Al-Qur'an & Hadits Shahih.",
        highlight: "Tenang, sumbernya valid & dapat dipertanggungjawabkan."
    },
    {
        id: "gamification",
        icon: Trophy,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        title: "Gamifikasi Personal",
        description: "Misi harian & target XP akan disesuaikan dengan profil Anda (Gender & Tipe Pejuang) agar lebih relevan.",
        highlight: "Ibadah jadi lebih semangat dengan target yang pas."
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
    const [step, setStep] = useState<'intro' | 'setup-name' | 'setup-gender' | 'setup-archetype'>('intro');

    // Profile State
    const [name, setName] = useState("");
    const [gender, setGender] = useState<'male' | 'female' | null>(null);
    const [archetype, setArchetype] = useState<'pemula' | 'penggerak' | 'mujahid' | null>(null);

    useEffect(() => {
        const hasSeen = localStorage.getItem(ONBOARDING_KEY);
        if (!hasSeen) {
            setTimeout(() => setIsVisible(true), 2000); // Delayed to prioritize LCP of main content
        }
    }, []);

    const handleNext = () => {
        if (step === 'intro') {
            if (currentSlide < SLIDES.length - 1) {
                setCurrentSlide(prev => prev + 1);
            } else {
                setStep('setup-name');
            }
        } else if (step === 'setup-name') {
            if (name.trim()) setStep('setup-gender');
        } else if (step === 'setup-gender') {
            if (gender) setStep('setup-archetype');
        } else if (step === 'setup-archetype') {
            if (archetype) handleFinish();
        }
    };

    const handleFinish = () => {
        // Save Profile
        localStorage.setItem("user_name", name || "Sobat Nawaetu");
        if (gender) localStorage.setItem("user_gender", gender);
        if (archetype) localStorage.setItem("user_archetype", archetype);

        // Mark Onboarding Done
        setIsVisible(false);
        localStorage.setItem(ONBOARDING_KEY, "true");

        // Trigger generic update event
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('profile_updated')); // Custom event if needed
    };

    if (!isVisible) return null;

    const renderContent = () => {
        if (step === 'intro') {
            const slide = SLIDES[currentSlide];
            return (
                <div
                    key={currentSlide}
                    className="mt-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative min-h-[380px] flex flex-col animate-in slide-in-from-right-8 fade-in duration-300"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay"></div>

                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border shadow-lg relative z-10",
                        slide.bg, slide.border
                    )}>
                        <slide.icon className={cn("w-8 h-8", slide.color)} />
                    </div>

                    <div className="space-y-3 relative z-10 flex-1">
                        <h2 className="text-2xl font-bold text-white leading-tight">{slide.title}</h2>
                        <p className="text-sm text-slate-300 leading-relaxed">{slide.description}</p>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-start gap-3 mt-4">
                            <div className="bg-white/10 rounded-full p-1 mt-0.5">
                                <Check className="w-3 h-3 text-emerald-400" />
                            </div>
                            <p className="text-xs text-slate-400 italic">{slide.highlight}</p>
                        </div>
                    </div>

                    {/* Decorative Glow */}
                    <div className={cn(
                        "absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-[50px] opacity-30",
                        slide.bg.replace('/10', '/30')
                    )} />
                </div>
            );
        }

        // --- SETUP STEPS ---

        if (step === 'setup-name') {
            return (
                <div
                    key="setup-name"
                    className="mt-8 bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl min-h-[380px] flex flex-col items-center justify-center text-center relative overflow-hidden animate-in zoom-in-95 fade-in duration-300"
                >
                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay"></div>
                    <div className="relative z-10 w-full space-y-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                            <span className="text-3xl">👋</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Siapa namamu?</h2>
                            <p className="text-sm text-slate-400 mt-1">Agar Ustadz AI bisa menyapamu dengan akrab.</p>
                        </div>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama Panggilan"
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-center text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all text-lg font-bold"
                            onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleNext()}
                        />
                    </div>
                </div>
            );
        }

        if (step === 'setup-gender') {
            return (
                <div
                    key="setup-gender"
                    className="mt-8 bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl min-h-[380px] flex flex-col relative overflow-hidden animate-in slide-in-from-right-8 fade-in duration-300"
                >
                    <div className="relative z-10 w-full space-y-4">
                        <div className="text-center mb-2">
                            <h2 className="text-xl font-bold text-white">Apa Jenis Kelaminmu?</h2>
                            <p className="text-xs text-slate-400 mt-1">Untuk menyesuaikan fiqih ibadah & tema.</p>
                        </div>
                        <div className="grid gap-3">
                            <button
                                onClick={() => setGender('male')}
                                className={cn(
                                    "p-4 rounded-xl border transition-all flex items-center gap-4 text-left",
                                    gender === 'male' ? "bg-blue-500/20 border-blue-500 text-blue-100" : "bg-white/5 border-white/5 hover:bg-white/10"
                                )}
                            >
                                <span className="text-3xl">👨</span>
                                <div>
                                    <span className="font-bold block text-sm">Laki-laki</span>
                                    <span className="text-[10px] opacity-70">Tema Biru, Fiqih Pria</span>
                                </div>
                                {gender === 'male' && <Check className="ml-auto w-5 h-5 text-blue-400" />}
                            </button>
                            <button
                                onClick={() => setGender('female')}
                                className={cn(
                                    "p-4 rounded-xl border transition-all flex items-center gap-4 text-left",
                                    gender === 'female' ? "bg-pink-500/20 border-pink-500 text-pink-100" : "bg-white/5 border-white/5 hover:bg-white/10"
                                )}
                            >
                                <span className="text-3xl">👩</span>
                                <div>
                                    <span className="font-bold block text-sm">Perempuan</span>
                                    <span className="text-[10px] opacity-70">Tema Pink, Fiqih Wanita</span>
                                </div>
                                {gender === 'female' && <Check className="ml-auto w-5 h-5 text-pink-400" />}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (step === 'setup-archetype') {
            return (
                <div
                    key="setup-archetype"
                    className="mt-8 bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl min-h-[380px] flex flex-col relative overflow-hidden animate-in slide-in-from-right-8 fade-in duration-300"
                >
                    <div className="relative z-10 w-full flex-1 flex flex-col">
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-bold text-white">Tipe Pejuang Ibadah?</h2>
                            <p className="text-xs text-slate-400 mt-1">Menentukan target misi harianmu.</p>
                        </div>
                        <div className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-hide">
                            {[
                                { id: 'pemula', label: 'Pemula', desc: 'Fokus Ibadah Wajib', icon: '🌱', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
                                { id: 'penggerak', label: 'Penggerak', desc: 'Wajib + Sunnah Ringan', icon: '⚡', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
                                { id: 'mujahid', label: 'Mujahid', desc: 'Target Ibadah Tinggi', icon: '🔥', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setArchetype(type.id as any)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                        archetype === type.id ? `${type.bg} ${type.border} ring-1 ring-offset-0` : "bg-white/5 border-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center text-xl">
                                        {type.icon}
                                    </div>
                                    <div className="flex-1">
                                        <span className={cn("font-bold block text-sm", archetype === type.id ? "text-white" : "text-slate-300")}>{type.label}</span>
                                        <span className="text-[10px] text-slate-500">{type.desc}</span>
                                    </div>
                                    {archetype === type.id && <Check className={cn("w-4 h-4", type.color)} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-sm relative">
                {/* Progress Bar - Only valid in Intro Phase */}
                {step === 'intro' && (
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
                )}

                {/* SETUP Progress Dots */}
                {step !== 'intro' && (
                    <div className="absolute top-0 left-0 right-0 flex justify-center gap-2 p-1">
                        <div className={cn("w-2 h-2 rounded-full transition-all", step === 'setup-name' ? "bg-white w-6" : "bg-white/20")} />
                        <div className={cn("w-2 h-2 rounded-full transition-all", step === 'setup-gender' ? "bg-white w-6" : "bg-white/20")} />
                        <div className={cn("w-2 h-2 rounded-full transition-all", step === 'setup-archetype' ? "bg-white w-6" : "bg-white/20")} />
                    </div>
                )}

                {/* RENDER CURRENT CONTENT */}
                {renderContent()}

                {/* Actions */}
                <div className="mt-8 flex items-center justify-between gap-4">
                    {step === 'intro' && (
                        <button
                            onClick={() => setStep('setup-name')}
                            className="text-sm text-slate-500 font-medium px-4 py-2 hover:text-white transition-colors"
                        >
                            Skip Intro
                        </button>
                    )}

                    {step !== 'intro' && (
                        <button
                            onClick={() => {
                                if (step === 'setup-name') setStep('intro');
                                if (step === 'setup-gender') setStep('setup-name');
                                if (step === 'setup-archetype') setStep('setup-gender');
                            }}
                            className="text-sm text-slate-500 font-medium px-4 py-2 hover:text-white transition-colors"
                        >
                            Back
                        </button>
                    )}

                    <Button
                        onClick={handleNext}
                        disabled={
                            (step === 'setup-name' && !name.trim()) ||
                            (step === 'setup-gender' && !gender) ||
                            (step === 'setup-archetype' && !archetype)
                        }
                        className="flex-1 h-12 bg-white text-black hover:bg-slate-200 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {step === 'setup-archetype' ? "Selesai & Mulai 🚀" : "Lanjut"}
                        {step !== 'setup-archetype' && <ChevronRight className="w-4 h-4 ml-1" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
