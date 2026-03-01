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

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Bell, Volume2, MapPin, ChevronRight, Info, BookOpen, Clock, Music, Settings2, Headphones, Play, Pause, Palette, Crown, Lock, Check, Star, Sunrise, Sun, CloudSun, Moon, Sunset, BarChart3, ChevronDown, Heart, Globe, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react"; // Import useSession
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import UserProfileDialog from "@/components/UserProfileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar
import DonationModal from "@/components/DonationModal";
import AboutAppModal from "@/components/AboutAppModal";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { useTheme, THEMES, ThemeId } from "@/context/ThemeContext";
import { useInfaq } from "@/context/InfaqContext";
import { useLocale } from "@/context/LocaleContext";
import { useFCM } from "@/hooks/useFCM";
import {
    MUADZIN_OPTIONS,
    CALCULATION_METHODS,
    DEFAULT_SETTINGS,
    LANGUAGE_OPTIONS,
} from "@/data/settings-data";
import { SETTINGS_TRANSLATIONS } from "@/data/translations";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import NotificationSettings from "@/components/NotificationSettings";
import PaymentSuccessModal from "@/components/PaymentSuccessModal";
import { APP_CONFIG } from "@/config/app-config";
import UpdateChecker from "@/components/UpdateChecker";

const storage = getStorageService();

interface AdhanPreferences {
    Fajr: boolean;
    Dhuhr: boolean;
    Asr: boolean;
    Maghrib: boolean;
    Isha: boolean;
    [key: string]: boolean;
}

const DEFAULT_PREFS: AdhanPreferences = {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
};

export default function SettingsPageContent() {
    const searchParams = useSearchParams();
    const { data: session, status, update } = useSession(); // Add update
    const { data, refreshLocation, loading: locationLoading } = usePrayerTimesContext();
    const { currentTheme, setTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const { isMuhsinin: contextIsMuhsinin } = useInfaq();
    const { locale, setLocale, t } = useLocale();
    const { token: fcmToken } = useFCM();
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Profile State
    const [userName, setUserName] = useState("Sobat Nawaetu");
    const [userTitle, setUserTitle] = useState("Hamba Allah");
    const [userAvatar, setUserAvatar] = useState<string | null>(null);

    // Initial Cache Load for Optimistic UI
    useEffect(() => {
        const [savedName, savedTitle, savedAvatar] = storage.getMany([
            STORAGE_KEYS.USER_NAME,
            STORAGE_KEYS.USER_TITLE,
            STORAGE_KEYS.USER_AVATAR
        ]).values();

        if (savedName) setUserName(savedName as string);
        if (savedTitle) setUserTitle(savedTitle as string);
        if (savedAvatar) setUserAvatar(savedAvatar as string | null);
    }, []);

    // Determining "Authenticated" for UI purposes:
    const hasCachedProfile = userName !== "Sobat Nawaetu";
    const isAuthenticated = status === "authenticated" || (status === "loading" && hasCachedProfile);

    // FIXED: Only logged in users can be Muhsinin
    const isMuhsinin = (status === "authenticated" && session?.user?.isMuhsinin) || contextIsMuhsinin;

    // Payment Feedback & Sync Status
    useEffect(() => {
        const paymentStatus = searchParams.get("payment");
        if (paymentStatus === "success") {
            setShowPaymentSuccessModal(true);
            fetch("/api/payment/sync")
                .then(res => res.json())
                .then(data => {
                    if (data.status === "verified") {
                        update();
                    }
                })
                .catch(err => { });
        } else if (paymentStatus === "failed") {
            toast.error("Maaf, pembayaran Anda tidak berhasil. Silakan coba lagi.");
        }
    }, [searchParams, update]);


    // New Settings State
    const [muadzin, setMuadzin] = useState(DEFAULT_SETTINGS.muadzin);
    const [calculationMethod, setCalculationMethod] = useState(DEFAULT_SETTINGS.calculationMethod.toString());
    const [hijriAdjustment, setHijriAdjustment] = useState("-1");

    // Audio Preview State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const audioRequestRef = useRef(0);
    const isMountedRef = useRef(true);

    const refreshProfile = () => {
        const [savedName, savedTitle, savedAvatar] = storage.getMany([
            STORAGE_KEYS.USER_NAME,
            STORAGE_KEYS.USER_TITLE,
            STORAGE_KEYS.USER_AVATAR
        ]).values();

        // 1. Prefer Session Name/Avatar if logged in
        if (session?.user?.name) setUserName(session.user.name);
        else if (savedName) setUserName(savedName as string);

        if (session?.user?.image) setUserAvatar(session.user.image);
        else setUserAvatar(savedAvatar as string | null);

        if (savedTitle) setUserTitle(savedTitle as string);
    };

    // Update profile when session changes
    useEffect(() => {
        refreshProfile();
    }, [session]);

    // Helper to safely stop audio without triggering error
    const stopCurrentAudio = (bumpRequest: boolean = true) => {
        if (bumpRequest) {
            audioRequestRef.current += 1;
        }


        if (audio) {
            audio.onended = null;
            audio.onerror = null;
            audio.pause();
            audio.src = "";
            setAudio(null);
        }
        if (!isMountedRef.current) return;
        setIsPlaying(false);
        setPlayingId(null);
        setIsLoading(false);
    };

    // Track mounted state for async audio callbacks
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Cleanup audio on unmount or audio instance change
    useEffect(() => {
        return () => {
            if (audio) {
                audio.onended = null;
                audio.onerror = null;
                audio.pause();
                audio.src = "";
            }
        };
    }, [audio]);

    const toggleAudioPreview = (id: string) => {
        // Stop current audio if playing same ID
        if (playingId === id && isPlaying) {
            stopCurrentAudio();
            return;
        }

        stopCurrentAudio(false);
        setIsLoading(true);
        setPlayingId(id);

        let audioUrl = "";

        const selectedMuadzin = MUADZIN_OPTIONS.find(m => m.id === id);
        if (!selectedMuadzin || !selectedMuadzin.audio_url) {
            stopCurrentAudio();
            return;
        }
        audioUrl = selectedMuadzin.audio_url;

        const requestId = audioRequestRef.current + 1;
        audioRequestRef.current = requestId;

        const newAudio = new Audio(audioUrl);
        newAudio.preload = "auto";

        let loadingTimeout: ReturnType<typeof setTimeout> | null = null;
        const clearLoadingTimeout = () => {
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
                loadingTimeout = null;
            }
        };

        loadingTimeout = setTimeout(() => {
            if (audioRequestRef.current !== requestId) return;
            if (!isMountedRef.current) return;
            setIsLoading(false);
        }, 4000);

        const markPlayable = () => {
            if (audioRequestRef.current !== requestId) return;
            if (!isMountedRef.current) return;
            clearLoadingTimeout();
            setIsLoading(false);
        };

        const markPlaying = () => {
            if (audioRequestRef.current !== requestId) return;
            if (!isMountedRef.current) return;
            clearLoadingTimeout();
            setIsLoading(false);
            setIsPlaying(true);
        };

        newAudio.onloadeddata = markPlayable;
        newAudio.oncanplay = markPlayable;
        newAudio.onplaying = markPlaying;
        newAudio.onplay = markPlaying;

        newAudio.oncanplaythrough = () => {
            if (audioRequestRef.current !== requestId) return;
            if (!isMountedRef.current) return;
            clearLoadingTimeout();
            setIsLoading(false);
            const playPromise = newAudio.play();
            if (playPromise) {
                playPromise.catch(err => {
                    const message = err instanceof Error ? err.message : "";
                    if (err?.name === "AbortError" || message.includes("interrupted by a call to pause")) {
                        return;
                    }
                    if (!isMountedRef.current) return;
                    setIsPlaying(false);
                    setIsLoading(false);
                });
            }
        };

        newAudio.onpause = () => {
            if (audioRequestRef.current !== requestId) return;
            if (!isMountedRef.current) return;
            setIsPlaying(false);
        };

        newAudio.onended = () => {
            if (audioRequestRef.current !== requestId) return;
            if (!isMountedRef.current) return;
            clearLoadingTimeout();
            setIsPlaying(false);
            setPlayingId(null);
        };

        newAudio.onerror = () => {
            if (audioRequestRef.current !== requestId) return;
            if (!isMountedRef.current) return;
            clearLoadingTimeout();
            setIsLoading(false);
            setIsPlaying(false);
            setPlayingId(null);
            // Ignore error if we are reloading or stopping
            if (newAudio.src) {
                alert("Gagal memutar pratinjau suara.");
            }
        };

        newAudio.load();

        setAudio(newAudio);
    };

    useEffect(() => {
        const [savedMuadzin, savedMethod, savedAdjustment] = storage.getMany([
            STORAGE_KEYS.SETTINGS_MUADZIN,
            STORAGE_KEYS.SETTINGS_CALCULATION_METHOD,
            STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT
        ]).values();

        refreshProfile();

        if (savedMuadzin) setMuadzin(savedMuadzin as string);
        if (savedMethod) setCalculationMethod(savedMethod as string);
        if (savedAdjustment) setHijriAdjustment(savedAdjustment as string);
    }, []);

    // Real-time avatar sync listener
    useEffect(() => {
        const handleAvatarUpdate = () => refreshProfile();
        window.addEventListener('avatar_updated', handleAvatarUpdate);
        return () => window.removeEventListener('avatar_updated', handleAvatarUpdate);
    }, []);

    const saveSettingsToCloud = async (key: string, value: string | number | boolean) => {
        if (!isAuthenticated) return;

        // Record timestamp to prevent race condition with restoreSettings
        const storageKey = `nawaetu_settings_${key}`;
        localStorage.setItem(`${storageKey}_last_changed`, Date.now().toString());

        try {
            await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: { [key]: value } }) // Send partial update
            });
        } catch (e) {
        }
    };

    const handleThemeSelect = (themeId: ThemeId) => {
        const theme = THEMES[themeId];

        // Safety check - ensure theme exists
        if (!theme) {
            return;
        }

        // Check if theme is premium and user is not premium
        if (theme.isPremium && !isMuhsinin) {
            setShowDonationModal(true);
            return;
        }

        setTheme(themeId);
        // ThemeContext usually saves to localStorage, but we need to explicit or hook into it.
        // Assuming setTheme updates context and local storage, but let's explicit save to cloud for sync
        saveSettingsToCloud('theme', themeId);
    };

    const handleMuadzinChange = (value: string) => {
        stopCurrentAudio();
        setMuadzin(value);
        storage.set(STORAGE_KEYS.SETTINGS_MUADZIN, value);
        saveSettingsToCloud('muadzin', value);
    };

    const handleCalculationMethodChange = (value: string) => {
        setCalculationMethod(value);
        storage.set(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD, value);
        saveSettingsToCloud('calculationMethod', value);
        // Trigger refresh of prayer times with new method
        window.dispatchEvent(new CustomEvent("calculation_method_changed", { detail: { method: value } }));
    };

    const handleHijriAdjustmentChange = (value: string) => {
        setHijriAdjustment(value);
        storage.set(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT, value);
        saveSettingsToCloud('hijriAdjustment', value);
        window.dispatchEvent(new CustomEvent("hijri_adjustment_changed", { detail: { adjustment: value } }));
    };

    const handleLocaleChange = (value: string) => {
        setLocale(value);
        saveSettingsToCloud('locale', value);
    };

    const prayerNames = [
        { key: "Fajr", label: "Subuh", Icon: Sunrise },
        { key: "Dhuhr", label: "Dzuhur", Icon: Sun },
        { key: "Asr", label: "Ashar", Icon: CloudSun },
        { key: "Maghrib", label: "Maghrib", Icon: Sunset },
        { key: "Isha", label: "Isya", Icon: Moon },
    ];

    const handleRefreshLocation = async () => {
        setIsRefreshing(true);
        await refreshLocation();
        // Add small delay for visual feedback
        setTimeout(() => setIsRefreshing(false), 1500);
    };

    // Get current selection labels
    const currentMuadzin = MUADZIN_OPTIONS.find(m => m.id === muadzin);
    const currentMethod = CALCULATION_METHODS.find(m => m.id.toString() === calculationMethod);

    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] px-4 py-6 font-sans sm:px-6 pb-nav">

            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">{t.title}</h1>
                </div>

                {/* Profile Card - Compact */}
                {/* Profile Card - Compact */}
                {(status === "loading" && !hasCachedProfile) ? (
                    <div className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 animate-pulse">
                        <div className="h-12 w-12 rounded-full bg-white/10" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 bg-white/10 rounded" />
                            <div className="h-3 w-20 bg-white/10 rounded" />
                        </div>
                    </div>
                ) : (
                    <UserProfileDialog onProfileUpdate={refreshProfile}>
                        <div className="w-full p-4 bg-gradient-to-r from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary-dark))]/30 border border-[rgb(var(--color-primary))]/20 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-[rgb(var(--color-primary))]/40 transition-all group">
                            <div className="relative">
                                <div className={cn(
                                    "h-12 w-12 rounded-full border-2 flex items-center justify-center text-lg font-bold overflow-hidden p-0.5 transition-all",
                                    isDaylight
                                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                        : "bg-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary))]/40 text-[rgb(var(--color-primary-light))]"
                                )}>
                                    <Avatar className="w-full h-full rounded-full">
                                        <AvatarImage src={userAvatar || session?.user?.image || ""} className="object-cover" />
                                        <AvatarFallback className={cn(
                                            "text-lg font-bold",
                                            isDaylight ? "bg-emerald-100 text-emerald-600" : "bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))]"
                                        )}>
                                            {(userName || "U").charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                {(isMuhsinin || session?.user?.isMuhsinin) && (
                                    <div className={cn(
                                        "absolute -top-1 -right-1 rounded-full p-0.5 border-2 z-10 shadow-lg transition-all",
                                        isDaylight
                                            ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-white"
                                            : "bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] border-black"
                                    )}>
                                        <Crown className="w-2.5 h-2.5 text-white fill-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-white truncate group-hover:text-[rgb(var(--color-primary-light))] transition-colors">{userName}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[rgb(var(--color-primary-light))]/70">{userTitle}</span>
                                    {!isAuthenticated && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 border border-white/5 text-white/50">
                                            Guest
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[rgb(var(--color-primary))] transition-colors flex-shrink-0" />
                        </div>
                    </UserProfileDialog>
                )}



                {/* Worship Configuration Hub */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Location - Clickable to Refresh */}
                    <button
                        onClick={handleRefreshLocation}
                        disabled={isRefreshing || locationLoading}
                        className="h-[84px] p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 hover:border-[rgb(var(--color-primary))]/30 transition-all group disabled:opacity-70 flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                                <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">{t.locationLabel}</span>
                            </div>
                            <svg
                                className={`w-3 h-3 text-white/30 group-hover:text-[rgb(var(--color-primary-light))] transition-all ${(isRefreshing || locationLoading) ? 'animate-spin text-[rgb(var(--color-primary-light))]' : ''}`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <p className="text-xs text-white font-medium line-clamp-1 leading-none mb-0.5">
                            {(isRefreshing || locationLoading) ? t.locationUpdating : (data?.locationName?.split(',')[0] || t.locationDetecting)}
                        </p>
                    </button>

                    <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors h-[84px]">
                        {/* Visual Layer - Exact copy of Location card structure */}
                        <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none z-0">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">{t.methodLabel}</span>
                                </div>
                                <ChevronDown className="w-3 h-3 text-white/30 group-hover:text-[rgb(var(--color-primary-light))] transition-colors" />
                            </div>
                            <p className="text-xs text-white font-medium line-clamp-1 leading-none mb-0.5">
                                {currentMethod?.label || "Kemenag RI"}
                            </p>
                        </div>

                        {/* Functional Layer - Invisible Select covering the whole card */}
                        <Select value={calculationMethod} onValueChange={handleCalculationMethodChange}>
                            <SelectTrigger className="absolute inset-0 w-full h-full bg-transparent border-none shadow-none focus:ring-0 z-10 opacity-0 cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800">
                                {CALCULATION_METHODS.map((method) => (
                                    <SelectItem key={method.id} value={method.id.toString()} className="text-slate-200 focus:bg-slate-800 focus:text-white">
                                        {method.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Prayer Notifications Card - Using NotificationSettings Component */}
                <NotificationSettings />

                {/* Hijri Date Settings Card */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                        <span className="text-sm font-semibold text-white">{t.hijriDateTitle}</span>
                    </div>

                    <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors h-[84px]">
                        {/* Visual Layer */}
                        <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none z-0">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">{t.hijriAdjustmentLabel}</span>
                                <ChevronDown className="w-3 h-3 text-white/30 group-hover:text-[rgb(var(--color-primary-light))] transition-colors" />
                            </div>
                            <div>
                                <p className="text-xs text-white font-medium line-clamp-1 leading-none mb-1">
                                    {hijriAdjustment === "0" ? t.adjustmentStandard :
                                        hijriAdjustment === "-1" ? t.adjustmentMuhammadiyah :
                                            `${t.adjustmentManual} (${hijriAdjustment})`}
                                </p>
                                <p className="text-[10px] text-white/40 line-clamp-1">
                                    {t.hijriDateDesc}
                                </p>
                            </div>
                        </div>

                        {/* Functional Layer */}
                        <Select value={hijriAdjustment} onValueChange={handleHijriAdjustmentChange}>
                            <SelectTrigger className="absolute inset-0 w-full h-full bg-transparent border-none shadow-none focus:ring-0 z-10 opacity-0 cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800">
                                <SelectItem value="0" className="text-slate-200 focus:bg-slate-800 focus:text-white">
                                    {t.adjustmentStandard}
                                </SelectItem>
                                <SelectItem value="-1" className="text-slate-200 focus:bg-slate-800 focus:text-white">
                                    {t.adjustmentMuhammadiyah}
                                </SelectItem>
                                <SelectItem value="-2" className="text-slate-200 focus:bg-slate-800 focus:text-white">
                                    {t.adjustmentManual} (-2)
                                </SelectItem>
                                <SelectItem value="1" className="text-slate-200 focus:bg-slate-800 focus:text-white">
                                    {t.adjustmentManual} (+1)
                                </SelectItem>
                                <SelectItem value="2" className="text-slate-200 focus:bg-slate-800 focus:text-white">
                                    {t.adjustmentManual} (+2)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Theme Configuration Card */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center gap-2 text-[rgb(var(--color-primary))]">
                        <Palette className="w-4 h-4" />
                        <span className="text-sm font-semibold text-white">{t.themeTitle}</span>
                    </div>

                    <div className="relative">
                        <div className="flex items-center gap-5 overflow-x-auto py-6 px-4 scrollbar-hide snap-x">
                            {/* Physical Spacer to prevent clipping (40px) */}
                            <div className="min-w-[40px] shrink-0" />

                            {Object.values(THEMES).sort((a, b) => (a.isPremium === b.isPremium ? 0 : a.isPremium ? 1 : -1)).map((theme, index, array) => {
                                const isSelected = currentTheme === theme.id;
                                const isLocked = theme.isPremium && !isMuhsinin;

                                // Check if this is the first PRO item to add a divider
                                const showDivider = index > 0 && theme.isPremium && !array[index - 1].isPremium;

                                return (
                                    <div key={theme.id} className="flex items-center gap-4 snap-start">
                                        {showDivider && (
                                            <div className="h-12 w-px bg-white/10 mx-2" />
                                        )}

                                        <button
                                            onClick={() => handleThemeSelect(theme.id)}
                                            className="flex flex-col items-center gap-3 group transition-all relative py-2 px-2"
                                        >
                                            <div className={cn(
                                                "relative rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                                                isSelected ? "w-16 h-16 z-10 ring-2 ring-[rgb(var(--color-primary))] ring-offset-4 ring-offset-black" : "w-12 h-12 hover:scale-110 opacity-60 hover:opacity-100 grayscale hover:grayscale-0"
                                            )}>

                                                {/* Ambient Glow for Selected */}
                                                {isSelected && theme?.colors && (
                                                    <div
                                                        className="absolute inset-0 rounded-full blur-md opacity-60 transition-all duration-500 animate-pulse"
                                                        style={{ backgroundColor: `rgb(${theme.colors.primary})` }}
                                                    />
                                                )}

                                                {/* Main Circle Content */}
                                                <div className="absolute inset-0 rounded-full overflow-hidden flex flex-col border border-white/10 z-10 shadow-2xl bg-black">
                                                    <div className="h-1/2 w-full transition-colors duration-500" style={{ backgroundColor: theme?.colors ? `rgb(${theme.colors.primary})` : 'rgb(16 185 129)' }} />
                                                    <div className="h-1/2 w-full flex">
                                                        <div className="w-1/2 h-full transition-colors duration-500" style={{ backgroundColor: theme?.colors ? `rgb(${theme.colors.accent})` : 'rgb(251 191 36)' }} />
                                                        <div className="w-1/2 h-full transition-colors duration-500" style={{ backgroundColor: theme?.colors ? `rgb(${theme.colors.surface})` : 'rgb(15 23 42)' }} />
                                                    </div>
                                                </div>

                                                {/* Premium/Lock Indicators - Floating outside for pop styling */}
                                                {theme.isPremium && (
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 rounded-full border-2 border-black z-20 shadow-lg flex items-center justify-center transition-all duration-300",
                                                        isSelected ? "w-6 h-6 bg-[rgb(var(--color-accent))]" : "w-4 h-4 bg-slate-800 border-[rgb(var(--color-accent))]/30"
                                                    )}>
                                                        {isLocked ? (
                                                            <Lock className={cn("text-black transition-all", isSelected ? "w-3 h-3" : "w-2 h-2")} />
                                                        ) : (
                                                            <Crown className={cn("transition-all", isSelected ? "w-3 h-3 text-black" : "w-2 h-2 text-[rgb(var(--color-accent))]")} />
                                                        )}
                                                    </div>
                                                )}

                                                {/* Selected Check Indicator */}
                                                {isSelected && (
                                                    <div className="absolute -top-1 -right-1 bg-[rgb(var(--color-primary))] rounded-full p-1 border-2 border-black z-20 shadow-lg scale-100 animate-in zoom-in duration-300">
                                                        <Check className="w-3 h-3 text-black" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>

                                            <span className={cn(
                                                "text-[10px] font-bold transition-all duration-300 truncate max-w-[70px]",
                                                isSelected ? "text-[rgb(var(--color-primary-light))] scale-110 translate-y-1" : "text-white/40 group-hover:text-white"
                                            )}>
                                                {theme.name}
                                            </span>
                                        </button>
                                    </div>
                                );
                            })}
                            {/* Physical Spacer End (40px) */}
                            <div className="min-w-[40px] shrink-0" />
                        </div>
                    </div>
                </div>

                {/* Audio Configuration Card */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-[rgb(var(--color-primary-light))]">
                        <Headphones className="w-4 h-4" />
                        <span className="text-sm font-semibold text-white">{t.audioTitle}</span>
                    </div>

                    <div className="space-y-3">
                        {/* Muadzin Select */}
                        <div className={cn(
                            "relative group border rounded-xl p-3 flex items-center justify-between transition-all",
                            isDaylight
                                ? "bg-white/40 border-slate-200/50 hover:bg-white/60 shadow-sm"
                                : "bg-white/5 border border-white/10 hover:bg-white/10"
                        )}>
                            {/* Visual Layer */}
                            <div className="flex items-center gap-3 flex-1 min-w-0 pointer-events-none">
                                <div className={cn(
                                    "p-2 rounded-full shrink-0",
                                    isDaylight ? "bg-emerald-50" : "bg-[rgb(var(--color-primary))]/10"
                                )}>
                                    <Volume2 className={cn(
                                        "w-4 h-4",
                                        isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]"
                                    )} />
                                </div>
                                <div className="min-w-0">
                                    <p className={cn(
                                        "text-[10px] uppercase tracking-wider font-bold mb-0.5",
                                        isDaylight ? "text-slate-400" : "text-white/40"
                                    )}>{t.muadzinLabel}</p>
                                    <p className={cn(
                                        "text-sm font-medium truncate",
                                        isDaylight ? "text-slate-900" : "text-white"
                                    )}>{currentMuadzin?.label || "Makkah"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Preview Button (Z-20 to sit above Select Trigger) */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 rounded-full shrink-0 transition-all duration-300 relative z-20 border flex items-center justify-center",
                                        isPlaying && playingId === muadzin
                                            ? isDaylight
                                                ? "bg-emerald-100 border-emerald-200 text-emerald-600 scale-110 shadow-sm"
                                                : "bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] border-[rgb(var(--color-primary))]/30 scale-110"
                                            : isDaylight
                                                ? "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600 hover:border-slate-300"
                                                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-105"
                                    )}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAudioPreview(muadzin);
                                    }}
                                    disabled={isLoading || !currentMuadzin?.audio_url}
                                >
                                    {isLoading && playingId === muadzin ? (
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : isPlaying && playingId === muadzin ? (
                                        <Pause className="w-3 h-3 fill-current" />
                                    ) : (
                                        <Play className="w-3 h-3 ml-0.5" />
                                    )}
                                </Button>

                                {/* Chevron Indicator */}
                                <ChevronDown className="w-4 h-4 text-white/30 group-hover:text-[rgb(var(--color-primary-light))] transition-colors" />
                            </div>

                            {/* Select Overlay (Z-10) */}
                            <Select value={muadzin} onValueChange={handleMuadzinChange}>
                                <SelectTrigger className="w-full h-full absolute inset-0 opacity-0 cursor-pointer [&>svg]:hidden z-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10">
                                    {MUADZIN_OPTIONS.map((option) => (
                                        <SelectItem key={option.id} value={option.id} className="text-white text-xs hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer transition-colors">
                                            <span>{option.label}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Language Settings Card */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                        <span className="text-sm font-semibold text-white">{t.languageTitle}</span>
                    </div>

                    <Select value={locale} onValueChange={handleLocaleChange}>
                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white h-11">
                            <SelectValue placeholder="Bahasa Indonesia">
                                {locale && LANGUAGE_OPTIONS.find(l => l.id === locale) ? (
                                    <span className="flex items-center gap-2">
                                        <span>{LANGUAGE_OPTIONS.find(l => l.id === locale)?.flag}</span>
                                        <span>{LANGUAGE_OPTIONS.find(l => l.id === locale)?.label}</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <span>🇮🇩</span>
                                        <span>Bahasa Indonesia</span>
                                    </span>
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                            {LANGUAGE_OPTIONS.map((lang) => (
                                <SelectItem
                                    key={lang.id}
                                    value={lang.id}
                                    textValue={lang.label}
                                    className="text-white text-sm hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-lg">{lang.flag}</span>
                                        <span>{lang.label}</span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Support Card (Persistent) - Swapped Back Up */}
                <div className={cn(
                    "border rounded-2xl p-4 flex items-center justify-between transition-all",
                    isDaylight
                        ? "bg-emerald-50 border-emerald-100 shadow-sm shadow-emerald-500/5"
                        : "bg-gradient-to-br from-[rgb(var(--color-primary-dark))]/40 to-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary))]/20"
                )}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Heart className={cn(
                                "w-4 h-4",
                                isDaylight ? "text-emerald-600 fill-emerald-200" : "text-[rgb(var(--color-primary-light))] fill-[rgb(var(--color-primary))]/20"
                            )} />
                            <span className={cn(
                                "text-sm font-bold",
                                isDaylight ? "text-slate-900" : "text-white"
                            )}>{t.supportTitle}</span>
                        </div>
                        <p className={cn(
                            "text-[10px] max-w-[200px] leading-relaxed",
                            isDaylight ? "text-slate-500" : "text-[rgb(var(--color-primary-light))]/70"
                        )}>
                            {isMuhsinin
                                ? t.supportPremiumText
                                : t.supportText}
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowDonationModal(true)}
                        size="sm"
                        className={cn(
                            "font-bold h-9 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98]",
                            isDaylight
                                ? "bg-[#10b981] hover:bg-[#059669] text-white shadow-emerald-200/50"
                                : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white shadow-[rgb(var(--color-primary))]/20"
                        )}
                    >
                        {isMuhsinin ? t.infaqButtonPremium : t.infaqButton}
                    </Button>
                </div>

                {/* Voting Banner - Ma'a Impact Innovation Prize 2026 (Permanent) */}
                <a
                    href="https://award.globalsadaqah.com/profiles/327"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        "block w-full relative overflow-hidden rounded-2xl group active:scale-[0.98] transition-transform border",
                        isDaylight
                            ? "bg-gradient-to-br from-emerald-50 to-white border-emerald-200 shadow-sm shadow-emerald-100"
                            : "border-emerald-800/40"
                    )}
                >
                    {!isDaylight && (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-[#0a2e1a]" />
                            <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-emerald-400/10 rounded-full blur-[30px]" />
                        </>
                    )}
                    <div className="relative z-10 p-4 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className={cn(
                                "text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5",
                                isDaylight ? "text-amber-600" : "text-amber-400"
                            )}>
                                {t.votingBannerLabel}
                            </p>
                            <p className={cn(
                                "text-sm font-black leading-tight truncate",
                                isDaylight ? "text-emerald-900" : "text-white"
                            )}>
                                {t.votingBannerTitle}
                            </p>
                            <p className={cn(
                                "text-[10px] mt-0.5",
                                isDaylight ? "text-slate-500" : "text-white/60"
                            )}>
                                {t.votingBannerSubtitle}
                            </p>
                        </div>
                        <div className={cn(
                            "shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors",
                            isDaylight
                                ? "bg-emerald-600 group-hover:bg-emerald-700 shadow-sm"
                                : "bg-amber-400 group-hover:bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                        )}>
                            <Star className={cn(
                                "w-3 h-3",
                                isDaylight ? "text-white fill-white" : "text-emerald-900 fill-emerald-900"
                            )} />
                            <span className={cn(
                                "text-[10px] font-black whitespace-nowrap",
                                isDaylight ? "text-white" : "text-emerald-900"
                            )}>
                                {t.votingBannerCta}
                            </span>
                        </div>
                    </div>
                </a>

                {/* Compact App Info Link - Swapped Back Down */}
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => setShowAboutModal(true)}
                        className={cn(
                            "flex items-center gap-2 group transition-all active:scale-[0.98] py-2 px-4 rounded-full border",
                            isDaylight
                                ? "bg-slate-100 border-slate-200 hover:bg-slate-200/50"
                                : "bg-[rgb(var(--color-primary))]/5 border border-[rgb(var(--color-primary))]/10 hover:bg-[rgb(var(--color-primary))]/10"
                        )}
                    >
                        <div className={cn(
                            "w-5 h-5 rounded-md flex items-center justify-center transition-all",
                            isDaylight
                                ? "bg-gradient-to-br from-emerald-400 to-teal-400 shadow-sm"
                                : "bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))]"
                        )}>
                            <span className="text-[10px] font-bold text-white">N</span>
                        </div>
                        <span className={cn(
                            "text-[10px] font-bold transition-colors",
                            isDaylight ? "text-slate-600" : "text-white/60"
                        )}>
                            {t.aboutAppName} {APP_CONFIG.version}
                        </span>
                        <ChevronRight className={cn(
                            "w-3 h-3 transition-colors",
                            isDaylight ? "text-slate-400 group-hover:text-emerald-500" : "text-[rgb(var(--color-primary))]/40 group-hover:text-[rgb(var(--color-primary))]"
                        )} />
                    </button>
                </div>

                {/* Update Available Banner - New Feature v1.5.5 */}
                {typeof window !== 'undefined' && (
                    <UpdateChecker currentVersion={APP_CONFIG.version} />
                )}

                {/* Debug Tools - Only visible in development */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between text-white/40">
                            <div className="flex items-center gap-2">
                                <Settings2 className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Developer Tools</span>
                            </div>
                            <Link
                                href="/notification-debug"
                                className="text-[10px] bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-900/50 hover:bg-red-900/50 transition-colors"
                            >
                                Open Debugger
                            </Link>
                        </div>
                        {fcmToken ? (
                            <div className="bg-black/60 p-3 rounded-xl border border-white/10">
                                <p className="text-[10px] font-mono text-[rgb(var(--color-primary-light))]/70 break-all leading-relaxed">
                                    {fcmToken}
                                </p>
                            </div>
                        ) : (
                            <p className="text-[9px] text-white/20 italic">
                                Token belum tersedia. Klik "Open Debugger" untuk mencoba mengambil token.
                            </p>
                        )}
                    </div>
                )}
            </div>

            <PaymentSuccessModal
                isOpen={showPaymentSuccessModal}
                onClose={() => {
                    setShowPaymentSuccessModal(false);
                    // Clean URL parameter without refresh
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.delete('payment');
                    window.history.replaceState({}, '', newUrl);
                }}
            />
            <DonationModal isOpen={showDonationModal} onClose={() => setShowDonationModal(false)} />
            <AboutAppModal open={showAboutModal} onOpenChange={setShowAboutModal} />
        </div >
    );
}
