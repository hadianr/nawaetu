"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { ArrowLeft, Bell, Volume2, MapPin, ChevronRight, Info, BookOpen, Clock, Music, Settings2, Headphones, Play, Pause, Palette, Crown, Lock, Check, Star, Sparkles, Sunrise, Sun, CloudSun, Moon, Sunset, BarChart3, ChevronDown, Heart, Globe, RefreshCcw } from "lucide-react";
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
import InfaqModal from "@/components/InfaqModal";
import AboutAppModal from "@/components/AboutAppModal";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
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
import { SETTINGS_TRANSLATIONS } from "@/data/settings-translations";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import NotificationSettings from "@/components/NotificationSettings";
import { APP_CONFIG } from "@/config/app-config";

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

function SettingsPageContent() {
    const searchParams = useSearchParams();
    const { data: session, status, update } = useSession(); // Add update
    const { data, refreshLocation, loading: locationLoading } = usePrayerTimes();
    const { currentTheme, setTheme } = useTheme();
    const { isMuhsinin: contextIsMuhsinin } = useInfaq();
    const { locale, setLocale, t } = useLocale();
    const { token: fcmToken } = useFCM();
    const [showInfaqModal, setShowInfaqModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Profile State
    const isAuthenticated = status === "authenticated";
    // FIXED: Only logged in users can be Muhsinin
    const isMuhsinin = isAuthenticated && (session?.user?.isMuhsinin || contextIsMuhsinin);

    // Payment Feedback & Sync Status
    useEffect(() => {
        const paymentStatus = searchParams.get("payment");
        if (paymentStatus === "success") {
            toast.success("Terima kasih! Infaq Anda berhasil diterima.", {
                description: "Status Muhsinin sedang diaktifkan...",
                duration: 5000
            });

            // Trigger manual sync for localhost or webhook delays
            fetch("/api/payment/sync")
                .then(res => res.json())
                .then(data => {
                    if (data.status === "verified") {
                        toast.success("Alhamdulillah, status Muhsinin Anda telah aktif!");
                        update(); // Refresh session data
                    }
                })
                .catch(err => {
                    console.error("Sync error:", err);
                    // Even if sync fail, we can suggest user to reload
                });
        } else if (paymentStatus === "failed") {
            toast.error("Maaf, pembayaran Anda tidak berhasil. Silakan coba lagi.");
        }
    }, [searchParams, update]);

    const [userName, setUserName] = useState("Sobat Nawaetu");
    const [userTitle, setUserTitle] = useState("Hamba Allah");
    const [userAvatar, setUserAvatar] = useState<string | null>(null);

    // New Settings State
    const [muadzin, setMuadzin] = useState(DEFAULT_SETTINGS.muadzin);
    const [calculationMethod, setCalculationMethod] = useState(DEFAULT_SETTINGS.calculationMethod.toString());

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
                    console.warn("Playback blocked by browser (Interaction required):", err);
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
        const [savedMuadzin, savedMethod] = storage.getMany([
            STORAGE_KEYS.SETTINGS_MUADZIN,
            STORAGE_KEYS.SETTINGS_CALCULATION_METHOD
        ]).values();

        refreshProfile();

        if (savedMuadzin) setMuadzin(savedMuadzin as string);
        if (savedMethod) setCalculationMethod(savedMethod as string);
    }, []);

    // Real-time avatar sync listener
    useEffect(() => {
        const handleAvatarUpdate = () => refreshProfile();
        window.addEventListener('avatar_updated', handleAvatarUpdate);
        return () => window.removeEventListener('avatar_updated', handleAvatarUpdate);
    }, []);

    const saveSettingsToCloud = async (key: string, value: any) => {
        if (!isAuthenticated) return;
        try {
            await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: { [key]: value } }) // Send partial update
            });
        } catch (e) {
            console.error("Failed to save setting to cloud", e);
        }
    };

    const handleThemeSelect = (themeId: ThemeId) => {
        const theme = THEMES[themeId];

        // Check if theme is premium and user is not premium
        if (theme.isPremium && !isMuhsinin) {
            setShowInfaqModal(true);
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
        storage.set(STORAGE_KEYS.SETTINGS_MUADZIN as any, value);
        saveSettingsToCloud('muadzin', value);
    };

    const handleCalculationMethodChange = (value: string) => {
        setCalculationMethod(value);
        storage.set(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD as any, value);
        saveSettingsToCloud('calculationMethod', value);
        // Trigger refresh of prayer times with new method
        window.dispatchEvent(new CustomEvent("calculation_method_changed", { detail: { method: value } }));
    };

    const handleLocaleChange = (value: string) => {
        setLocale(value);
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
                    <h1 className="text-2xl font-bold text-white">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].title}</h1>
                </div>

                {/* Profile Card - Compact */}
                <UserProfileDialog onProfileUpdate={refreshProfile}>
                    <div className="w-full p-4 bg-gradient-to-r from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary-dark))]/30 border border-[rgb(var(--color-primary))]/20 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-[rgb(var(--color-primary))]/40 transition-all group">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-full bg-[rgb(var(--color-primary))]/20 border-2 border-[rgb(var(--color-primary))]/40 flex items-center justify-center text-[rgb(var(--color-primary-light))] text-lg font-bold overflow-hidden p-0.5">
                                <Avatar className="w-full h-full rounded-full">
                                    <AvatarImage src={userAvatar || ""} className="object-cover" />
                                    <AvatarFallback className="bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] text-lg font-bold">
                                        {userName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            {(isMuhsinin || session?.user?.isMuhsinin) && (
                                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] rounded-full p-0.5 border-2 border-black z-10 shadow-lg">
                                    <Crown className="w-2.5 h-2.5 text-white fill-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-white truncate group-hover:text-[rgb(var(--color-primary-light))] transition-colors">{userName}</h3>
                            <span className="text-xs text-[rgb(var(--color-primary-light))]/70">{userTitle}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[rgb(var(--color-primary))] transition-colors flex-shrink-0" />
                    </div>
                </UserProfileDialog>



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
                                <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].locationLabel}</span>
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
                            {(isRefreshing || locationLoading) ? SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].locationUpdating : (data?.locationName?.split(',')[0] || SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].locationDetecting)}
                        </p>
                    </button>

                    <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors h-[84px]">
                        {/* Visual Layer - Exact copy of Location card structure */}
                        <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none z-0">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].methodLabel}</span>
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

                {/* Theme Configuration Card */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center gap-2 text-[rgb(var(--color-primary))]">
                        <Palette className="w-4 h-4" />
                        <span className="text-sm font-semibold text-white">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].themeTitle}</span>
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
                                                {isSelected && (
                                                    <div
                                                        className="absolute inset-0 rounded-full blur-md opacity-60 transition-all duration-500 animate-pulse"
                                                        style={{ backgroundColor: `rgb(${theme.colors.primary})` }}
                                                    />
                                                )}

                                                {/* Main Circle Content */}
                                                <div className="absolute inset-0 rounded-full overflow-hidden flex flex-col border border-white/10 z-10 shadow-2xl bg-black">
                                                    <div className="h-1/2 w-full transition-colors duration-500" style={{ backgroundColor: `rgb(${theme.colors.primary})` }} />
                                                    <div className="h-1/2 w-full flex">
                                                        <div className="w-1/2 h-full transition-colors duration-500" style={{ backgroundColor: `rgb(${theme.colors.accent})` }} />
                                                        <div className="w-1/2 h-full transition-colors duration-500" style={{ backgroundColor: `rgb(${theme.colors.surface})` }} />
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
                        <span className="text-sm font-semibold text-white">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].audioTitle}</span>
                    </div>

                    <div className="space-y-3">
                        {/* Muadzin Select */}
                        <div className="relative group bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-all">
                            {/* Visual Layer */}
                            <div className="flex items-center gap-3 flex-1 min-w-0 pointer-events-none">
                                <div className="p-2 rounded-full bg-[rgb(var(--color-primary))]/10 shrink-0">
                                    <Volume2 className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-0.5">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].muadzinLabel}</p>
                                    <p className="text-sm text-white font-medium truncate">{currentMuadzin?.label || "Makkah"}</p>
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
                                            ? "bg-[rgb(var(--color-primary))] text-white border-[rgb(var(--color-primary))] shadow-[0_0_15px_rgba(var(--color-primary),0.4)] scale-110"
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
                        <span className="text-sm font-semibold text-white">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].languageTitle}</span>
                    </div>

                    <Select value={locale} onValueChange={handleLocaleChange}>
                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                            {LANGUAGE_OPTIONS.map((lang) => (
                                <SelectItem
                                    key={lang.id}
                                    value={lang.id}
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

                {/* Troubleshooting / Reset App (v1.5.10) - Friendly UI */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <RefreshCcw className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                        <span className="text-sm font-bold text-white">Perbaiki Masalah Update</span>
                    </div>
                    <p className="text-[10px] text-white/50 mb-3 leading-relaxed">
                        Jika ada fitur yang tidak muncul atau versi aplikasi tidak berubah, coba bersihkan cache aplikasi.
                    </p>
                    <Button
                        onClick={handleManualReset}
                        variant="ghost"
                        className="w-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 font-bold h-9 rounded-xl transition-all"
                    >
                        Bersihkan Cache & Reload
                    </Button>
                </div>

                {/* Support Card (Persistent) - Swapped Back Up */}
                <div className="bg-gradient-to-br from-[rgb(var(--color-primary-dark))]/40 to-[rgb(var(--color-primary))]/20 border border-[rgb(var(--color-primary))]/20 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Heart className="w-4 h-4 text-[rgb(var(--color-primary-light))] fill-[rgb(var(--color-primary))]/20" />
                            <span className="text-sm font-bold text-white">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].supportTitle}</span>
                        </div>
                        <p className="text-[10px] text-[rgb(var(--color-primary-light))]/70 max-w-[200px] leading-relaxed">
                            {isMuhsinin
                                ? SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].supportPremiumText
                                : SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].supportText}
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowInfaqModal(true)}
                        size="sm"
                        className="bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white font-bold h-9 px-4 rounded-xl shadow-lg shadow-[rgb(var(--color-primary))]/20"
                    >
                        {isMuhsinin ? SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].infaqButtonPremium : SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].infaqButton}
                    </Button>
                </div>

                {/* Compact App Info Link - Swapped Back Down */}
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => setShowAboutModal(true)}
                        className="flex items-center gap-2 group transition-all active:scale-[0.98] py-2 px-4 rounded-full bg-white/5 border border-white/5 hover:bg-white/10"
                    >
                        <div className="w-5 h-5 bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] rounded-md flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">N</span>
                        </div>
                        <span className="text-[10px] font-bold text-white/60 group-hover:text-white transition-colors">
                            {SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].aboutAppName} {APP_CONFIG.version}
                        </span>
                        <ChevronRight className="w-3 h-3 text-white/30 group-hover:text-[rgb(var(--color-primary))] transition-colors" />
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

            <InfaqModal isOpen={showInfaqModal} onClose={() => setShowInfaqModal(false)} />
            <AboutAppModal open={showAboutModal} onOpenChange={setShowAboutModal} />
        </div >
    );
}

// Internal Component for Version Checking
function UpdateChecker({ currentVersion }: { currentVersion: string }) {
    const [serverVersion, setServerVersion] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch(`/api/system/version?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    setServerVersion(data.version);
                }
            } catch (e) {
                console.error("Version check failed", e);
            }
        };
        check();
    }, []);

    const parseSemver = (version: string) =>
        version.replace(/^v/, "").split(".").map((part) => Number(part));

    const compareSemver = (a: string, b: string) => {
        const aParts = parseSemver(a);
        const bParts = parseSemver(b);

        if (aParts.some(Number.isNaN) || bParts.some(Number.isNaN)) return 0;

        const length = Math.max(aParts.length, bParts.length);
        for (let i = 0; i < length; i += 1) {
            const aVal = aParts[i] ?? 0;
            const bVal = bParts[i] ?? 0;
            if (aVal > bVal) return 1;
            if (aVal < bVal) return -1;
        }

        return 0;
    };

    const isUpdateAvailable = () => {
        if (!serverVersion) return false;
        return compareSemver(serverVersion, currentVersion) === 1;
    };

    const handleUpdate = async () => {
        setChecking(true);
        
        console.log('[Update] Starting update process...');
        console.log('[Update] Current version:', currentVersion);
        console.log('[Update] Server version:', serverVersion);

        // AUTO-FIX: Perform cleanup silently when updating
        try {
            // 1. Update localStorage version to latest FIRST (before any async operations)
            if (serverVersion) {
                localStorage.setItem(STORAGE_KEYS.APP_VERSION, serverVersion);
                console.log('[Update] Set localStorage APP_VERSION to:', serverVersion);
                // Verify it was set correctly
                const verifyVersion = localStorage.getItem(STORAGE_KEYS.APP_VERSION);
                console.log('[Update] Verified localStorage APP_VERSION:', verifyVersion);
            } else {
                console.error('[Update] No server version available!');
                toast.error('Gagal mendapatkan versi server. Coba lagi.');
                setChecking(false);
                return;
            }

            // 2. Clear ALL session flags to allow fresh version check after reload
            sessionStorage.clear();
            console.log('[Update] Cleared sessionStorage');

            // 3. Unregister service workers
            if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                console.log('[Update] Unregistering', regs.length, 'service workers');
                for (const reg of regs) {
                    await reg.unregister();
                }
            }

            // 4. Clear all caches
            if ('caches' in window) {
                const keys = await caches.keys();
                console.log('[Update] Clearing', keys.length, 'caches');
                await Promise.all(keys.map(key => caches.delete(key)));
            }
            
            console.log('[Update] Cleanup complete, reloading...');
        } catch (e) {
            console.error("Cleanup failed during update:", e);
        }

        // Force reload with cache busting
        window.location.href = '/?updated=' + Date.now();
    };

    if (!isUpdateAvailable()) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50">
            <div className="bg-emerald-900/95 backdrop-blur-md border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-5">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Update Tersedia!</h3>
                        <p className="text-emerald-200/70 text-xs">Versi {serverVersion} siap digunakan.</p>
                    </div>
                </div>
                <Button
                    onClick={handleUpdate}
                    disabled={checking}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-9 rounded-xl"
                >
                    {checking ? "Memproses..." : "Update Sekarang"}
                </Button>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#0F172A] text-white">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCcw className="w-8 h-8 animate-spin text-emerald-500" />
                    <p className="text-sm animate-pulse">Memuat Pengaturan...</p>
                </div>
            </div>
        }>
            <SettingsPageContent />
        </Suspense>
    );
}

// Manual Reset/Repair Function
const handleManualReset = async () => {
    if (!confirm("Aplikasi akan dibersihkan dan dimuat ulang untuk memastikan versi terbaru berjalan lancar. Lanjutkan?")) return;

    console.log('[ManualReset] Starting manual reset...');
    console.log('[ManualReset] Current version:', APP_CONFIG.version);

    try {
        // 0. Update localStorage version to current FIRST
        localStorage.setItem(STORAGE_KEYS.APP_VERSION, APP_CONFIG.version);
        console.log('[ManualReset] Set localStorage APP_VERSION to:', APP_CONFIG.version);
        
        // Verify it was set correctly
        const verifyVersion = localStorage.getItem(STORAGE_KEYS.APP_VERSION);
        console.log('[ManualReset] Verified localStorage APP_VERSION:', verifyVersion);

        // 0.5. Clear ALL session storage for fresh start
        sessionStorage.clear();
        console.log('[ManualReset] Cleared sessionStorage');

        // 1. Unregister ALL Service Workers
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            console.log('[ManualReset] Unregistering', regs.length, 'service workers');
            for (const reg of regs) {
                await reg.unregister();
            }
        }

        // 2. Delete ALL Cache Storage
        if ('caches' in window) {
            const keys = await caches.keys();
            console.log('[ManualReset] Clearing', keys.length, 'caches');
            await Promise.all(keys.map(key => caches.delete(key)));
        }

        console.log('[ManualReset] Cleanup complete, reloading...');
        
        // 3. Force Hard Reload to Home with Cache Busting
        window.location.href = '/?reset=' + Date.now();
    } catch (e) {
        console.error('[ManualReset] Reset failed:', e);
        alert("Gagal melakukan reset. Silakan coba reinstall manual.");
        window.location.reload();
    }
};
