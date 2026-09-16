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
import type { TranslationTree } from "@/context/LocaleContext";
import { sendGAEvent } from "@/lib/analytics/analytics";

const ONBOARDING_KEY = STORAGE_KEYS.ONBOARDING_COMPLETED;

interface OnboardingOverlayProps {
    onComplete?: () => void;
}

export default function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
    const { status } = useSession();
    const { updateProfile } = useProfile();
    const { t, locale } = useLocale();
    const translations = t as TranslationTree;
    // Removed internal visibility state - controlled by parent
    const [currentSlide, setCurrentSlide] = useState(0);
    const [step, setStep] = useState<'intro' | 'setup-name' | 'setup-gender' | 'setup-location'>('intro');

    const SLIDES = [
        {
            id: "prayer",
            icon: Clock3,
            color: "text-[rgb(var(--color-primary))]",
            bg: "bg-[rgb(var(--color-primary))]/10",
            border: "border-[rgb(var(--color-primary))]/20",
            title: translations.onboardingCardPrayerTitle,
            description: translations.onboardingCardPrayerDesc,
            highlight: translations.onboardingCardPrayerHint
        },
        {
            id: "quran",
            icon: BookOpen,
            color: "text-[rgb(var(--color-info))]",
            bg: "bg-[rgb(var(--color-info))]/10",
            border: "border-[rgb(var(--color-info))]/20",
            title: translations.onboardingCardQuranTitle,
            description: translations.onboardingCardQuranDesc,
            highlight: translations.onboardingCardQuranHint
        },
        {
            id: "intention",
            icon: Fingerprint,
            color: "text-[rgb(var(--color-primary-light))]",
            bg: "bg-[rgb(var(--color-primary-light))]/10",
            border: "border-[rgb(var(--color-primary-light))]/20",
            title: translations.onboardingCardIntentionTitle,
            description: translations.onboardingCardIntentionDesc,
            highlight: translations.onboardingCardIntentionHint
        },
        {
            id: "progress",
            icon: Trophy,
            color: "text-[rgb(var(--color-accent))]",
            bg: "bg-[rgb(var(--color-accent))]/10",
            border: "border-[rgb(var(--color-accent))]/20",
            title: translations.onboardingCardProgressTitle,
            description: translations.onboardingCardProgressDesc,
            highlight: translations.onboardingCardProgressHint
        }
    ];

    // Profile State
    const [name, setName] = useState("");
    const [gender, setGender] = useState<'male' | 'female' | null>(null);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [isLocationSet, setIsLocationSet] = useState(false);
    const storage = getStorageService();

    useEffect(() => {
        sendGAEvent("onboarding_viewed", { version: "v2", locale: locale || "unknown" });
    }, [t, locale]);

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
        const finalName = name || translations.onboardingDefaultName;
        storage.set(STORAGE_KEYS.USER_NAME, finalName);
        storage.set(STORAGE_KEYS.USER_GENDER, gender);
        storage.set(ONBOARDING_KEY, "v2");
        sendGAEvent("onboarding_completed", { version: "v2" });

        // 2. Database Sync (If authenticated)
        if (status === "authenticated") {
            try {
                await updateProfile({
                    name: finalName,
                    gender: gender as "male" | "female"
                });
            } catch (error) {
                console.error("Failed to sync onboarding to database", error);
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
            toast.error(translations.onboardingLocationError);
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

                    storage.set(STORAGE_KEYS.USER_LOCATION, {
                        lat: latitude,
                        lng: longitude,
                        name: locationName,
                        timestamp: Date.now()
                    });

                    storage.remove(STORAGE_KEYS.PRAYER_DATA);

                    // Notify the app about the new location
                    window.dispatchEvent(new CustomEvent('location_updated'));
                    window.dispatchEvent(new CustomEvent('prayer_data_updated'));

                    setIsLocationSet(true);
                    sendGAEvent("onboarding_location_result", { result: "detected" });
                    toast.success(translations.onboardingLocationSuccess);
                    setTimeout(() => handleFinish(), 1000);
                } catch {
                    toast.error(translations.onboardingLocationError);
                } finally {
                    setIsLocationLoading(false);
                }
            },
            () => {
                toast.error(translations.onboardingLocationError);
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
                    className="mt-8 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]/20 rounded-3xl p-6 shadow-[var(--shadow-floating)] overflow-hidden relative min-h-[380px] flex flex-col text-[rgb(var(--color-text))]"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-repeat opacity-10 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Cfilter id='noise' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeBlend mode='screen'/%3E%3C/filter%3E%3Crect width='500' height='500' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")` }}></div>

                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border shadow-[var(--shadow-card)] relative z-10",
                        slide.bg, slide.border
                    )}>
                        <slide.icon className={cn("w-8 h-8", slide.color)} />
                    </div>

                    <div className="space-y-3 relative z-10 flex-1">
                        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-strong))] leading-tight">{slide.title}</h2>
                        <p className="text-sm text-[rgb(var(--color-text))] leading-relaxed">{slide.description}</p>
                        <div className="bg-[rgb(var(--color-surface-subtle))]/60 border border-[rgb(var(--color-border))]/15 rounded-xl p-3 flex items-start gap-3 mt-4">
                            <div className="bg-[rgb(var(--color-primary))]/10 rounded-full p-1 mt-0.5">
                                <Check className="w-3 h-3 text-[rgb(var(--color-primary))]" />
                            </div>
                            <p className="text-xs text-[rgb(var(--color-text-muted))] italic">{slide.highlight}</p>
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
                    className="mt-8 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]/20 rounded-3xl p-6 shadow-[var(--shadow-floating)] min-h-[380px] flex flex-col items-center justify-center text-center relative overflow-hidden text-[rgb(var(--color-text))]"
                >
                    <div className="absolute inset-0 bg-repeat opacity-10 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Cfilter id='noise' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeBlend mode='screen'/%3E%3C/filter%3E%3Crect width='500' height='500' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")` }}></div>
                    <div className="relative z-10 w-full space-y-6">
                        <div className="w-16 h-16 bg-[rgb(var(--color-primary))]/15 border border-[rgb(var(--color-primary))]/30 rounded-2xl flex items-center justify-center mx-auto shadow-[var(--shadow-card)]">
                            <span className="text-3xl">👋</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[rgb(var(--color-text-strong))]">{translations.onboardingNameTitle}</h2>
                            <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">{translations.onboardingNameDesc}</p>
                        </div>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={translations.onboardingNamePlaceholder}
                            aria-label={translations.onboardingNamePlaceholder}
                            className="w-full bg-[rgb(var(--color-canvas))]/40 border border-[rgb(var(--color-border))]/20 rounded-xl px-4 py-3 text-center text-[rgb(var(--color-text-strong))] placeholder:text-[rgb(var(--color-text-muted))] focus:outline-none focus:border-[rgb(var(--color-ring))] transition-all text-lg font-bold"
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
                    className="mt-8 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]/20 rounded-3xl p-6 shadow-[var(--shadow-floating)] min-h-[380px] flex flex-col relative overflow-hidden text-[rgb(var(--color-text))]"
                >
                    <div className="relative z-10 w-full space-y-4">
                        <div className="text-center mb-2">
                            <h2 className="text-xl font-bold text-[rgb(var(--color-text-strong))]">{translations.onboardingGenderTitle}</h2>
                            <p className="text-xs text-[rgb(var(--color-text-muted))] mt-1">{translations.onboardingGenderDesc}</p>
                        </div>
                        <div className="grid gap-3">
                            <button
                                onClick={() => setGender('male')}
                                aria-label={translations.onboardingMaleLabel}
                                className={cn(
                                    "p-4 rounded-xl border transition-all flex items-center gap-4 text-left",
                                    gender === 'male' ? "bg-[rgb(var(--color-info))]/20 border-[rgb(var(--color-info))] text-[rgb(var(--color-text-strong))]" : "bg-[rgb(var(--color-surface-subtle))]/50 border-[rgb(var(--color-border))]/15 hover:bg-[rgb(var(--color-surface-subtle))]"
                                )}
                            >
                                <span className="text-3xl">👨</span>
                                <div>
                                    <span className="font-bold block text-sm">{translations.onboardingMaleLabel}</span>
                                    <span className="text-[10px] opacity-70">{translations.onboardingMaleSub}</span>
                                </div>
                                {gender === 'male' && <Check className="ml-auto w-5 h-5 text-[rgb(var(--color-info))]" />}
                            </button>
                            <button
                                onClick={() => setGender('female')}
                                aria-label={translations.onboardingFemaleLabel}
                                className={cn(
                                    "p-4 rounded-xl border transition-all flex items-center gap-4 text-left",
                                    gender === 'female' ? "bg-[rgb(var(--color-primary-light))]/20 border-[rgb(var(--color-primary-light))] text-[rgb(var(--color-text-strong))]" : "bg-[rgb(var(--color-surface-subtle))]/50 border-[rgb(var(--color-border))]/15 hover:bg-[rgb(var(--color-surface-subtle))]"
                                )}
                            >
                                <span className="text-3xl">👩</span>
                                <div>
                                    <span className="font-bold block text-sm">{translations.onboardingFemaleLabel}</span>
                                    <span className="text-[10px] opacity-70">{translations.onboardingFemaleSub}</span>
                                </div>
                                {gender === 'female' && <Check className="ml-auto w-5 h-5 text-[rgb(var(--color-primary-light))]" />}
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
                    className="mt-8 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]/20 rounded-3xl p-6 shadow-[var(--shadow-floating)] min-h-[380px] flex flex-col items-center justify-center text-center relative overflow-hidden text-[rgb(var(--color-text))]"
                >
                    <div className="absolute inset-0 bg-repeat opacity-10 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Cfilter id='noise' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeBlend mode='screen'/%3E%3C/filter%3E%3Crect width='500' height='500' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")` }}></div>
                    <div className="relative z-10 w-full space-y-6 flex flex-col items-center">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-[var(--shadow-card)] transition-colors p-4",
                            isLocationSet ? "bg-[rgb(var(--color-success))]/20 text-[rgb(var(--color-success))] border border-[rgb(var(--color-success))]/30" : "bg-[rgb(var(--color-primary))]/15 text-[rgb(var(--color-primary-strong))] border border-[rgb(var(--color-primary))]/30"
                        )}>
                            {isLocationSet ? <Check className="w-8 h-8" /> : <MapPin className="w-8 h-8" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[rgb(var(--color-text-strong))]">{translations.onboardingLocationTitle}</h2>
                            <p className="text-sm text-[rgb(var(--color-text-muted))] mt-2 leading-relaxed">{translations.onboardingLocationDesc}</p>
                        </div>
                        <Button
                            onClick={handleDetectLocation}
                            disabled={isLocationLoading || isLocationSet}
                            variant="secondary"
                            className={cn(
                                "w-full py-6 text-base font-bold rounded-xl transition-all flex border border-transparent items-center gap-2",
                                isLocationSet ? "bg-[rgb(var(--color-success))]/20 text-[rgb(var(--color-success))] border-[rgb(var(--color-success))]/30 hover:bg-[rgb(var(--color-success))]/30 opacity-100" : "bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text-strong))] hover:bg-[rgb(var(--color-surface-subtle))]/80 border-[rgb(var(--color-border))]/20"
                            )}
                        >
                            {isLocationLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {translations.onboardingLocationDetecting}
                                </>
                            ) : isLocationSet ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    {translations.onboardingLocationSuccess}
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-5 h-5" />
                                    {translations.onboardingLocationDetect}
                                </>
                            )}
                        </Button>
                        <button
                            type="button"
                            onClick={handleSkipLocation}
                            disabled={isLocationLoading}
                            className="text-sm text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-strong))] transition-colors disabled:opacity-50"
                        >
                            {translations.onboardingLocationSkip}
                        </button>
                    </div>
                </div>
            );
        }

    };

    return (
        <div className="fixed inset-0 z-[100] bg-[rgb(var(--color-canvas))]/95 backdrop-blur-xl flex items-center justify-center p-4 text-[rgb(var(--color-text))]">
            <div className="w-full max-w-sm relative">
                {/* Progress Bar - Only valid in Intro Phase */}
                {step === 'intro' && (
                    <div className="absolute top-0 left-0 right-0 flex gap-1 p-1">
                        {SLIDES.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "h-1 flex-1 rounded-full",
                                    idx <= currentSlide ? "bg-[rgb(var(--color-primary))]" : "bg-[rgb(var(--color-border))]/20"
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* SETUP Progress Dots */}
                {step !== 'intro' && (
                    <div className="absolute top-0 left-0 right-0 flex justify-center gap-2 p-1">
                        <div className={cn("w-2 h-2 rounded-full", step === 'setup-name' ? "bg-[rgb(var(--color-primary))] w-6" : "bg-[rgb(var(--color-border))]/20")} />
                        <div className={cn("w-2 h-2 rounded-full", step === 'setup-gender' ? "bg-[rgb(var(--color-primary))] w-6" : "bg-[rgb(var(--color-border))]/20")} />
                        <div className={cn("w-2 h-2 rounded-full", step === 'setup-location' ? "bg-[rgb(var(--color-primary))] w-6" : "bg-[rgb(var(--color-border))]/20")} />
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
                            className="text-sm text-[rgb(var(--color-text))] font-semibold px-5 py-2.5 bg-[rgb(var(--color-surface-subtle))]/60 hover:bg-[rgb(var(--color-surface-subtle))] rounded-xl border border-[rgb(var(--color-border))]/20 transition-all flex items-center gap-2"
                        >
                            <span>{translations.onboardingSkip}</span>
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
                            className="text-sm text-[rgb(var(--color-text-muted))] font-medium px-4 py-2 hover:text-[rgb(var(--color-text-strong))] transition-colors"
                        >
                            {translations.onboardingBack}
                        </button>
                    )}

                    <Button
                        onClick={handleNext}
                        disabled={
                            (step === 'setup-gender' && !gender) ||
                            (step === 'setup-location' && !isLocationSet)
                        }
                        className="flex-1 h-12 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] hover:bg-[rgb(var(--color-primary-strong))] font-bold rounded-xl shadow-[var(--shadow-floating)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {step === 'setup-location' ? translations.onboardingFinish : translations.onboardingNext}
                        {step !== 'setup-location' && <ChevronRight className="w-4 h-4 ml-1" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
