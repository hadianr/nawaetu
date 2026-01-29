"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Bell, Volume2, MapPin, ChevronRight, Info, BookOpen, Clock, Music, Settings2, Headphones, Play, Pause, Palette, Crown, Lock, Check, Star, Sparkles, Sunrise, Sun, CloudSun, Moon, Sunset, BarChart3, ChevronDown } from "lucide-react";
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

                {/* Quick Stats Entry */}
                <Link
                    href="/stats"
                    className="w-full p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 hover:border-amber-500/40 transition-all group active:scale-[0.98]"
                >
                    <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                        <BarChart3 className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-amber-200 group-hover:text-amber-100 transition-colors">Statistik Ibadah</h3>
                        <div className="flex items-center gap-2">
                            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-[70%]" />
                            </div>
                            <span className="text-[10px] text-amber-200/60">Level 5</span>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-500/50 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </Link>

                {/* Worship Configuration Hub */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Location - Clickable to Refresh */}
                    <button
                        onClick={handleRefreshLocation}
                        disabled={isRefreshing}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 hover:border-blue-500/30 transition-all group disabled:opacity-70 flex flex-col justify-between min-h-[80px]"
                    >
                        <div className="flex items-center justify-between w-full mb-1">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                                <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Lokasi</span>
                            </div>
                            <svg
                                className={`w-3 h-3 text-white/30 group-hover:text-[rgb(var(--color-primary-light))] transition-all ${isRefreshing ? 'animate-spin text-[rgb(var(--color-primary-light))]' : ''}`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <p className="text-xs text-white font-medium line-clamp-2 leading-relaxed">
                            {isRefreshing ? "Memperbarui..." : (data?.locationName?.split(',')[0] || "Mendeteksi...")}
                        </p>
                    </button>

                    {/* Calculation Method - Moved from bottom */}
                    {/* Calculation Method - Entire Card is now Trigger */}
                    {/* Calculation Method - Overlay Pattern for 100% Hit Area */}
                    <div className="relative group bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors min-h-[80px]">
                        {/* Visual Layer (Pointer events none to let clicks pass to absolute trigger if needed, but z-index handles it) */}
                        <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
                            <div className="flex items-center justify-between w-full mb-1">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-sky-400" />
                                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Metode</span>
                                </div>
                                {/* Visual Chevron */}
                                <ChevronDown className="w-3 h-3 text-white/30 group-hover:text-[rgb(var(--color-primary-light))] transition-colors" />
                            </div>
                            <span className="text-xs text-white font-medium text-left truncate w-full pr-4">{currentMethod?.label || "Kemenag RI"}</span>
                        </div>

                        {/* Functional Layer - Invisible Trigger covering the whole card */}
                        <Select value={calculationMethod} onValueChange={handleCalculationMethodChange}>
                            <SelectTrigger className="w-full h-full absolute inset-0 opacity-0 cursor-pointer [&>svg]:hidden">
                                <SelectValue placeholder="Pilih metode" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 max-h-[300px]">
                                {CALCULATION_METHODS.map((option) => (
                                    <SelectItem key={option.id} value={option.id.toString()} className="text-white text-xs hover:bg-white/10">
                                        <span>{option.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Prayer Notifications Card */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
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
                                        "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all relative group",
                                        isEnabled
                                            ? 'bg-gradient-to-b from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/5 border border-[rgb(var(--color-primary))]/30 shadow-lg shadow-[rgb(var(--color-primary))]/10'
                                            : 'bg-white/5 border border-white/10 opacity-60 hover:opacity-100 hover:bg-white/10'
                                    )}
                                >
                                    <prayer.Icon className={cn(
                                        "w-6 h-6 transition-transform group-hover:scale-110 duration-300",
                                        isEnabled ? "text-[rgb(var(--color-primary-light))]" : "text-slate-400"
                                    )} strokeWidth={1.5} />

                                    <span className={cn(
                                        "text-[10px] font-bold tracking-wide",
                                        isEnabled ? 'text-[rgb(var(--color-primary-light))]' : 'text-white/40'
                                    )}>
                                        {prayer.label}
                                    </span>
                                    {isEnabled && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-[rgb(var(--color-primary))] rounded-full p-1 shadow-md ring-4 ring-black">
                                            <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {!notificationsEnabled && (
                        <p className="text-xs text-amber-400/70 text-center">
                            Aktifkan notifikasi untuk menerima pengingat adzan
                        </p>
                    )}
                </div>

                {/* Theme Configuration Card */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center gap-2 text-[rgb(var(--color-primary))]">
                        <Palette className="w-4 h-4" />
                        <span className="text-sm font-semibold text-white">Tampilan Aplikasi</span>
                    </div>

                    <div className="relative -mx-2">
                        {/* Scroll Indicators */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none" />

                        <div className="flex items-center gap-4 overflow-x-auto px-4 pb-4 pt-2 scrollbar-hide snap-x">
                            {Object.values(THEMES).sort((a, b) => (a.isPremium === b.isPremium ? 0 : a.isPremium ? 1 : -1)).map((theme, index, array) => {
                                const isSelected = currentTheme === theme.id;
                                const isLocked = theme.isPremium && !isPremium;

                                // Check if this is the first PRO item to add a divider
                                const showDivider = index > 0 && theme.isPremium && !array[index - 1].isPremium;

                                return (
                                    <div key={theme.id} className="flex items-center gap-4 snap-start">
                                        {showDivider && (
                                            <div className="h-12 w-px bg-white/10 mx-2" />
                                        )}

                                        <button
                                            onClick={() => handleThemeSelect(theme.id)}
                                            className="flex flex-col items-center gap-3 group transition-all relative py-2"
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
                                                        isSelected ? "w-6 h-6 bg-amber-500" : "w-4 h-4 bg-slate-800 border-amber-500/30"
                                                    )}>
                                                        {isLocked ? (
                                                            <Lock className={cn("text-black transition-all", isSelected ? "w-3 h-3" : "w-2 h-2")} />
                                                        ) : (
                                                            <Crown className={cn("transition-all", isSelected ? "w-3 h-3 text-black" : "w-2 h-2 text-amber-500")} />
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
                        </div>
                    </div>
                </div>

                {/* Audio Configuration Card */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4 mb-20">
                    <div className="flex items-center gap-2 text-sky-400">
                        <Headphones className="w-4 h-4" />
                        <span className="text-sm font-semibold text-white">Pengaturan Audio</span>
                    </div>

                    <div className="space-y-3">
                        {/* Muadzin Select */}
                        <div className="relative group bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-all">
                            {/* Visual Layer */}
                            <div className="flex items-center gap-3 flex-1 min-w-0 pointer-events-none">
                                <div className="p-2 rounded-full bg-sky-500/10 shrink-0">
                                    <Volume2 className="w-4 h-4 text-sky-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-0.5">Suara Adzan</p>
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
                                        toggleAudioPreview(muadzin, 'muadzin');
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
                                        <SelectItem key={option.id} value={option.id} className="text-white text-xs hover:bg-white/10">
                                            <span>{option.label}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reciter Select */}
                        <div className="relative group bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-all">
                            {/* Visual Layer */}
                            <div className="flex items-center gap-3 flex-1 min-w-0 pointer-events-none">
                                <div className="p-2 rounded-full bg-emerald-500/10 shrink-0">
                                    <BookOpen className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-0.5">Qari Al-Quran</p>
                                    <p className="text-sm text-white font-medium truncate">{currentReciter?.label || "Mishary Rashid"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Preview Button (Z-20) */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 rounded-full shrink-0 transition-all duration-300 relative z-20 border flex items-center justify-center",
                                        isPlaying && playingId === reciter
                                            ? "bg-[rgb(var(--color-primary))] text-white border-[rgb(var(--color-primary))] shadow-[0_0_15px_rgba(var(--color-primary),0.4)] scale-110"
                                            : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-105"
                                    )}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAudioPreview(reciter);
                                    }}
                                    disabled={isLoading}
                                >
                                    {isLoading && playingId === reciter ? (
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : isPlaying && playingId === reciter ? (
                                        <Pause className="w-3 h-3 fill-current" />
                                    ) : (
                                        <Play className="w-3 h-3 ml-0.5" />
                                    )}
                                </Button>

                                <ChevronDown className="w-4 h-4 text-white/30 group-hover:text-[rgb(var(--color-primary-light))] transition-colors" />
                            </div>

                            {/* Select Overlay (Z-10) */}
                            <Select value={reciter} onValueChange={handleReciterChange}>
                                <SelectTrigger className="w-full h-full absolute inset-0 opacity-0 cursor-pointer [&>svg]:hidden z-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10">
                                    {QURAN_RECITER_OPTIONS.map((option) => (
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
                    <div className="flex items-center justify-center gap-2 py-4 opacity-40">
                        <span className="text-xs text-white">Nawaetu</span>
                        <span className="text-[8px] text-white/50">•</span>
                        <span className="text-xs text-white/70">v1.0.0 Beta</span>
                    </div>
                </div>
            </div>

            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
        </div >
    );
}
