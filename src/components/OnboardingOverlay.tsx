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

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { Smartphone, BookOpen, Trophy, ShieldCheck, ChevronRight, Check, Moon, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

import { useLocale } from "@/context/LocaleContext";

const ONBOARDING_KEY = STORAGE_KEYS.ONBOARDING_COMPLETED;

interface OnboardingOverlayProps {
    onComplete?: () => void;
}

export default function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
    const { status } = useSession();
    const { updateProfile } = useProfile();
    const { t } = useLocale();
    // Removed internal visibility state - controlled by parent
    const [currentSlide, setCurrentSlide] = useState(0);
    const [step, setStep] = useState<'intro' | 'setup-name' | 'setup-gender' | 'setup-location' | 'setup-archetype'>('intro');

    // Force logout on mount if an orphaned session is detected
    // This happens primarily on iOS PWAs where Safari retains the login cookie
    // even after the user uninstalls the app (wiping localStorage and triggering onboarding)
    useEffect(() => {
        if (status === "authenticated") {
            console.log("Orphaned session detected during onboarding. Forcing logout...");
            signOut({ redirect: false });
        }
    }, [status]);

    const SLIDES = [
        {
            id: "pwa",
            icon: Smartphone,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            title: (t as any).onboardingSlide1Title,
            description: (t as any).onboardingSlide1Desc,
            highlight: (t as any).onboardingSlide1Hint
        },
        {
            id: "features",
            icon: BookOpen,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            title: (t as any).onboardingSlide2Title,
            description: (t as any).onboardingSlide2Desc,
            highlight: (t as any).onboardingSlide2Hint
        },
        {
            id: "gamification",
            icon: Trophy,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            title: (t as any).onboardingSlide3Title,
            description: (t as any).onboardingSlide3Desc,
            highlight: (t as any).onboardingSlide3Hint
        },
        {
            id: "privacy",
            icon: ShieldCheck,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
            border: "border-violet-500/20",
            title: (t as any).onboardingSlide4Title,
            description: (t as any).onboardingSlide4Desc,
            highlight: (t as any).onboardingSlide4Hint
        },
        {
            id: "ramadhan",
            icon: Moon,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20",
            title: (t as any).onboardingSlide5Title,
            description: (t as any).onboardingSlide5Desc,
            highlight: (t as any).onboardingSlide5Hint
        }
    ];

    const ARCHETYPES = [
        { id: 'esensial', label: (t as any).onboardingArchetypeEsensialLabel, desc: (t as any).onboardingArchetypeEsensialDesc, icon: '🎯', color: 'text-sky-400', border: 'border-sky-400', bg: 'bg-sky-500/20' },
        { id: 'seimbang', label: (t as any).onboardingArchetypeSeimbangLabel, desc: (t as any).onboardingArchetypeSeimbangDesc, icon: '🌿', color: 'text-emerald-400', border: 'border-emerald-400', bg: 'bg-emerald-500/20' },
        { id: 'lengkap', label: (t as any).onboardingArchetypeLengkapLabel, desc: (t as any).onboardingArchetypeLengkapDesc, icon: '🚀', color: 'text-amber-400', border: 'border-amber-400', bg: 'bg-amber-500/20' },
    ];

    // Profile State
    const [name, setName] = useState("");
    const [gender, setGender] = useState<'male' | 'female' | null>(null);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [isLocationSet, setIsLocationSet] = useState(false);
    const [archetype, setArchetype] = useState<'esensial' | 'seimbang' | 'lengkap' | null>(null);
    const storage = getStorageService();

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
            if (gender) setStep('setup-location');
        } else if (step === 'setup-location') {
            if (isLocationSet) setStep('setup-archetype');
        } else if (step === 'setup-archetype') {
            if (archetype) handleFinish();
        }
    };

    const handleFinish = async () => {
        // 1. Local Storage Update (Immediate)
        const finalName = name || (t as any).onboardingDefaultName;
        storage.set(STORAGE_KEYS.USER_NAME, finalName);
        storage.set(STORAGE_KEYS.USER_GENDER, gender);
        storage.set(STORAGE_KEYS.USER_ARCHETYPE, archetype);
        // Juga simpan sebagai USER_FEATURE_PRESET agar BottomNav & hook langsung responsif
        storage.set(STORAGE_KEYS.USER_FEATURE_PRESET as any, archetype);
        storage.set(ONBOARDING_KEY as any, true);

        // 2. Database Sync (If authenticated)
        if (status === "authenticated") {
            try {
                await updateProfile({
                    name: finalName,
                    gender: gender as "male" | "female",
                    archetype: archetype as "esensial" | "seimbang" | "lengkap"
                });
            } catch (e) {
                console.error("Failed to sync onboarding to database", e);
            }
        }

        // Trigger generic update event
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('profile_updated')); // Custom event if needed

        // Callback to parent
        if (onComplete) {
            onComplete();
        }
    };

    const handleDetectLocation = () => {
        setIsLocationLoading(true);
        if (!navigator.geolocation) {
            toast.error((t as any).onboardingLocationError);
            setIsLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    let locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                    try {
                        const proxyResponse = await fetch(`/api/location/reverse?lat=${latitude}&lng=${longitude}`);
                        if (proxyResponse.ok) {
                            const proxyData = await proxyResponse.json();
                            if (proxyData.success && proxyData.name) {
                                locationName = proxyData.name;
                            }
                        }
                    } catch (e) {
                        console.warn('Reverse geocoding failed', e);
                    }

                    storage.set(STORAGE_KEYS.USER_LOCATION as any, {
                        lat: latitude,
                        lng: longitude,
                        name: locationName,
                        timestamp: Date.now()
                    });

                    storage.remove(STORAGE_KEYS.PRAYER_DATA as any);

                    // Notify the app about the new location
                    window.dispatchEvent(new CustomEvent('location_updated'));
                    window.dispatchEvent(new CustomEvent('prayer_data_updated'));

                    setIsLocationSet(true);
                    toast.success((t as any).onboardingLocationSuccess);
                    setTimeout(() => setStep('setup-archetype'), 1000);
                } catch (error) {
                    toast.error((t as any).onboardingLocationError);
                } finally {
                    setIsLocationLoading(false);
                }
            },
            (error) => {
                toast.error((t as any).onboardingLocationError);
                setIsLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const renderContent = () => {
        if (step === 'intro') {
            const slide = SLIDES[currentSlide];
            return (
                <div
                    key={currentSlide}
                    className="mt-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative min-h-[380px] flex flex-col"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-repeat opacity-10 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Cfilter id='noise' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeBlend mode='screen'/%3E%3C/filter%3E%3Crect width='500' height='500' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")` }}></div>

                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border shadow-lg relative z-10",
                        slide.bg, slide.border
                    )}>
                        <slide.icon className={cn("w-8 h-8", slide.color)} />
                    </div>

                    <div className="space-y-3 relative z-10 flex-1">
                        <h2 className="text-2xl font-bold text-white leading-tight">{slide.title}</h2>
                        <p className="text-sm text-white/90 leading-relaxed">{slide.description}</p>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-start gap-3 mt-4">
                            <div className="bg-white/10 rounded-full p-1 mt-0.5">
                                <Check className="w-3 h-3 text-emerald-400" />
                            </div>
                            <p className="text-xs text-white/70 italic">{slide.highlight}</p>
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
                    className="mt-8 bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl min-h-[380px] flex flex-col items-center justify-center text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-repeat opacity-10 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Cfilter id='noise' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeBlend mode='screen'/%3E%3C/filter%3E%3Crect width='500' height='500' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")` }}></div>
                    <div className="relative z-10 w-full space-y-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                            <span className="text-3xl">👋</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{(t as any).onboardingNameTitle}</h2>
                            <p className="text-sm text-white/70 mt-1">{(t as any).onboardingNameDesc}</p>
                        </div>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={(t as any).onboardingNamePlaceholder}
                            aria-label={(t as any).onboardingNamePlaceholder}
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
                    className="mt-8 bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl min-h-[380px] flex flex-col relative overflow-hidden"
                >
                    <div className="relative z-10 w-full space-y-4">
                        <div className="text-center mb-2">
                            <h2 className="text-xl font-bold text-white">{(t as any).onboardingGenderTitle}</h2>
                            <p className="text-xs text-white/70 mt-1">{(t as any).onboardingGenderDesc}</p>
                        </div>
                        <div className="grid gap-3">
                            <button
                                onClick={() => setGender('male')}
                                aria-label={(t as any).onboardingMaleLabel}
                                className={cn(
                                    "p-4 rounded-xl border transition-all flex items-center gap-4 text-left",
                                    gender === 'male' ? "bg-blue-500/20 border-blue-500 text-blue-100" : "bg-white/5 border-white/5 hover:bg-white/10"
                                )}
                            >
                                <span className="text-3xl">👨</span>
                                <div>
                                    <span className="font-bold block text-sm">{(t as any).onboardingMaleLabel}</span>
                                    <span className="text-[10px] opacity-70">{(t as any).onboardingMaleSub}</span>
                                </div>
                                {gender === 'male' && <Check className="ml-auto w-5 h-5 text-blue-400" />}
                            </button>
                            <button
                                onClick={() => setGender('female')}
                                aria-label={(t as any).onboardingFemaleLabel}
                                className={cn(
                                    "p-4 rounded-xl border transition-all flex items-center gap-4 text-left",
                                    gender === 'female' ? "bg-pink-500/20 border-pink-500 text-pink-100" : "bg-white/5 border-white/5 hover:bg-white/10"
                                )}
                            >
                                <span className="text-3xl">👩</span>
                                <div>
                                    <span className="font-bold block text-sm">{(t as any).onboardingFemaleLabel}</span>
                                    <span className="text-[10px] opacity-70">{(t as any).onboardingFemaleSub}</span>
                                </div>
                                {gender === 'female' && <Check className="ml-auto w-5 h-5 text-pink-400" />}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (step === 'setup-location') {
            return (
                <div
                    key="setup-location"
                    className="mt-8 bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl min-h-[380px] flex flex-col items-center justify-center text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-repeat opacity-10 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Cfilter id='noise' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeBlend mode='screen'/%3E%3C/filter%3E%3Crect width='500' height='500' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")` }}></div>
                    <div className="relative z-10 w-full space-y-6 flex flex-col items-center">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg transition-colors p-4",
                            isLocationSet ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-light))] text-white shadow-[rgb(var(--color-primary))]/20"
                        )}>
                            {isLocationSet ? <Check className="w-8 h-8" /> : <MapPin className="w-8 h-8" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{(t as any).onboardingLocationTitle}</h2>
                            <p className="text-sm text-white/70 mt-2 leading-relaxed">{(t as any).onboardingLocationDesc}</p>
                        </div>
                        <Button
                            onClick={handleDetectLocation}
                            disabled={isLocationLoading || isLocationSet}
                            variant="secondary"
                            className={cn(
                                "w-full py-6 text-base font-bold rounded-xl transition-all flex border border-transparent items-center gap-2",
                                isLocationSet ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 opacity-100" : "bg-white/10 text-white hover:bg-white/20 border-white/10"
                            )}
                        >
                            {isLocationLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {(t as any).onboardingLocationDetecting}
                                </>
                            ) : isLocationSet ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    {(t as any).onboardingLocationSuccess}
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-5 h-5" />
                                    {(t as any).onboardingLocationDetect}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            );
        }

        if (step === 'setup-archetype') {
            return (
                <div
                    key="setup-archetype"
                    className="mt-8 bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl min-h-[380px] flex flex-col relative overflow-hidden"
                >
                    <div className="relative z-10 w-full flex-1 flex flex-col">
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-bold text-white">{(t as any).onboardingArchetypeTitle}</h2>
                            <p className="text-xs text-white/70 mt-1">{(t as any).onboardingArchetypeDesc}</p>
                        </div>
                        <div className="space-y-2 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                            {ARCHETYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setArchetype(type.id as any)}
                                    aria-label={(t as any).onboardingArchetypeTitle + ' ' + type.label}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                                        archetype === type.id ? `${type.bg} ${type.border}` : "bg-white/5 border border-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center text-xl">
                                        {type.icon}
                                    </div>
                                    <div className="flex-1">
                                        <span className={cn("font-bold block text-sm", archetype === type.id ? "text-white" : "text-white/90")}>{type.label}</span>
                                        <span className="text-[10px] text-white/60">{type.desc}</span>
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
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="w-full max-w-sm relative">
                {/* Progress Bar - Only valid in Intro Phase */}
                {step === 'intro' && (
                    <div className="absolute top-0 left-0 right-0 flex gap-1 p-1">
                        {SLIDES.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "h-1 flex-1 rounded-full",
                                    idx <= currentSlide ? "bg-white" : "bg-white/20"
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* SETUP Progress Dots */}
                {step !== 'intro' && (
                    <div className="absolute top-0 left-0 right-0 flex justify-center gap-2 p-1">
                        <div className={cn("w-2 h-2 rounded-full", step === 'setup-name' ? "bg-white w-6" : "bg-white/20")} />
                        <div className={cn("w-2 h-2 rounded-full", step === 'setup-gender' ? "bg-white w-6" : "bg-white/20")} />
                        <div className={cn("w-2 h-2 rounded-full", step === 'setup-location' ? "bg-white w-6" : "bg-white/20")} />
                        <div className={cn("w-2 h-2 rounded-full", step === 'setup-archetype' ? "bg-white w-6" : "bg-white/20")} />
                    </div>
                )}

                {/* RENDER CURRENT CONTENT */}
                {renderContent()}

                {/* Actions */}
                <div className="mt-8 flex items-center justify-between gap-4">
                    {step === 'intro' && (
                        <button
                            onClick={() => setStep('setup-name')}
                            className="text-sm text-white/80 font-semibold px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all flex items-center gap-2"
                        >
                            <span>{(t as any).onboardingSkip}</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}

                    {step !== 'intro' && (
                        <button
                            onClick={() => {
                                if (step === 'setup-name') setStep('intro');
                                if (step === 'setup-gender') setStep('setup-name');
                                if (step === 'setup-location') setStep('setup-gender');
                                if (step === 'setup-archetype') setStep('setup-location');
                            }}
                            className="text-sm text-white/60 font-medium px-4 py-2 hover:text-white transition-colors"
                        >
                            {(t as any).onboardingBack}
                        </button>
                    )}

                    <Button
                        onClick={handleNext}
                        disabled={
                            (step === 'setup-name' && !name.trim()) ||
                            (step === 'setup-gender' && !gender) ||
                            (step === 'setup-location' && !isLocationSet) ||
                            (step === 'setup-archetype' && !archetype)
                        }
                        className="flex-1 h-12 bg-white text-black hover:bg-slate-200 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {step === 'setup-archetype' ? (t as any).onboardingFinish : (t as any).onboardingNext}
                        {step !== 'setup-archetype' && <ChevronRight className="w-4 h-4 ml-1" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
