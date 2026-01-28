"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Bell, Volume2, MapPin, ChevronRight, Info, BookOpen, Clock, Music, Settings2, Headphones, Play, Pause, Palette, Crown, Lock, Check, Star, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
import PricingModal from "@/components/PricingModal";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useTheme, THEMES, ThemeId } from "@/context/ThemeContext";
import { usePremium } from "@/context/PremiumContext";
import {
    MUADZIN_OPTIONS,
    QURAN_RECITER_OPTIONS,
    CALCULATION_METHODS,
    DEFAULT_SETTINGS,
} from "@/data/settings-data";

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

export default function SettingsPage() {
    const { data, refreshLocation, loading: locationLoading } = usePrayerTimes();
    const { currentTheme, setTheme } = useTheme();
    const { isPremium } = usePremium();
    const [showPricing, setShowPricing] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [preferences, setPreferences] = useState<AdhanPreferences>(DEFAULT_PREFS);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Profile State
    const [userName, setUserName] = useState("Sobat Nawaetu");
    const [userTitle, setUserTitle] = useState("Hamba Allah");
    const [userAvatar, setUserAvatar] = useState<string | null>(null);

    // New Settings State
    const [muadzin, setMuadzin] = useState(DEFAULT_SETTINGS.muadzin);
    const [reciter, setReciter] = useState(DEFAULT_SETTINGS.reciter.toString());
    const [calculationMethod, setCalculationMethod] = useState(DEFAULT_SETTINGS.calculationMethod.toString());

    // Audio Preview State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    const refreshProfile = () => {
        const savedName = localStorage.getItem("user_name");
        const savedTitle = localStorage.getItem("user_title");
        const savedAvatar = localStorage.getItem("user_avatar");
        if (savedName) setUserName(savedName);
        if (savedTitle) setUserTitle(savedTitle);
        setUserAvatar(savedAvatar);
    };

    // Helper to safely stop audio without triggering error
    const stopCurrentAudio = () => {
        if (audio) {
            audio.onended = null;
            audio.onerror = null;
            audio.pause();
            audio.src = "";
            setAudio(null);
        }
        setIsPlaying(false);
        setPlayingId(null);
        setIsLoading(false);
    };

    // Cleanup audio on unmount
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

    const toggleAudioPreview = (id: string, type: 'qari' | 'muadzin' = 'qari') => {
        // Stop current audio if playing same ID
        if (playingId === id && isPlaying) {
            stopCurrentAudio();
            return;
        }

        stopCurrentAudio();
        setIsLoading(true);
        setPlayingId(id);

        let audioUrl = "";

        if (type === 'qari') {
            const selectedQari = QURAN_RECITER_OPTIONS.find(r => r.id.toString() === id);
            if (!selectedQari) {
                stopCurrentAudio();
                return;
            }
            // Al-Fatihah Verse 1 sample
            audioUrl = selectedQari.audio_url_format.replace("{verse}", "1");
        } else {
            const selectedMuadzin = MUADZIN_OPTIONS.find(m => m.id === id);
            if (!selectedMuadzin || !selectedMuadzin.audio_url) {
                stopCurrentAudio();
                return;
            }
            audioUrl = selectedMuadzin.audio_url;
        }

        const newAudio = new Audio(audioUrl);

        newAudio.oncanplaythrough = () => {
            setIsLoading(false);
            newAudio.play();
            setIsPlaying(true);
        };

        newAudio.onended = () => {
            setIsPlaying(false);
            setPlayingId(null);
        };

        newAudio.onerror = () => {
            setIsLoading(false);
            setIsPlaying(false);
            setPlayingId(null);
            // Ignore error if we are reloading or stopping
            if (newAudio.src) {
                alert("Gagal memutar pratinjau suara.");
            }
        };

        setAudio(newAudio);
    };

    useEffect(() => {
        // Init logic
        if (typeof window !== "undefined" && "Notification" in window) {
            setNotificationsEnabled(Notification.permission === "granted");
        }
        const saved = localStorage.getItem("adhan_preferences");
        if (saved) {
            try { setPreferences(JSON.parse(saved)); } catch (e) { }
        }
        refreshProfile();

        // Load new settings
        const savedMuadzin = localStorage.getItem("settings_muadzin");
        const savedReciter = localStorage.getItem("settings_reciter");
        const savedMethod = localStorage.getItem("settings_calculation_method");
        if (savedMuadzin) setMuadzin(savedMuadzin);
        if (savedReciter) setReciter(savedReciter);
        if (savedMethod) setCalculationMethod(savedMethod);
    }, []);

    // Real-time avatar sync listener
    useEffect(() => {
        const handleAvatarUpdate = () => refreshProfile();
        window.addEventListener('avatar_updated', handleAvatarUpdate);
        return () => window.removeEventListener('avatar_updated', handleAvatarUpdate);
    }, []);

    const requestPermission = async () => {
        if (!("Notification" in window)) {
            alert("Browser ini tidak mendukung notifikasi.");
            return;
        }
        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === "granted");
        if (permission !== "granted") {
            alert("Izin notifikasi ditolak. Mohon aktifkan di pengaturan browser Anda.");
        }
    };

    const togglePrayer = (prayer: string) => {
        if (!notificationsEnabled) {
            requestPermission();
            return;
        }
        const newPrefs = { ...preferences, [prayer]: !preferences[prayer] };
        setPreferences(newPrefs);
        localStorage.setItem("adhan_preferences", JSON.stringify(newPrefs));
    };

    const handleThemeSelect = (themeId: ThemeId) => {
        const theme = THEMES[themeId];

        // Check if theme is premium and user is not premium
        if (theme.isPremium && !isPremium) {
            setShowPricing(true);
            return;
        }

        setTheme(themeId);
    };

    const handleMuadzinChange = (value: string) => {
        stopCurrentAudio();
        setMuadzin(value);
        localStorage.setItem("settings_muadzin", value);
    };

    const handleReciterChange = (value: string) => {
        // Stop audio if playing when changing reciter
        stopCurrentAudio();

        setReciter(value);
        localStorage.setItem("settings_reciter", value);
        // Also set cookie for server-side access (VerseBrowser)
        document.cookie = `settings_reciter=${value}; path=/; max-age=31536000`; // 1 year expiry
    };

    const handleCalculationMethodChange = (value: string) => {
        setCalculationMethod(value);
        localStorage.setItem("settings_calculation_method", value);
        // Trigger refresh of prayer times with new method
        window.dispatchEvent(new CustomEvent("calculation_method_changed", { detail: { method: value } }));
    };

    const prayerNames = [
        { key: "Fajr", label: "Subuh", icon: "🌙" },
        { key: "Dhuhr", label: "Dzuhur", icon: "☀️" },
        { key: "Asr", label: "Ashar", icon: "🌤️" },
        { key: "Maghrib", label: "Maghrib", icon: "🌅" },
        { key: "Isha", label: "Isya", icon: "🌃" },
    ];

    const handleRefreshLocation = async () => {
        setIsRefreshing(true);
        await refreshLocation();
        // Add small delay for visual feedback
        setTimeout(() => setIsRefreshing(false), 1500);
    };

    // Get current selection labels
    const currentMuadzin = MUADZIN_OPTIONS.find(m => m.id === muadzin);
    const currentReciter = QURAN_RECITER_OPTIONS.find(r => r.id.toString() === reciter);
    const currentMethod = CALCULATION_METHODS.find(m => m.id.toString() === calculationMethod);

    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] px-4 py-6 font-sans sm:px-6 pb-24">

            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Pengaturan</h1>
                </div>

                {/* Profile Card - Compact */}
                <UserProfileDialog onProfileUpdate={refreshProfile}>
                    <div className="w-full p-4 bg-gradient-to-r from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary-dark))]/30 border border-[rgb(var(--color-primary))]/20 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-[rgb(var(--color-primary))]/40 transition-all group">
                        <div className="h-12 w-12 rounded-full bg-[rgb(var(--color-primary))]/20 border-2 border-[rgb(var(--color-primary))]/40 flex items-center justify-center text-[rgb(var(--color-primary-light))] text-lg font-bold relative overflow-hidden">
                            {/* Avatar Display - Image/Emoji/Initial */}
                            {userAvatar ? (
                                userAvatar.startsWith('data:') ? (
                                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl">{userAvatar}</span>
                                )
                            ) : (
                                <span>{userName.charAt(0).toUpperCase()}</span>
                            )}
                            {isPremium && (
                                <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5 border-2 border-black z-10">
                                    <Crown className="w-3 h-3 text-black fill-black" />
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

                {/* Quick Settings Row */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Location - Clickable to Refresh */}
                    <button
                        onClick={handleRefreshLocation}
                        disabled={isRefreshing}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 hover:border-blue-500/30 transition-all group disabled:opacity-70"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                                <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Lokasi</span>
                            </div>
                            <svg
                                className={`w-3 h-3 text-white/30 group-hover:text-[rgb(var(--color-primary-light))] transition-all ${isRefreshing ? 'animate-spin text-[rgb(var(--color-primary-light))]' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <p className="text-sm text-white font-medium truncate">
                            {isRefreshing ? "Memperbarui..." : (data?.locationName?.split(',')[0] || "Mendeteksi...")}
                        </p>
                    </button>

                    {/* Notification Status - Shows how many prayers enabled */}
                    {(() => {
                        const enabledCount = notificationsEnabled
                            ? Object.values(preferences).filter(Boolean).length
                            : 0;
                        const isAnyEnabled = enabledCount > 0;

                        return (
                            <button
                                onClick={!notificationsEnabled ? requestPermission : undefined}
                                className={`p-3 rounded-xl border text-left transition-all ${isAnyEnabled
                                    ? 'bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20'
                                    : notificationsEnabled
                                        ? 'bg-amber-500/10 border-amber-500/20'
                                        : 'bg-red-500/10 border-red-500/20 hover:border-red-500/40'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Bell className={`w-4 h-4 ${isAnyEnabled ? 'text-[rgb(var(--color-primary-light))]' : notificationsEnabled ? 'text-amber-400' : 'text-red-400'
                                        }`} />
                                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Notifikasi</span>
                                </div>
                                <p className={`text-sm font-medium ${isAnyEnabled ? 'text-[rgb(var(--color-primary-light))]' : notificationsEnabled ? 'text-amber-400' : 'text-red-400'
                                    }`}>
                                    {!notificationsEnabled
                                        ? "Nonaktif"
                                        : isAnyEnabled
                                            ? `${enabledCount}/5 Aktif`
                                            : "0 Aktif"
                                    }
                                </p>
                            </button>
                        );
                    })()}
                </div>

                {/* Main Settings Card */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">

                    {/* Prayer Notifications Section */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Volume2 className="w-4 h-4 text-amber-400" />
                                <span className="text-sm font-semibold text-white">Notifikasi Adzan</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {prayerNames.map((prayer) => {
                                const isEnabled = preferences[prayer.key] && notificationsEnabled;
                                return (
                                    <button
                                        key={prayer.key}
                                        onClick={() => togglePrayer(prayer.key)}
                                        disabled={!notificationsEnabled}
                                        className={cn(
                                            "flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all relative",
                                            isEnabled
                                                ? 'bg-[rgb(var(--color-primary))]/20 border border-[rgb(var(--color-primary))]/30'
                                                : 'bg-white/5 border border-white/10 opacity-60'
                                        )}
                                    >
                                        <span className="text-base">{prayer.icon}</span>
                                        <span className={cn(
                                            "text-[9px] font-medium",
                                            isEnabled ? 'text-[rgb(var(--color-primary-light))]' : 'text-white/60'
                                        )}>
                                            {prayer.label}
                                        </span>
                                        {isEnabled && (
                                            <div className="absolute -top-1 -right-1 bg-[rgb(var(--color-primary))] rounded-full p-0.5">
                                                <Check className="w-2 h-2 text-black" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {!notificationsEnabled && (
                            <p className="text-xs text-amber-400/70 mt-2 text-center">
                                Aktifkan notifikasi untuk menerima pengingat adzan
                            </p>
                        )}
                    </div>

                    {/* Theme Appearance Section */}
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Palette className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                            <span className="text-sm font-semibold text-white">Tampilan Aplikasi</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {Object.values(THEMES).map((theme) => {
                                const isSelected = currentTheme === theme.id;
                                const isLocked = theme.isPremium && !isPremium;
                                const hasPattern = theme.pattern && theme.pattern.type !== 'none';

                                return (
                                    <button
                                        key={theme.id}
                                        onClick={() => handleThemeSelect(theme.id)}
                                        className={cn(
                                            "relative p-3 rounded-xl border transition-all text-left group overflow-hidden",
                                            isSelected
                                                ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 ring-1 ring-[rgb(var(--color-primary))]/50"
                                                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                                        )}
                                    >
                                        {/* Theme Preview Bar */}
                                        <div className="flex gap-1 mb-2">
                                            <div
                                                className="h-5 flex-1 rounded"
                                                style={{ backgroundColor: `rgb(${theme.colors.primary})` }}
                                            />
                                            <div
                                                className="h-5 flex-1 rounded"
                                                style={{ backgroundColor: `rgb(${theme.colors.accent})` }}
                                            />
                                        </div>

                                        {/* Theme Info */}
                                        <div className="space-y-0.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <h3 className="font-bold text-xs text-white">{theme.name}</h3>
                                                    {hasPattern && !isLocked && (
                                                        <Sparkles className="w-2.5 h-2.5 text-[rgb(var(--color-primary))]" />
                                                    )}
                                                </div>
                                                {isLocked ? (
                                                    <Lock className="w-3 h-3 text-amber-400" />
                                                ) : isSelected ? (
                                                    <Check className="w-3 h-3 text-[rgb(var(--color-primary))]" />
                                                ) : null}
                                            </div>
                                            <p className="text-[9px] text-white/60 leading-tight line-clamp-2">{theme.description}</p>
                                        </div>

                                        {/* Locked Overlay */}
                                        {isLocked && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[8px] font-bold text-amber-400 flex items-center gap-0.5">
                                                    <Crown className="w-2.5 h-2.5" />
                                                    Premium
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Audio Settings Section */}
                    <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Headphones className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                            <span className="text-sm font-semibold text-white">Pengaturan Audio</span>
                        </div>

                        {/* Muadzin Select */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white/60">Suara Adzan</p>
                                    <p className="text-sm text-white font-medium truncate">{currentMuadzin?.label || "Makkah"}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 shrink-0",
                                        isPlaying && playingId === muadzin && !currentMuadzin?.audio_url && "opacity-50 cursor-not-allowed",
                                        isPlaying && playingId === muadzin && "text-amber-400 bg-amber-500/10"
                                    )}
                                    onClick={() => toggleAudioPreview(muadzin, 'muadzin')}
                                    disabled={isLoading || !currentMuadzin?.audio_url}
                                >
                                    {isLoading && playingId === muadzin ? (
                                        <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                    ) : isPlaying && playingId === muadzin ? (
                                        <Volume2 className="w-4 h-4 animate-pulse" />
                                    ) : (
                                        <Music className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                            <Select value={muadzin} onValueChange={handleMuadzinChange}>
                                <SelectTrigger className="w-auto min-w-[100px] h-8 text-xs bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10">
                                    {MUADZIN_OPTIONS.map((option) => (
                                        <SelectItem key={option.id} value={option.id} className="text-white text-xs hover:bg-white/10">
                                            <span>{option.label}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reciter Select */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white/60">Qari Al-Quran</p>
                                    <p className="text-sm text-white font-medium truncate">{currentReciter?.label || "Mishary Rashid"}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 shrink-0",
                                        isPlaying && playingId === reciter && "text-[rgb(var(--color-primary-light))] bg-[rgb(var(--color-primary))]/10"
                                    )}
                                    onClick={() => toggleAudioPreview(reciter)}
                                    disabled={isLoading}
                                >
                                    {isLoading && playingId === reciter ? (
                                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                                    ) : isPlaying && playingId === reciter ? (
                                        <Volume2 className="w-4 h-4 animate-pulse" />
                                    ) : (
                                        <Music className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                            <Select value={reciter} onValueChange={handleReciterChange}>
                                <SelectTrigger className="w-auto min-w-[100px] h-8 text-xs bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10">
                                    {QURAN_RECITER_OPTIONS.map((option) => (
                                        <SelectItem key={option.id} value={option.id.toString()} className="text-white text-xs hover:bg-white/10">
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Calculation Method Section */}
                    <div className="p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="p-2 rounded-lg bg-sky-500/10">
                                    <Clock className="w-4 h-4 text-sky-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-white/60">Metode Perhitungan</p>
                                    <p className="text-sm text-white font-medium truncate">{currentMethod?.label || "Kemenag RI"}</p>
                                </div>
                            </div>
                            <Select value={calculationMethod} onValueChange={handleCalculationMethodChange}>
                                <SelectTrigger className="w-auto min-w-[120px] h-8 text-xs bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10">
                                    {CALCULATION_METHODS.map((option) => (
                                        <SelectItem key={option.id} value={option.id.toString()} className="text-white text-xs hover:bg-white/10">
                                            <span>{option.label}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* App Info - Footer Style */}
                <div className="space-y-3">
                    <Link href="/stats" className="block p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl hover:border-amber-500/30 transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/20 rounded-lg">
                                <Star className="w-4 h-4 text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-amber-200">Lihat Statistik Ibadah</h3>
                                <p className="text-xs text-amber-200/70">Pantau perkembangan spiritualmu</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-amber-400/50 group-hover:text-amber-400 transition-colors" />
                        </div>
                    </Link>

                    <div className="flex items-center justify-center gap-2 py-4 opacity-40">
                        <span className="text-xs text-white">Nawaetu</span>
                        <span className="text-[8px] text-white/50">•</span>
                        <span className="text-xs text-white/70">v1.0.0 Beta</span>
                    </div>
                </div>
            </div>

            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
        </div>
    );
}
