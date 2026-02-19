"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Settings, Edit2, LogOut, Crown, Flame, Share2, ChevronRight, Sparkles, Calendar, Check, Sprout, Target, Shield, X
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useInfaq } from "@/context/InfaqContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLocale } from "@/context/LocaleContext";
import { useSession, signIn, signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

// --- CONSTANTS & DATA ---

const ARCHETYPES = [
    {
        id: "beginner",
        icon: Sprout,
    },
    {
        id: "striver",
        icon: Target,
    },
    {
        id: "dedicated",
        icon: Shield,
    }
];

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

    // Derived State
    const isAuthenticated = status === "authenticated";
    // FIXED: Only logged in users can be Muhsinin
    const isMuhsinin = isAuthenticated && (session?.user?.isMuhsinin || contextIsMuhsinin || false);
    const userName = session?.user?.name || "Hamba Allah";
    const userRole = isMuhsinin ? (t as any).profileRolePremium : (t as any).profileRoleGuest;
    const userImage = session?.user?.image || AVATAR_LIST[0].src;

    // Current Archetype Details
    const currentArchetypeId = session?.user?.archetype || 'beginner';
    const currentArchetype = ARCHETYPES.find(a => a.id === currentArchetypeId) || ARCHETYPES[0];
    const currentArchetypeLabel = currentArchetypeId === 'beginner'
        ? (t as any).onboardingArchetypeBeginnerLabel
        : currentArchetypeId === 'striver'
            ? (t as any).onboardingArchetypeStriverLabel
            : (t as any).onboardingArchetypeDedicatedLabel;

    // State for Editing
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editGender, setEditGender] = useState<"male" | "female" | null>(null);
    const [editArchetype, setEditArchetype] = useState<"beginner" | "striver" | "dedicated" | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        if (session?.user?.name) {
            setEditName(session.user.name);
        }
        if (session?.user?.gender) {
            setEditGender(session.user.gender as any);
        }
        if (session?.user?.archetype) {
            setEditArchetype(session.user.archetype as any);
        }
    }, [session]);

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
            setIsEditing(false);
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
            <DialogContent className="max-w-[90vw] w-[380px] bg-[#0F172A] border-white/10 text-white p-0 rounded-3xl overflow-hidden">
                <DialogTitle className="sr-only">Profil Pengguna</DialogTitle>

                {/* 1. Header & Cover */}
                <div className="relative">
                    <div className={cn(
                        "h-32 w-full absolute top-0 left-0",
                        "bg-gradient-to-r from-[rgb(var(--color-primary))]/80 to-[rgb(var(--color-secondary))]/80"
                    )}>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
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
                    <div className="relative z-10 px-6 pt-8 flex items-end justify-between">
                        <div className="relative">
                            <div className={cn(
                                "w-24 h-24 rounded-full p-1 bg-[#0F172A]",
                                isMuhsinin ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0F172A]" : "ring-2 ring-[rgb(var(--color-primary))] ring-offset-2 ring-offset-[#0F172A]"
                            )}>
                                <Avatar className="w-full h-full rounded-full border border-white/10">
                                    <AvatarImage src={userImage} className="object-cover" />
                                    <AvatarFallback>NA</AvatarFallback>
                                </Avatar>
                            </div>
                            {isMuhsinin && (
                                <div className="absolute -top-3 -right-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-lg text-white">
                                        <Crown className="w-4 h-4 fill-white" />
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. User Info */}
                <div className="px-6 pb-6 pt-3 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="space-y-4 mb-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase tracking-wider text-slate-500">{(t as any).profileNameLabel}</Label>
                                        <Input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="h-10 bg-white/5 border-white/10 focus:border-[rgb(var(--color-primary))]/50"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase tracking-wider text-slate-500">{(t as any).profileGenderLabel}</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setEditGender('male')}
                                                className={cn(
                                                    "flex items-center justify-center gap-2 h-10 rounded-xl border transition-all text-xs font-medium",
                                                    editGender === 'male' ? "bg-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary))] text-white" : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-400"
                                                )}
                                            >
                                                <span>👨</span> {(t as any).onboardingMaleLabel}
                                            </button>
                                            <button
                                                onClick={() => setEditGender('female')}
                                                className={cn(
                                                    "flex items-center justify-center gap-2 h-10 rounded-xl border transition-all text-xs font-medium",
                                                    editGender === 'female' ? "bg-[rgb(var(--color-secondary))]/30 border-[rgb(var(--color-secondary))] text-white" : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-400"
                                                )}
                                            >
                                                <span>👩</span> {(t as any).onboardingFemaleLabel}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase tracking-wider text-slate-500">{(t as any).profileArchetypeLabel}</Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { id: 'beginner', label: (t as any).onboardingArchetypeBeginnerLabel, icon: '🌱', color: 'text-[rgb(var(--color-primary-light))]' },
                                                { id: 'striver', label: (t as any).onboardingArchetypeStriverLabel, icon: '⚡', color: 'text-[rgb(var(--color-primary-light))]' },
                                                { id: 'dedicated', label: (t as any).onboardingArchetypeDedicatedLabel, icon: '🔥', color: 'text-[rgb(var(--color-primary-light))]' },
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setEditArchetype(type.id as any)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 h-10 rounded-xl border transition-all text-xs font-medium",
                                                        editArchetype === type.id ? "bg-white/10 border-white/30 text-white" : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-400"
                                                    )}
                                                >
                                                    <span className="text-lg">{type.icon}</span>
                                                    <span className="flex-1 text-left">{type.label}</span>
                                                    {editArchetype === type.id && <Check className={cn("w-4 h-4", type.color)} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2 sticky bottom-0 bg-[#0F172A] pb-2">
                                        <Button
                                            onClick={handleSaveProfile}
                                            disabled={isUpdating}
                                            className="flex-1 h-9 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 text-white text-xs font-bold"
                                        >
                                            {isUpdating ? (t as any).locationUpdating : (t as any).bookmarksSave}
                                        </Button>
                                        <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-9 text-xs text-slate-400 hover:text-white">{(t as any).tasbihBack}</Button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-white leading-tight">{userName}</h2>
                                        {isAuthenticated && (
                                            <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-white transition-colors">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                {isMuhsinin ? (
                                                    <div className="flex items-center gap-1 text-[rgb(var(--color-primary-light))] text-xs font-medium px-2 py-0.5 bg-[rgb(var(--color-primary))]/10 rounded-full border border-[rgb(var(--color-primary))]/20">
                                                        <Sparkles className="w-3 h-3" />
                                                        {userRole}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">{userRole}</span>
                                                )}
                                            </div>
                                            <div className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 bg-[rgb(var(--color-secondary))]/30 border-[rgb(var(--color-secondary))] text-[rgb(var(--color-primary-light))]">
                                                <currentArchetype.icon className="w-2.5 h-2.5" />
                                                {currentArchetypeLabel}
                                            </div>
                                        </div>
                                        {isAuthenticated && session?.user?.email && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                                <div className="w-3 h-3 rounded-full bg-white/10 flex items-center justify-center">
                                                    <span className="text-[6px] font-bold text-white">G</span>
                                                </div>
                                                {session.user.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Auth Call to Action (If Guest) */}
                    {!isAuthenticated && (
                        <div className="mb-6 bg-[rgb(var(--color-secondary))]/30 border border-white/5 rounded-xl p-4 text-center">
                            <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Settings className="w-5 h-5 text-[rgb(var(--color-primary-light))]" />
                            </div>
                            <h3 className="text-sm font-bold text-white mb-1">{(t as any).profileAuthTitle}</h3>
                            <p className="text-xs text-slate-400 mb-4 leading-relaxed">{(t as any).profileAuthDesc}</p>
                            <Button
                                onClick={handleLogin}
                                className="w-full bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary))]/90 font-bold h-10 flex items-center gap-2"
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

                    {/* 4. Stats Placeholder */}
                    {isAuthenticated && (
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                                <div className="w-8 h-8 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center mb-2">
                                    <Flame className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                                </div>
                                <span className="text-2xl font-black text-white">0</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-1">{(t as any).profileStreakLabel}</span>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                                <div className="w-8 h-8 rounded-full bg-[rgb(var(--color-secondary))]/30 flex items-center justify-center mb-2">
                                    <Calendar className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                                </div>
                                <span className="text-2xl font-black text-white">0</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-1">{(t as any).profileTotalDays}</span>
                            </div>
                        </div>
                    )}

                    {/* 5. Menu Items */}
                    <div className="space-y-1">
                        <button onClick={handleShareApp} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[rgb(var(--color-primary))]/10 flex items-center justify-center">
                                    <Share2 className="w-4 h-4 text-[rgb(var(--color-primary-light))] group-hover:text-[rgb(var(--color-primary))] transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white">{(t as any).profileShareApp}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                        </button>

                        {isAuthenticated && (
                            !showLogoutConfirm ? (
                                <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/10 transition-colors group mt-2 border border-transparent hover:border-red-500/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                                            <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
                                        </div>
                                        <span className="text-sm font-medium text-red-400 group-hover:text-red-300">{(t as any).profileLogout}</span>
                                    </div>
                                </button>
                            ) : (
                                <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <p className="text-xs text-red-200 mb-3 text-center">{(t as any).profileLogoutConfirm}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleLogout}
                                            className="flex-1 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                                        >
                                            {(t as any).profileLogoutConfirmYes}
                                        </button>
                                        <button
                                            onClick={() => setShowLogoutConfirm(false)}
                                            className="flex-1 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
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
