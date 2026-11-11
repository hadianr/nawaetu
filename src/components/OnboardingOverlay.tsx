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

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { Clock3, BookOpen, Flame, ChevronRight, Check, MapPin, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptic";
import { useSession } from "next-auth/react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { AppIcon } from "@/components/ui/AppIcon";
import AnimatedCheck from "@/components/ui/AnimatedCheck";
import LottieMoment from "@/components/ui/LottieMoment";

// The theme's pattern, drawn above the backdrop so it shows through like it does in the app.
const PatternOverlay = dynamic(() => import("@/components/PatternOverlay"), { ssr: false });

import { useLocale } from "@/context/LocaleContext";
import { useTheme, type ThemeId } from "@/context/ThemeContext";
import type { TranslationTree } from "@/context/LocaleContext";
import { sendGAEvent } from "@/lib/analytics/analytics";

const ONBOARDING_KEY = STORAGE_KEYS.ONBOARDING_COMPLETED;
// Analytics label only: tells the animated flow apart from the old one. The stored marker stays "v2".
const FLOW_VERSION = "v2-motion";
const STEPS = ["prayer", "quran", "intention", "setup-name", "setup-gender", "setup-location"] as const;
const INTRO_COUNT = 3;
const WELCOME_MS = 1800;
/** Dark text on bright colours, white on dark ones. Input is the "R G B" string the theme uses. */
function readableTextOn(rgb: string): string {
    const [r, g, b] = rgb.split(" ").map(Number);
    const lin = (c: number) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    // Whichever text colour has the higher WCAG contrast against this background.
    const dark = 0.013; // luminance of rgb(15 23 42)
    const onWhite = 1.05 / (luminance + 0.05);
    const onDark = (luminance + 0.05) / (dark + 0.05);
    return onDark > onWhite ? "rgb(15 23 42)" : "rgb(255 255 255)";
}

// Suggested on first setup only, never locked: Midnight from the first screen, then one per gender.
const START_THEME: ThemeId = "midnight";
const GENDER_THEME: Record<"male" | "female", ThemeId> = { male: "midnight", female: "blossom" };
const GENDER_LOTTIE = { male: "/lottie/lights.lottie", female: "/lottie/blossom.lottie" };

const CARD = "mt-8 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]/20 rounded-3xl p-6 shadow-[var(--shadow-floating)] overflow-hidden relative min-h-[380px] flex flex-col text-[rgb(var(--color-text))]";
const NOISE = <div className="absolute inset-0 bg-[url('/noise.svg')] bg-repeat opacity-10 mix-blend-overlay" />;

interface OnboardingOverlayProps {
    onComplete?: () => void;
}

/** The icon tile: the stand-in while an animation loads, and the design itself under reduced motion. */
function IconTile({ icon: Icon, color, bg, border }: { icon: LucideIcon; color: string; bg: string; border: string }) {
    return (
        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center border shadow-[var(--shadow-card)]", bg, border)}>
            <Icon className={cn("w-8 h-8", color)} />
        </div>
    );
}

export default function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
    const { status } = useSession();
    const { updateProfile } = useProfile();
    const { t, locale } = useLocale();
    const translations = t as TranslationTree;
    const reduced = useReducedMotion();
    const { currentTheme, setTheme, theme: activeTheme } = useTheme();
    // Text on the Next button follows the theme's button colour, so it stays readable on bright themes too.
    const nextTextColor = readableTextOn(activeTheme.colors.primary);
    // A theme the user already picked is respected; only someone who never picked one (or only has the default) gets suggestions.
    // "default" is what an app that never chose a theme stores, so it counts as unchosen; any other saved theme is kept.
    const [suggestTheme] = useState(() => {
        const saved = getStorageService().getOptional<string>(STORAGE_KEYS.SETTINGS_THEME);
        return !saved || saved === "default";
    });
    const startThemeApplied = useRef(false);
    // Layout effect: the theme lands before the first paint, so no frame of the default green shows.
    useLayoutEffect(() => {
        if (!suggestTheme || startThemeApplied.current) return;
        startThemeApplied.current = true;
        setTheme(START_THEME);
    }, [suggestTheme, setTheme]);
    const [stepIndex, setStepIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const step = STEPS[stepIndex];
    const isIntro = stepIndex < INTRO_COUNT;

    // loop: only files drawn as a loop repeat. The mosque and Quran build themselves in, so they play once and hold.
    const SLIDES = [
        {
            id: "prayer",
            src: "/lottie/mosque.lottie",
            loop: false,
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
            src: "/lottie/quran.lottie",
            loop: false,
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
            src: "/lottie/flame.lottie",
            loop: true,
            icon: Flame,
            color: "text-[rgb(var(--color-accent))]",
            bg: "bg-[rgb(var(--color-accent))]/10",
            border: "border-[rgb(var(--color-accent))]/20",
            title: translations.onboardingCardIntentionTitle,
            description: translations.onboardingCardIntentionDesc,
            highlight: translations.onboardingCardIntentionHint
        }
    ];

    // Profile State
    const [name, setName] = useState("");
    const [gender, setGender] = useState<'male' | 'female' | null>(null);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [isLocationSet, setIsLocationSet] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [isWelcoming, setIsWelcoming] = useState(false);
    const storage = getStorageService();
    const finalName = name.trim() || String(translations.onboardingDefaultName);

    useEffect(() => {
        sendGAEvent("onboarding_viewed", { version: FLOW_VERSION, locale: locale || "unknown" });
    }, [t, locale]);

    // Setup is already saved by now; the welcome is a short send-off the user can tap past.
    useEffect(() => {
        if (!isWelcoming) return;
        const id = window.setTimeout(() => onComplete?.(), WELCOME_MS);
        return () => window.clearTimeout(id);
    }, [isWelcoming, onComplete]);

    const goTo = (index: number) => {
        if (index < 0 || index >= STEPS.length || index === stepIndex) return;
        setDirection(index > stepIndex ? 1 : -1);
        setStepIndex(index);
        haptic();
    };

    const handleNext = () => {
        if (step === 'setup-gender' && !gender) return;
        if (step === 'setup-location') {
            if (isLocationSet) void handleFinish();
            return;
        }
        goTo(stepIndex + 1);
    };

    const handleFinish = async () => {
        if (isFinishing) return;
        setIsFinishing(true);

        // 1. Local Storage Update (Immediate)
        storage.set(STORAGE_KEYS.USER_NAME, finalName);
        storage.set(STORAGE_KEYS.USER_GENDER, gender);
        storage.set(ONBOARDING_KEY, "v2");

        // Verify the marker: the storage adapter intentionally ignores unavailable
        // storage, which otherwise makes onboarding appear complete until reload.
        let markerSaved = false;
        for (let attempt = 0; attempt < 3 && !markerSaved; attempt++) {
            try {
                markerSaved = window.localStorage.getItem(ONBOARDING_KEY) === "v2";
            } catch {
                markerSaved = false;
            }
            if (!markerSaved && attempt < 2) {
                await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
                storage.set(ONBOARDING_KEY, "v2");
            }
        }
        if (!markerSaved) {
            toast.error(String(translations.onboardingSaveError));
            setIsFinishing(false);
            return;
        }

        sendGAEvent("onboarding_completed", { version: FLOW_VERSION, theme: currentTheme });

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

        // Callback to parent: straight away without motion, after the welcome otherwise.
        if (reduced) {
            onComplete?.();
        } else {
            haptic([10, 40, 20]);
            setIsWelcoming(true);
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
        if (isIntro) {
            const slide = SLIDES[stepIndex];
            return (
                <div className={CARD}>
                    {NOISE}

                    <LottieMoment
                        src={slide.src}
                        loop={slide.loop}
                        quietLoad
                        className="relative z-10 mb-4 h-32 w-full"
                        fallback={<IconTile {...slide} />}
                        onPlay={() => sendGAEvent("onboarding_hero_played", { slide: slide.id })}
                    />

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
                <div className={cn(CARD, "items-center justify-center text-center")}>
                    {NOISE}
                    <div className="relative z-10 w-full space-y-6">
                        <LottieMoment
                            src="/lottie/wave.lottie"
                            loop
                            quietLoad
                            className="mx-auto h-20 w-20"
                            fallback={
                                <div className="w-16 h-16 bg-[rgb(var(--color-primary))]/15 border border-[rgb(var(--color-primary))]/30 rounded-2xl flex items-center justify-center shadow-[var(--shadow-card)]">
                                    <AppIcon name="hands" size="xl" tone="primary" />
                                </div>
                            }
                        />
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
                        {/* Fixed height so the greeting appearing never moves the input. */}
                        <p aria-live="polite" className="h-5 text-sm font-semibold text-[rgb(var(--color-primary))]">
                            {name.trim() && (
                                <motion.span initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="inline-block">
                                    {String(translations.onboardingGreeting).replace("{name}", name.trim())}
                                </motion.span>
                            )}
                        </p>
                    </div>
                </div>
            );
        }

        if (step === 'setup-gender') {
            const options = [
                { value: 'male', label: translations.onboardingMaleLabel, sub: translations.onboardingMaleSub, icon: "hands", tone: "info", selected: "bg-[rgb(var(--color-info))]/20 border-[rgb(var(--color-info))] text-[rgb(var(--color-text-strong))]", check: "text-[rgb(var(--color-info))]" },
                { value: 'female', label: translations.onboardingFemaleLabel, sub: translations.onboardingFemaleSub, icon: "heart-handshake", tone: "primary", selected: "bg-[rgb(var(--color-primary-light))]/20 border-[rgb(var(--color-primary-light))] text-[rgb(var(--color-text-strong))]", check: "text-[rgb(var(--color-primary-light))]" },
            ] as const;
            const chooseGender = (value: "male" | "female") => {
                setGender(value);
                haptic();
                if (suggestTheme) setTheme(GENDER_THEME[value]);
            };
            const heroSrc = gender ? GENDER_LOTTIE[gender] : "/lottie/stars.lottie";
            return (
                <div className={CARD}>
                    <div className="relative z-10 w-full space-y-4">
                        <LottieMoment key={heroSrc} src={heroSrc} loop quietLoad className="mx-auto h-24 w-40" />
                        <div className="text-center mb-2">
                            <h2 className="text-xl font-bold text-[rgb(var(--color-text-strong))]">{translations.onboardingGenderTitle}</h2>
                            <p className="text-xs text-[rgb(var(--color-text-muted))] mt-1">{translations.onboardingGenderDesc}</p>
                        </div>
                        <div className="grid gap-3">
                            {options.map(option => (
                                <motion.button
                                    key={option.value}
                                    type="button"
                                    whileTap={reduced ? undefined : { scale: 0.97 }}
                                    onClick={() => chooseGender(option.value)}
                                    aria-label={option.label}
                                    aria-pressed={gender === option.value}
                                    className={cn(
                                        "p-4 rounded-xl border transition-colors flex items-center gap-4 text-left",
                                        gender === option.value ? option.selected : "bg-[rgb(var(--color-surface-subtle))]/50 border-[rgb(var(--color-border))]/15 hover:bg-[rgb(var(--color-surface-subtle))]"
                                    )}
                                >
                                    <AppIcon name={option.icon} size="xl" tone={option.tone} />
                                    <div>
                                        <span className="font-bold block text-sm">{option.label}</span>
                                        <span className="text-[10px] opacity-70">{option.sub}</span>
                                    </div>
                                    {gender === option.value && <AnimatedCheck className={cn("ml-auto w-5 h-5", option.check)} />}
                                </motion.button>
                            ))}
                        </div>

                    </div>
                </div>
            );
        }

        return (
            <div className={cn(CARD, "items-center justify-center text-center")}>
                {NOISE}
                <div className="relative z-10 w-full space-y-6 flex flex-col items-center">
                    {isLocationSet ? (
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-[var(--shadow-card)] p-4 bg-[rgb(var(--color-success))]/20 text-[rgb(var(--color-success))] border border-[rgb(var(--color-success))]/30">
                            <AnimatedCheck className="w-8 h-8" />
                        </div>
                    ) : (
                        <LottieMoment
                            src="/lottie/pin.lottie"
                            loop
                            quietLoad
                            className="h-16 w-16"
                            fallback={
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-[var(--shadow-card)] p-4 bg-[rgb(var(--color-primary))]/15 text-[rgb(var(--color-primary-strong))] border border-[rgb(var(--color-primary))]/30">
                                    <MapPin className="w-8 h-8" />
                                </div>
                            }
                        />
                    )}
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
    };

    if (isWelcoming) {
        return (
            // Tap anywhere to continue; it also continues by itself, so no keyboard action is needed.
            <div
                onClick={() => onComplete?.()}
                className="fixed inset-0 z-[100] bg-[rgb(var(--color-canvas))]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 text-center"
            >
                <PatternOverlay />
                <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-2">
                    <LottieMoment src="/lottie/stars.lottie" hideOnComplete className="pointer-events-none h-28 w-52" />
                    <motion.p
                        role="status"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="text-2xl font-bold text-[rgb(var(--color-text-strong))]"
                    >
                        {String(
                            (gender === "male" && translations.onboardingWelcomeMale) ||
                            (gender === "female" && translations.onboardingWelcomeFemale) ||
                            translations.onboardingWelcome
                        ).replace("{name}", finalName)}
                    </motion.p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[rgb(var(--color-canvas))]/95 backdrop-blur-xl flex items-center justify-center p-4 text-[rgb(var(--color-text))]">
            <PatternOverlay />
            <div className="w-full max-w-sm relative z-10">
                {/* One progress bar across every step; scaleX keeps it off the layout path. */}
                <div
                    role="progressbar"
                    aria-valuemin={1}
                    aria-valuemax={STEPS.length}
                    aria-valuenow={stepIndex + 1}
                    className="absolute top-0 left-0 right-0 m-1 h-1 overflow-hidden rounded-full bg-[rgb(var(--color-border))]/20"
                >
                    <motion.div
                        className="h-full origin-left rounded-full bg-[rgb(var(--color-primary))]"
                        initial={false}
                        animate={{ scaleX: (stepIndex + 1) / STEPS.length }}
                        transition={{ duration: reduced ? 0 : 0.3, ease: "easeOut" }}
                    />
                </div>

                {/* RENDER CURRENT CONTENT */}
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={{
                            enter: (d: number) => ({ x: reduced ? 0 : d * 48, opacity: 0 }),
                            center: { x: 0, opacity: 1 },
                            exit: (d: number) => ({ x: reduced ? 0 : d * -48, opacity: 0 }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        // Swipe between intro slides; the buttons below do the same for keyboard and assistive tech.
                        drag={isIntro && !reduced ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.15}
                        onDragEnd={(_, info) => {
                            if (info.offset.x < -60) goTo(stepIndex + 1);
                            else if (info.offset.x > 60) goTo(stepIndex - 1);
                        }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>

                {/* Actions */}
                <div className="mt-8 flex items-center justify-between gap-4">
                    {isIntro ? (
                        <button
                            onClick={() => {
                                sendGAEvent("onboarding_skipped", { stage: "welcome" });
                                goTo(INTRO_COUNT);
                            }}
                            className="text-sm text-[rgb(var(--color-text))] font-semibold px-5 py-2.5 bg-[rgb(var(--color-surface-subtle))]/60 hover:bg-[rgb(var(--color-surface-subtle))] rounded-xl border border-[rgb(var(--color-border))]/20 transition-all flex items-center gap-2"
                        >
                            <span>{translations.onboardingSkip}</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => goTo(stepIndex - 1)}
                            className="text-sm text-[rgb(var(--color-text-muted))] font-medium px-4 py-2 hover:text-[rgb(var(--color-text-strong))] transition-colors"
                        >
                            {translations.onboardingBack}
                        </button>
                    )}

                    <Button
                        onClick={handleNext}
                        disabled={
                            isFinishing ||
                            (step === 'setup-gender' && !gender) ||
                            (step === 'setup-location' && !isLocationSet)
                        }
                        style={{ color: nextTextColor }}
                        className="flex-1 h-12 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))] font-bold rounded-xl shadow-[var(--shadow-floating)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {step === 'setup-location' ? translations.onboardingFinish : translations.onboardingNext}
                        {step !== 'setup-location' && <ChevronRight className="w-4 h-4 ml-1" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
