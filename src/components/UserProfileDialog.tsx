"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Settings, Edit2, LogOut, Crown, Flame, Share2, ChevronRight, Sparkles, Calendar, Check, Sprout, Target, Shield, X, Info
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useInfaq } from "@/context/InfaqContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useSession, signIn, signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { getDisplayStreak } from "@/lib/streak-utils";
import { getPlayerStats } from "@/lib/leveling";

// --- CONSTANTS & DATA ---

const AVATAR_LIST = [
    { id: 'boy-1', src: 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg' },
    { id: 'girl-1', src: 'https://img.freepik.com/free-psd/3d-illustration-person-with-pink-hair_23-2149436186.jpg' },
    { id: 'boy-2', src: 'https://img.freepik.com/free-psd/3d-illustration-person-with-glasses_23-2149436190.jpg' },
    { id: 'girl-2', src: 'https://img.freepik.com/free-psd/3d-illustration-person_23-2149436192.jpg' },
];

// ... props type
interface UserProfileDialogProps {
    children: React.ReactNode;
    onProfileUpdate?: () => void;
}

export default function UserProfileDialog({ children, onProfileUpdate }: UserProfileDialogProps) {
    const { data: session, status } = useSession();
    const { isMuhsinin: contextIsMuhsinin } = useInfaq();
    const router = useRouter();
    const { t, locale } = useLocale();
    const { updateProfile, isUpdating } = useProfile();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    // Derived State
    const isAuthenticated = status === "authenticated";
    // FIXED: Only logged in users can be Muhsinin
    const isMuhsinin = isAuthenticated && (session?.user?.isMuhsinin || contextIsMuhsinin || false);

    // Initialize from storage or session
    const [userName, setUserName] = useState<string>(() => {
        if (typeof window === 'undefined') return "Sobat Nawaetu";
        const saved = getStorageService().getOptional<string>(STORAGE_KEYS.USER_NAME);
        return saved || "Sobat Nawaetu";
    });
    const [userImage, setUserImage] = useState<string>(() => {
        if (typeof window === 'undefined') return AVATAR_LIST[0].src;
        return getStorageService().getOptional<string>(STORAGE_KEYS.USER_AVATAR) || AVATAR_LIST[0].src;
    });

    const userRole = isMuhsinin ? (t as any).profileRolePremium : (t as any).profileRoleGuest;

    const translatedArchetypes = [
        {
            id: "beginner",
            icon: Sprout,
            labelTitle: (t as any).onboardingArchetypeBeginnerLabel,
            labelDesc: (t as any).onboardingArchetypeBeginnerDesc
        },
        {
            id: "striver",
            icon: Target,
            labelTitle: (t as any).onboardingArchetypeStriverLabel,
            labelDesc: (t as any).onboardingArchetypeStriverDesc
        },
        {
            id: "dedicated",
            icon: Shield,
            labelTitle: (t as any).onboardingArchetypeDedicatedLabel,
            labelDesc: (t as any).onboardingArchetypeDedicatedDesc
        }
    ];

    // Current Archetype Details
    const currentArchetypeId = session?.user?.archetype || 'beginner';
    const currentArchetype = translatedArchetypes.find(a => a.id === currentArchetypeId) || translatedArchetypes[0];
    const currentArchetypeLabel = currentArchetype.labelTitle;

    // State for Editing
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editGender, setEditGender] = useState<"male" | "female" | null>(null);
    const [editArchetype, setEditArchetype] = useState<"beginner" | "striver" | "dedicated" | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // UI States
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showLevelInfo, setShowLevelInfo] = useState(false);
    const [stats, setStats] = useState({ streak: 0, level: 1, xp: 0, nextLevelXp: 100, progress: 0 });

    useEffect(() => {
        const loadStats = () => {
            const currentStreak = getDisplayStreak().streak;
            const playerStats = getPlayerStats();
            setStats({
                streak: currentStreak,
                level: playerStats.level,
                xp: playerStats.xp,
                nextLevelXp: playerStats.nextLevelXp,
                progress: playerStats.progress
            });
        };

        loadStats();

        window.addEventListener("xp_updated", loadStats);
        window.addEventListener("streak_updated", loadStats);

        return () => {
            window.removeEventListener("xp_updated", loadStats);
            window.removeEventListener("streak_updated", loadStats);
        };
    }, []);

    useEffect(() => {
        const storage = getStorageService();
        const savedName = storage.getOptional<string>(STORAGE_KEYS.USER_NAME);
        const savedAvatar = storage.getOptional<string>(STORAGE_KEYS.USER_AVATAR);
        const savedGender = storage.getOptional<string>(STORAGE_KEYS.USER_GENDER);
        const savedArchetype = storage.getOptional<string>(STORAGE_KEYS.USER_ARCHETYPE);

        if (session?.user?.name) {
            setUserName(session.user.name);
            setEditName(session.user.name);
        } else if (savedName) {
            setUserName(savedName);
            setEditName(savedName);
        } else {
            const defaultName = (t as any).onboardingDefaultName || "Sobat Nawaetu";
            setUserName(defaultName);
            setEditName(defaultName);
        }

        if (session?.user?.image) {
            setUserImage(session.user.image);
        } else if (savedAvatar) {
            setUserImage(savedAvatar);
        } else {
            setUserImage(AVATAR_LIST[0].src);
        }

        if (session?.user?.gender) {
            setEditGender(session.user.gender as any);
        } else if (savedGender) {
            setEditGender(savedGender as any);
        }

        if (session?.user?.archetype) {
            setEditArchetype(session.user.archetype as any);
        } else if (savedArchetype) {
            setEditArchetype(savedArchetype as any);
        }
    }, [session]);

    // Listener for manual profile updates
    useEffect(() => {
        const handleRefresh = () => {
            const storage = getStorageService();
            const savedName = storage.getOptional<string>(STORAGE_KEYS.USER_NAME);
            const savedAvatar = storage.getOptional<string>(STORAGE_KEYS.USER_AVATAR);
            if (savedName) setUserName(savedName);
            if (savedAvatar) setUserImage(savedAvatar);
        };
        window.addEventListener('profile_updated', handleRefresh);
        return () => window.removeEventListener('profile_updated', handleRefresh);
    }, []);

    const handleLogin = () => signIn("google");

    const { resetInfaq } = useInfaq(); // Get reset function from context

    const handleLogout = async () => {
        // 1. Clear User Specific Data
        const storage = getStorageService();

        // Profile
        storage.remove(STORAGE_KEYS.USER_NAME);
        storage.remove(STORAGE_KEYS.USER_AVATAR);
        storage.remove(STORAGE_KEYS.USER_TITLE);
        storage.remove(STORAGE_KEYS.USER_GENDER);
        storage.remove(STORAGE_KEYS.USER_ARCHETYPE);

        // Activity & Content
        storage.remove(STORAGE_KEYS.USER_TOTAL_DONATION);
        storage.remove(STORAGE_KEYS.USER_DONATION_HISTORY);
        storage.remove(STORAGE_KEYS.QURAN_BOOKMARKS);
        storage.remove(STORAGE_KEYS.INTENTION_JOURNAL);
        storage.remove(STORAGE_KEYS.QURAN_LAST_READ);

        // Gamification & Progress
        storage.remove(STORAGE_KEYS.USER_STREAK);
        storage.remove(STORAGE_KEYS.USER_LEVEL);
        storage.remove(STORAGE_KEYS.USER_XP);
        storage.remove(STORAGE_KEYS.COMPLETED_MISSIONS);
        storage.remove(STORAGE_KEYS.ACTIVITY_TRACKER);
        storage.remove(STORAGE_KEYS.DAILY_ACTIVITY_HISTORY);

        // Dhikr
        storage.remove(STORAGE_KEYS.DHIKR_COUNT);
        storage.remove(STORAGE_KEYS.DHIKR_TARGET);
        storage.remove(STORAGE_KEYS.DHIKR_ACTIVE_PRESET);
        storage.remove(STORAGE_KEYS.DHIKR_STREAK);
        storage.remove(STORAGE_KEYS.DHIKR_LAST_DATE);
        storage.remove(STORAGE_KEYS.DHIKR_DAILY_COUNT);

        // Settings
        storage.remove(STORAGE_KEYS.SETTINGS_THEME);
        storage.remove(STORAGE_KEYS.SETTINGS_MUADZIN);
        storage.remove(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD);
        storage.remove(STORAGE_KEYS.SETTINGS_LOCALE);
        storage.remove(STORAGE_KEYS.SETTINGS_RECITER);

        // AI Chat
        storage.remove(STORAGE_KEYS.AI_CHAT_HISTORY);
        storage.remove(STORAGE_KEYS.AI_CHAT_SESSIONS);
        storage.remove(STORAGE_KEYS.AI_CHAT_HISTORY_OLD);
        storage.remove(STORAGE_KEYS.AI_USAGE);

        // Sync Flags
        localStorage.removeItem("nawaetu_synced_v1");

        // 2. Reset Context State
        resetInfaq();

        // 3. Force Sign Out
        await signOut({ callbackUrl: "/" });
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) return;

        const success = await updateProfile({
            name: editName,
            gender: editGender as "male" | "female",
            archetype: editArchetype as "beginner" | "striver" | "dedicated"
        });
        if (success) {
            setUserName(editName); // Immediate UI update
            setIsEditing(false);
            window.dispatchEvent(new CustomEvent('profile_updated'));
            if (onProfileUpdate) onProfileUpdate();
        }
    };

    const handleShareApp = async () => {
        const shareData = {
            title: 'Nawaetu - Teman Ibadah Digital',
            text: 'Yuk, luruskan niat ibadah bersama Nawaetu! Al-Quran, Jadwal Sholat, Tasbih Digital, Jurnal Niat, dan AI Mentor Islami. ✨',
            url: 'https://nawaetu.com'
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success(locale === 'id' ? 'Terima kasih telah membagikan Nawaetu!' : 'Thanks for sharing Nawaetu!');
            } else {
                // Fallback: Copy link to clipboard
                await navigator.clipboard.writeText(shareData.url);
                toast.success(locale === 'id' ? 'Link berhasil disalin!' : 'Link copied to clipboard!');
            }
        } catch (error) {
            // User cancelled or error occurred
            if (error instanceof Error && error.name !== 'AbortError') {
                toast.error(locale === 'id' ? 'Gagal membagikan' : 'Failed to share');
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent
                showCloseButton={false}
                className={cn(
                    "w-[calc(100vw-32px)] sm:w-[380px] max-w-sm max-h-[85vh] p-0 rounded-3xl overflow-hidden flex flex-col transition-all",
                    isDaylight
                        ? "bg-white border-slate-200 text-slate-900"
                        : "bg-[#0F172A] border-white/10 text-white"
                )}
            >
                <DialogTitle className="sr-only">Profil Pengguna</DialogTitle>

                {/* 1. Header & Cover */}
                <div className="relative flex-none">
                    <div className={cn(
                        "h-24 w-full absolute top-0 left-0",
                        "bg-gradient-to-r from-[rgb(var(--color-primary))]/80 to-[rgb(var(--color-secondary))]/80"
                    )}>
                        {/* Base Gradient & Noise */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                        {/* Subtle Islamic Geometric Pattern via SVG background */}
                        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                            backgroundSize: '30px'
                        }}></div>

                        <div className="absolute inset-0 bg-[rgb(var(--color-primary))]/10 mix-blend-overlay"></div>
                    </div>

                    {/* Top Actions */}
                    <div className="relative z-20 flex justify-between items-center p-4">
                        {!isAuthenticated ? (
                            <div className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-[10px] items-center flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                {(t as any).profileGuestMode}
                            </div>
                        ) : (
                            <div /> // Spacer
                        )}

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    {/* Profile Picture Area */}
                    <div className="relative z-10 px-6 pt-0 flex items-end justify-between -mt-10">
                        <div className="relative">
                            <div className={cn(
                                "w-20 h-20 rounded-full p-1 transition-all",
                                isDaylight ? "bg-white shadow-sm" : "bg-[#0F172A]",
                                isMuhsinin
                                    ? isDaylight ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-white" : "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0F172A]"
                                    : isDaylight ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-white" : "ring-2 ring-[rgb(var(--color-primary))] ring-offset-2 ring-offset-[#0F172A]"
                            )}>
                                <Avatar className="w-full h-full rounded-full border border-white/10">
                                    <AvatarImage src={userImage} className="object-cover" />
                                    <AvatarFallback>NA</AvatarFallback>
                                </Avatar>
                            </div>
                            {isMuhsinin && (
                                <div className="absolute -top-3 -right-3">
                                    <span className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full shadow-lg text-white transition-all",
                                        isDaylight
                                            ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                                            : "bg-gradient-to-br from-amber-300 to-orange-500"
                                    )}>
                                        <Crown className="w-4 h-4 fill-white" />
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. User Info */}
                <div className="px-6 pb-6 pt-3 relative z-10 flex-1 overflow-y-auto scrollbar-hide">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="space-y-4 mb-2 pr-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase tracking-wider text-slate-500">{(t as any).profileNameLabel}</Label>
                                        <Input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className={cn(
                                                "h-10 transition-all",
                                                isDaylight
                                                    ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                                                    : "bg-white/5 border-white/10 text-white focus:border-[rgb(var(--color-primary))]/50"
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase tracking-wider text-slate-500">{(t as any).profileGenderLabel}</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setEditGender('male')}
                                                className={cn(
                                                    "flex items-center justify-center gap-2 h-10 rounded-xl border transition-all text-xs font-medium",
                                                    editGender === 'male'
                                                        ? isDaylight
                                                            ? "bg-emerald-500 text-white border-emerald-500"
                                                            : "bg-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary))] text-white"
                                                        : isDaylight
                                                            ? "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-600"
                                                            : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-400"
                                                )}
                                            >
                                                <span>👨</span> {(t as any).onboardingMaleLabel}
                                            </button>
                                            <button
                                                onClick={() => setEditGender('female')}
                                                className={cn(
                                                    "flex items-center justify-center gap-2 h-10 rounded-xl border transition-all text-xs font-medium",
                                                    editGender === 'female'
                                                        ? isDaylight
                                                            ? "bg-emerald-500 text-white border-emerald-500"
                                                            : "bg-[rgb(var(--color-secondary))]/30 border-[rgb(var(--color-secondary))] text-white"
                                                        : isDaylight
                                                            ? "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-600"
                                                            : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-400"
                                                )}
                                            >
                                                <span>👩</span> {(t as any).onboardingFemaleLabel}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase tracking-wider text-slate-500">{(t as any).profileArchetypeLabel}</Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {translatedArchetypes.map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setEditArchetype(type.id as any)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 rounded-xl border transition-all text-left",
                                                        editArchetype === type.id
                                                            ? isDaylight
                                                                ? "bg-emerald-50 border-emerald-500 text-slate-900"
                                                                : "bg-white/10 border-white/30 text-white"
                                                            : isDaylight
                                                                ? "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-500"
                                                                : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-400"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                                                        isDaylight ? "bg-emerald-100" : "bg-white/5"
                                                    )}>
                                                        <type.icon className={cn(
                                                            "w-4 h-4",
                                                            editArchetype === type.id
                                                                ? isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]"
                                                                : "text-slate-400"
                                                        )} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={cn("text-xs font-bold leading-none mb-1", isDaylight ? "text-slate-900" : "text-white")}>{type.labelTitle}</div>
                                                        <div className="text-[9px] text-slate-500 leading-tight">{type.labelDesc}</div>
                                                    </div>
                                                    {editArchetype === type.id && <Check className={cn("w-4 h-4", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light)) ]")} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "flex gap-2 pt-2 sticky bottom-0 pb-2 transition-all",
                                        isDaylight ? "bg-white" : "bg-[#0F172A]"
                                    )}>
                                        <Button
                                            onClick={handleSaveProfile}
                                            disabled={isUpdating}
                                            className={cn(
                                                "flex-1 h-9 font-bold transition-all shadow-lg active:scale-[0.98]",
                                                isDaylight
                                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10"
                                                    : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 text-white"
                                            )}
                                        >
                                            {isUpdating ? (t as any).locationUpdating : (t as any).bookmarksSave}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setIsEditing(false)}
                                            className={cn(
                                                "h-9 text-xs transition-colors",
                                                isDaylight ? "text-slate-400 hover:text-slate-600 hover:bg-slate-50" : "text-slate-400 hover:text-white"
                                            )}
                                        >
                                            {(t as any).tasbihBack}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <h2 className={cn("text-xl font-bold leading-tight", isDaylight ? "text-slate-900" : "text-white")}>{userName}</h2>
                                            {isAuthenticated && (
                                                <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-white transition-colors">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        {isAuthenticated && session?.user?.email && (
                                            <div className={cn("flex items-center gap-1.5 text-[10px] mt-0.5", isDaylight ? "text-slate-500" : "text-slate-400")}>
                                                <div className={cn(
                                                    "w-3 h-3 rounded-full flex items-center justify-center",
                                                    isDaylight ? "bg-slate-100" : "bg-white/10"
                                                )}>
                                                    <span className={cn("text-[6px] font-bold", isDaylight ? "text-slate-600" : "text-white")}>G</span>
                                                </div>
                                                {session.user.email}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1.5 mt-2.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Archetype Badge */}
                                            <div className={cn(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 transition-all",
                                                isDaylight
                                                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                                    : "bg-[rgb(var(--color-secondary))]/30 border-[rgb(var(--color-secondary))] text-[rgb(var(--color-primary-light))]"
                                            )}>
                                                <currentArchetype.icon className="w-2.5 h-2.5" />
                                                {currentArchetypeLabel}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 3. Gamification Stats (Visible to All) */}
                    <div className="flex flex-col gap-3 mb-6">
                        {/* Level Progress */}
                        <div className={cn(
                            "rounded-2xl p-4 transition-all border",
                            isDaylight ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5"
                        )}>
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                        isDaylight ? "bg-emerald-100" : "bg-[rgb(var(--color-primary))]/20"
                                    )}>
                                        <Crown className={cn("w-4 h-4", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light)) ]")} />
                                    </div>
                                    <div>
                                        <div
                                            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => setShowLevelInfo(!showLevelInfo)}
                                        >
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                                                {(t as any).gamificationLevelName} {stats.level} • {
                                                    stats.level <= 10 ? (t as any).gamificationLevelTitle_0_10 :
                                                        stats.level <= 25 ? (t as any).gamificationLevelTitle_11_25 :
                                                            stats.level <= 50 ? (t as any).gamificationLevelTitle_26_50 :
                                                                stats.level <= 99 ? (t as any).gamificationLevelTitle_51_99 : (t as any).gamificationLevelTitle_100
                                                }
                                            </p>
                                            <Info className="w-3 h-3 text-slate-500" />
                                        </div>
                                        <p className={cn("text-sm font-bold", isDaylight ? "text-slate-900" : "text-white")}>{stats.xp} {(t as any).gamificationXpName}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-400">{stats.xp} / {stats.nextLevelXp} {(t as any).gamificationXpName}</span>
                            </div>
                            <div className={cn(
                                "h-2.5 w-full rounded-full overflow-hidden border shadow-inner mb-2.5 transition-all",
                                isDaylight ? "bg-slate-100 border-slate-200" : "bg-black/20 border-white/5"
                            )}>
                                <div
                                    className="h-full rounded-full transition-all duration-500 shadow-lg"
                                    style={{
                                        width: `${stats.progress}%`,
                                        background: isDaylight
                                            ? `linear-gradient(to right, #10b981, #34d399)`
                                            : `linear-gradient(to right, rgb(var(--color-primary-dark)), rgb(var(--color-primary-light)))`,
                                        boxShadow: isDaylight ? "none" : "0 0 10px rgba(var(--color-primary), 0.5)"
                                    }}
                                />
                            </div>

                            {showLevelInfo ? (
                                <div className={cn(
                                    "mt-3 p-4 rounded-xl border space-y-3 animate-in fade-in slide-in-from-top-1",
                                    isDaylight ? "bg-emerald-50/50 border-emerald-100 text-slate-500" : "bg-black/40 border-white/5 text-slate-400"
                                )}>
                                    <div className={cn("font-bold mb-1 text-[11px] uppercase tracking-wider", isDaylight ? "text-emerald-700" : "text-white")}>{(t as any).gamificationLevelName} Tingkatan:</div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-[rgb(var(--color-primary-light))]">{(t as any).gamificationLevelTitle_0_10} (Lvl 1-10)</span>
                                        </div>
                                        <p className="text-[9px] leading-relaxed italic border-l border-white/10 pl-2">{(t as any).gamificationLevelDesc_0_10}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-[rgb(var(--color-primary-light))]">{(t as any).gamificationLevelTitle_11_25} (Lvl 11-25)</span>
                                        </div>
                                        <p className="text-[9px] leading-relaxed italic border-l border-white/10 pl-2">{(t as any).gamificationLevelDesc_11_25}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-[rgb(var(--color-primary-light))]">{(t as any).gamificationLevelTitle_26_50} (Lvl 26-50)</span>
                                        </div>
                                        <p className="text-[9px] leading-relaxed italic border-l border-white/10 pl-2">{(t as any).gamificationLevelDesc_26_50}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-[rgb(var(--color-primary-light))]">{(t as any).gamificationLevelTitle_51_99} (Lvl 51-99)</span>
                                        </div>
                                        <p className="text-[9px] leading-relaxed italic border-l border-white/10 pl-2">{(t as any).gamificationLevelDesc_51_99}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-[rgb(var(--color-primary-light))]">{(t as any).gamificationLevelTitle_100} (Lvl 100+)</span>
                                        </div>
                                        <p className="text-[9px] leading-relaxed italic border-l border-white/10 pl-2">{(t as any).gamificationLevelDesc_100}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[10px] text-slate-500 leading-snug">
                                    {(t as any).profileXpDesc}
                                </p>
                            )}
                        </div>

                        {/* Streak Row (Full Width) */}
                        <div className={cn(
                            "rounded-2xl p-4 flex items-center gap-4 border transition-all",
                            isDaylight ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5"
                        )}>
                            <div className={cn(
                                "w-12 h-12 rounded-full flex flex-shrink-0 items-center justify-center transition-all",
                                isDaylight ? "bg-emerald-100" : "bg-[rgb(var(--color-primary))]/20"
                            )}>
                                <Flame className={cn("w-6 h-6", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light)) ]")} />
                            </div>
                            <div>
                                <div className="flex items-end gap-2">
                                    <span className={cn("text-2xl font-black leading-none", isDaylight ? "text-slate-900" : "text-white")}>{stats.streak}</span>
                                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-[2px]">{(t as any).profileDays}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-1 leading-snug">{(t as any).profileStreakDesc}</div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Auth Call to Action (If Guest) */}
                    {!isAuthenticated && (
                        <div className={cn(
                            "mb-6 border rounded-xl p-4 text-center transition-all",
                            isDaylight ? "bg-emerald-50 border-emerald-100" : "bg-[rgb(var(--color-secondary))]/30 border-white/5"
                        )}>
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 transition-all",
                                isDaylight ? "bg-emerald-100" : "bg-[rgb(var(--color-primary))]/20"
                            )}>
                                <Settings className={cn("w-5 h-5", isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light)) ]")} />
                            </div>
                            <h3 className={cn("text-sm font-bold mb-1", isDaylight ? "text-slate-900" : "text-white")}>{(t as any).profileAuthTitle}</h3>
                            <p className={cn("text-xs mb-4 leading-relaxed", isDaylight ? "text-slate-500" : "text-slate-400")}>{(t as any).profileAuthDesc}</p>
                            <Button
                                onClick={handleLogin}
                                className={cn(
                                    "w-full font-bold h-10 flex items-center gap-2 shadow-lg transition-all",
                                    isDaylight
                                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                                        : "bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary))]/90"
                                )}
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                {(t as any).profileAuthButton}
                            </Button>
                        </div>
                    )}

                    {/* 5. Menu Items */}
                    <div className="space-y-1">
                        <button onClick={handleShareApp} className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl transition-colors group",
                            isDaylight ? "hover:bg-slate-50" : "hover:bg-white/5"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                    isDaylight ? "bg-emerald-50" : "bg-[rgb(var(--color-primary))]/10"
                                )}>
                                    <Share2 className={cn("w-4 h-4 transition-colors", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light)) ] group-hover:text-[rgb(var(--color-primary))]")} />
                                </div>
                                <span className={cn("text-sm font-medium transition-colors", isDaylight ? "text-slate-600 group-hover:text-slate-900" : "text-slate-300 group-hover:text-white")}>{(t as any).profileShareApp}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                        </button>

                        {isAuthenticated && (
                            !showLogoutConfirm ? (
                                <button onClick={() => setShowLogoutConfirm(true)} className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-xl transition-colors group mt-2 border border-transparent",
                                    isDaylight ? "hover:bg-red-50 hover:border-red-100" : "hover:bg-red-500/10 hover:border-red-500/20"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                                            <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors" />
                                        </div>
                                        <span className={cn("text-sm font-medium transition-colors", isDaylight ? "text-red-600 group-hover:text-red-700" : "text-red-400 group-hover:text-red-300")}>{(t as any).profileLogout}</span>
                                    </div>
                                </button>
                            ) : (
                                <div className={cn(
                                    "mt-2 p-3 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200 border",
                                    isDaylight ? "bg-red-50 border-red-100" : "bg-red-500/10 border-red-500/20"
                                )}>
                                    <p className={cn(
                                        "text-xs mb-3 text-center font-medium",
                                        isDaylight ? "text-red-600" : "text-red-200"
                                    )}>{(t as any).profileLogoutConfirm}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleLogout}
                                            className={cn(
                                                "flex-1 h-8 rounded-lg text-xs font-bold transition-all active:scale-[0.98] shadow-sm",
                                                isDaylight
                                                    ? "bg-red-500/30 hover:bg-red-500/40 text-red-600 shadow-none"
                                                    : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 shadow-none"
                                            )}
                                        >
                                            {(t as any).profileLogoutConfirmYes}
                                        </button>
                                        <button
                                            onClick={() => setShowLogoutConfirm(false)}
                                            className={cn(
                                                "flex-1 h-8 rounded-lg text-xs font-medium transition-all active:scale-[0.98]",
                                                isDaylight
                                                    ? "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-100"
                                                    : "bg-white/5 hover:bg-white/10 text-slate-400"
                                            )}
                                        >
                                            {(t as any).profileLogoutConfirmNo}
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-white/5 text-center px-4">
                        <p className="text-[10px] text-slate-600">{(t as any).profileFooter}</p>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
