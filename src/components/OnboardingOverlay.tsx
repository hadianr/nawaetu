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

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { Clock3, BookOpen, Fingerprint, Trophy, ChevronRight, Check, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

import { useLocale } from "@/context/LocaleContext";
import { sendGAEvent } from "@/lib/analytics/analytics";

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
    const [step, setStep] = useState<'intro' | 'setup-name' | 'setup-gender' | 'setup-location'>('intro');

    const SLIDES = [
        {
            id: "prayer",
            icon: Clock3,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            title: (t as any).onboardingCardPrayerTitle,
            description: (t as any).onboardingCardPrayerDesc,
            highlight: (t as any).onboardingCardPrayerHint
        },
        {
            id: "quran",
            icon: BookOpen,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            title: (t as any).onboardingCardQuranTitle,
            description: (t as any).onboardingCardQuranDesc,
            highlight: (t as any).onboardingCardQuranHint
        },
        {
            id: "intention",
            icon: Fingerprint,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
            border: "border-violet-500/20",
            title: (t as any).onboardingCardIntentionTitle,
            description: (t as any).onboardingCardIntentionDesc,
            highlight: (t as any).onboardingCardIntentionHint
        },
        {
            id: "progress",
            icon: Trophy,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            title: (t as any).onboardingCardProgressTitle,
            description: (t as any).onboardingCardProgressDesc,
            highlight: (t as any).onboardingCardProgressHint
        }
    ];

    // Profile State
    const [name, setName] = useState("");
    const [gender, setGender] = useState<'male' | 'female' | null>(null);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [isLocationSet, setIsLocationSet] = useState(false);
    const storage = getStorageService();

    useEffect(() => {
        sendGAEvent("onboarding_viewed", { version: "v2", locale: String((t as any).locale || "unknown") });
    }, [t]);

    const handleNext = () => {
        if (step === 'intro') {
            if (currentSlide < SLIDES.length - 1) {
                setCurrentSlide(prev => prev + 1);
            } else {
                setStep('setup-name');
            }
        } else if (step === 'setup-name') {
            setStep('setup-gender');
        } else if (step === 'setup-gender') {
            if (gender) setStep('setup-location');
        } else if (step === 'setup-location') {
            if (isLocationSet) handleFinish();
        }
    };

    const handleFinish = async () => {
        // 1. Local Storage Update (Immediate)
        const finalName = name || (t as any).onboardingDefaultName;
        storage.set(STORAGE_KEYS.USER_NAME, finalName);
        storage.set(STORAGE_KEYS.USER_GENDER, gender);
        storage.set(ONBOARDING_KEY as any, "v2");
        sendGAEvent("onboarding_completed", { version: "v2" });

        // 2. Database Sync (If authenticated)
        if (status === "authenticated") {
            try {
                await updateProfile({
                    name: finalName,
                    gender: gender as "male" | "female"
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

    const handleSkipLocation = () => {
        sendGAEvent("onboarding_location_result", { result: "deferred" });
        void handleFinish();
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
                    sendGAEvent("onboarding_location_result", { result: "detected" });
                    toast.success((t as any).onboardingLocationSuccess);
                    setTimeout(() => handleFinish(), 1000);
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
                        <button
                            type="button"
                            onClick={handleSkipLocation}
                            disabled={isLocationLoading}
                            className="text-sm text-white/60 hover:text-white transition-colors disabled:opacity-50"
                        >
                            {(t as any).onboardingLocationSkip}
                        </button>
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
                    </div>
                )}

                {/* RENDER CURRENT CONTENT */}
                {renderContent()}

                {/* Actions */}
                <div className="mt-8 flex items-center justify-between gap-4">
                    {step === 'intro' && (
                        <button
                            onClick={() => {
                                sendGAEvent("onboarding_skipped", { stage: "welcome" });
                                setStep('setup-name');
                            }}
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
                            }}
                            className="text-sm text-white/60 font-medium px-4 py-2 hover:text-white transition-colors"
                        >
                            {(t as any).onboardingBack}
                        </button>
                    )}

                    <Button
                        onClick={handleNext}
                        disabled={
                            (step === 'setup-gender' && !gender) ||
                            (step === 'setup-location' && !isLocationSet)
                        }
                        className="flex-1 h-12 bg-white text-black hover:bg-slate-200 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {step === 'setup-location' ? (t as any).onboardingFinish : (t as any).onboardingNext}
                        {step !== 'setup-location' && <ChevronRight className="w-4 h-4 ml-1" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
