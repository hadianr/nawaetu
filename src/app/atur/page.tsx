"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Bell, Volume2, MapPin, ChevronRight, Info, BookOpen, Clock, Music, Settings2, Headphones, Play, Pause, Palette, Crown, Lock, Check, Star, Sparkles, Sunrise, Sun, CloudSun, Moon, Sunset, BarChart3, ChevronDown, Heart, Globe } from "lucide-react";
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
import InfaqModal from "@/components/InfaqModal";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useTheme, THEMES, ThemeId } from "@/context/ThemeContext";
import { useInfaq } from "@/context/InfaqContext";
import { useLocale } from "@/context/LocaleContext";
import {
    MUADZIN_OPTIONS,
    CALCULATION_METHODS,
    DEFAULT_SETTINGS,
    LANGUAGE_OPTIONS,
} from "@/data/settings-data";
import { SETTINGS_TRANSLATIONS } from "@/data/settings-translations";

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
    const { isMuhsinin } = useInfaq();
    const { locale, setLocale, t } = useLocale();
    const [showInfaqModal, setShowInfaqModal] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [preferences, setPreferences] = useState<AdhanPreferences>(DEFAULT_PREFS);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Profile State
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

    const toggleAudioPreview = (id: string) => {
        // Stop current audio if playing same ID
        if (playingId === id && isPlaying) {
            stopCurrentAudio();
            return;
        }

        stopCurrentAudio();
        setIsLoading(true);
        setPlayingId(id);

        let audioUrl = "";

        const selectedMuadzin = MUADZIN_OPTIONS.find(m => m.id === id);
        if (!selectedMuadzin || !selectedMuadzin.audio_url) {
            stopCurrentAudio();
            return;
        }
        audioUrl = selectedMuadzin.audio_url;

        const newAudio = new Audio(audioUrl);

        newAudio.oncanplaythrough = () => {
            setIsLoading(false);
            newAudio.play().catch(err => {
                console.warn("Playback blocked by browser (Interaction required):", err);
                setIsPlaying(false);
                setIsLoading(false);
            });
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
        const savedMethod = localStorage.getItem("settings_calculation_method");
        if (savedMuadzin) setMuadzin(savedMuadzin);
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
        if (theme.isPremium && !isMuhsinin) {
            setShowInfaqModal(true);
            return;
        }

        setTheme(themeId);
    };

    const handleMuadzinChange = (value: string) => {
        stopCurrentAudio();
        setMuadzin(value);
        localStorage.setItem("settings_muadzin", value);
    };

    const handleCalculationMethodChange = (value: string) => {
        setCalculationMethod(value);
        localStorage.setItem("settings_calculation_method", value);
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
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] px-4 py-6 font-sans sm:px-6 pb-24">

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
                            <div className="h-12 w-12 rounded-full bg-[rgb(var(--color-primary))]/20 border-2 border-[rgb(var(--color-primary))]/40 flex items-center justify-center text-[rgb(var(--color-primary-light))] text-lg font-bold overflow-hidden">
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
                            </div>
                            {isMuhsinin && (
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

                {/* Quick Stats Entry - COMING SOON STATE */}
                <div className="w-full p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 opacity-60 cursor-not-allowed group relative overflow-hidden">
                    {/* Subtle Coming Soon Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--color-primary),0.05),transparent)]" />

                    <div className="h-10 w-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center transition-all">
                        <BarChart3 className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-400">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].statsLabel}</h3>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] border border-[rgb(var(--color-primary))]/30 font-bold uppercase tracking-wider">
                                {SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].statsComingSoon}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].statsDescription}</p>
                    </div>
                </div>

                {/* Worship Configuration Hub */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Location - Clickable to Refresh */}
                    <button
                        onClick={handleRefreshLocation}
                        disabled={isRefreshing}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 hover:border-[rgb(var(--color-primary))]/30 transition-all group disabled:opacity-70 flex flex-col justify-between min-h-[80px]"
                    >
                        <div className="flex items-center justify-between w-full mb-1">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                                <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].locationLabel}</span>
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
                            {isRefreshing ? SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].locationUpdating : (data?.locationName?.split(',')[0] || SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].locationDetecting)}
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
                                    <Clock className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].methodLabel}</span>
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
                                    <SelectItem key={option.id} value={option.id.toString()} className="text-white text-xs hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer transition-colors">
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
                            <Volume2 className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                            <span className="text-sm font-semibold text-white">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].notificationTitle}</span>
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
                        <button
                            onClick={requestPermission}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary-dark))]/20 border border-[rgb(var(--color-primary))]/30 rounded-xl text-[rgb(var(--color-primary-light))] text-sm font-semibold hover:bg-[rgb(var(--color-primary))]/30 hover:border-[rgb(var(--color-primary))]/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Bell className="w-4 h-4" />
                            {SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].notificationButton}
                        </button>
                    )}
                </div>

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

                    <p className="text-[10px] text-white/40 leading-relaxed">
                        {SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].languageDescription}
                    </p>
                </div>

                {/* Support Card (Persistent) */}
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

                {/* App Info - Footer Style */}
                {/* About Nawaetu Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] rounded-2xl flex items-center justify-center shadow-lg shadow-[rgb(var(--color-primary))]/20 mb-3 rotate-3 group-hover:rotate-6 transition-transform">
                            <span className="text-3xl font-bold text-white">N</span>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-1">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].aboutAppName}</h2>
                        <p className="text-[10px] text-[rgb(var(--color-primary-light))] uppercase tracking-[0.2em] font-bold mb-3">
                            {SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].aboutTagline}
                        </p>

                        <p className="text-xs text-slate-400 leading-relaxed max-w-[260px] mx-auto mb-4">
                            {SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].aboutDescription}
                        </p>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[rgb(var(--color-primary))]/30 transition-all cursor-default">
                            <span className="text-[rgb(var(--color-primary-light))] font-bold text-xs">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].aboutHashtag}</span>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-white">{SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS].aboutVersion}</span>
                        </div>
                    </div>
                </div>
            </div>

            <InfaqModal isOpen={showInfaqModal} onClose={() => setShowInfaqModal(false)} />
        </div >
    );
}
