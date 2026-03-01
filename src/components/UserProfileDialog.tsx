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

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Edit2, Sprout, Target, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useInfaq } from "@/context/InfaqContext";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useSession, signIn, signOut } from "next-auth/react";
import { useProfile } from "@/hooks/useProfile";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { getDisplayStreak } from "@/lib/streak-utils";
import { getPlayerStats } from "@/lib/leveling";
import { toast } from "sonner";

// Sub-components
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileEditForm } from "./profile/ProfileEditForm";
import { GamificationStats } from "./profile/GamificationStats";
import { AuthActions } from "./profile/AuthActions";

// --- CONSTANTS & DATA ---
const AVATAR_LIST = [
    { id: 'boy-1', src: 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg' },
];

interface UserProfileDialogProps {
    children: React.ReactNode;
    onProfileUpdate?: () => void;
}

export default function UserProfileDialog({ children, onProfileUpdate }: UserProfileDialogProps) {
    const { data: session, status } = useSession();
    const { isMuhsinin: contextIsMuhsinin, resetInfaq } = useInfaq();
    const { t, locale } = useLocale();
    const { updateProfile, isUpdating } = useProfile();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    const isAuthenticated = status === "authenticated";
    const isMuhsinin = isAuthenticated && (session?.user?.isMuhsinin || contextIsMuhsinin || false);

    const [userName, setUserName] = useState<string>(() => {
        if (typeof window === 'undefined') return "Sobat Nawaetu";
        const saved = getStorageService().getOptional<string>(STORAGE_KEYS.USER_NAME);
        return saved || "Sobat Nawaetu";
    });

    const [userImage, setUserImage] = useState<string>(() => {
        if (typeof window === 'undefined') return AVATAR_LIST[0].src;
        return getStorageService().getOptional<string>(STORAGE_KEYS.USER_AVATAR) || AVATAR_LIST[0].src;
    });

    const translatedArchetypes = [
        {
            id: "esensial",
            icon: Target,
            labelTitle: (t as any).onboardingArchetypeEsensialLabel,
            labelDesc: (t as any).onboardingArchetypeEsensialDesc
        },
        {
            id: "seimbang",
            icon: Sprout,
            labelTitle: (t as any).onboardingArchetypeSeimbangLabel,
            labelDesc: (t as any).onboardingArchetypeSeimbangDesc
        },
        {
            id: "lengkap",
            icon: Shield,
            labelTitle: (t as any).onboardingArchetypeLengkapLabel,
            labelDesc: (t as any).onboardingArchetypeLengkapDesc
        }
    ];

    const currentArchetypeId = session?.user?.archetype || 'esensial';
    const currentArchetype = translatedArchetypes.find(a => a.id === currentArchetypeId) || translatedArchetypes[0];
    const currentArchetypeLabel = currentArchetype.labelTitle;

    // State for Editing
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editGender, setEditGender] = useState<"male" | "female" | null>(null);
    const [editArchetype, setEditArchetype] = useState<"esensial" | "seimbang" | "lengkap" | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // UI States
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [stats, setStats] = useState({ streak: 0, level: 1, hasanah: 0, nextLevelHasanah: 100, progress: 0 });

    useEffect(() => {
        const loadStats = () => {
            const currentStreak = getDisplayStreak().streak;
            const playerStats = getPlayerStats();
            setStats({
                streak: currentStreak,
                level: playerStats.level,
                hasanah: playerStats.hasanah,
                nextLevelHasanah: playerStats.nextLevelHasanah,
                progress: playerStats.progress
            });
        };

        loadStats();
        window.addEventListener("hasanah_updated", loadStats);
        window.addEventListener("streak_updated", loadStats);
        return () => {
            window.removeEventListener("hasanah_updated", loadStats);
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

        if (session?.user?.gender) setEditGender(session.user.gender as any);
        else if (savedGender) setEditGender(savedGender as any);

        if (session?.user?.archetype) setEditArchetype(session.user.archetype as any);
        else if (savedArchetype) setEditArchetype(savedArchetype as any);
    }, [session, t]);

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

    const handleLogout = async () => {
        const storage = getStorageService();

        // Profile
        storage.remove(STORAGE_KEYS.USER_NAME);
        storage.remove(STORAGE_KEYS.USER_AVATAR);
        storage.remove(STORAGE_KEYS.USER_TITLE);
        storage.remove(STORAGE_KEYS.USER_GENDER);
        storage.remove(STORAGE_KEYS.USER_ARCHETYPE);

        // Activity & Gamification
        storage.remove(STORAGE_KEYS.USER_TOTAL_DONATION);
        storage.remove(STORAGE_KEYS.USER_DONATION_HISTORY);
        storage.remove(STORAGE_KEYS.QURAN_BOOKMARKS);
        storage.remove(STORAGE_KEYS.INTENTION_JOURNAL);
        storage.remove(STORAGE_KEYS.QURAN_LAST_READ);
        storage.remove(STORAGE_KEYS.USER_STREAK);
        storage.remove(STORAGE_KEYS.USER_LEVEL);
        storage.remove(STORAGE_KEYS.USER_HASANAH);
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

        resetInfaq();
        await signOut({ callbackUrl: "/" });
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) return;

        const success = await updateProfile({
            name: editName,
            gender: editGender as "male" | "female",
            archetype: editArchetype as "esensial" | "seimbang" | "lengkap"
        });

        if (success) {
            setUserName(editName);
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
                await navigator.clipboard.writeText(shareData.url);
                toast.success(locale === 'id' ? 'Link berhasil disalin!' : 'Link copied to clipboard!');
            }
        } catch (error) {
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

                <ProfileHeader
                    isDaylight={isDaylight}
                    isAuthenticated={isAuthenticated}
                    isMuhsinin={isMuhsinin}
                    userImage={userImage}
                    onClose={() => setIsOpen(false)}
                />

                <div className="px-6 pb-6 pt-3 relative z-10 flex-1 overflow-y-auto scrollbar-hide">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            {isEditing ? (
                                <ProfileEditForm
                                    isDaylight={isDaylight}
                                    editName={editName}
                                    setEditName={setEditName}
                                    editGender={editGender}
                                    setEditGender={setEditGender}
                                    editArchetype={editArchetype}
                                    setEditArchetype={setEditArchetype}
                                    translatedArchetypes={translatedArchetypes}
                                    handleSaveProfile={handleSaveProfile}
                                    isUpdating={isUpdating}
                                    setIsEditing={setIsEditing}
                                />
                            ) : (
                                <>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <h2 className={cn("text-xl font-bold leading-tight", isDaylight ? "text-slate-900" : "text-white")}>{userName}</h2>
                                            <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-white transition-colors">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
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

                    <GamificationStats isDaylight={isDaylight} stats={stats} />

                    <AuthActions
                        isDaylight={isDaylight}
                        isAuthenticated={isAuthenticated}
                        handleLogin={handleLogin}
                        handleShareApp={handleShareApp}
                        showLogoutConfirm={showLogoutConfirm}
                        setShowLogoutConfirm={setShowLogoutConfirm}
                        handleLogout={handleLogout}
                    />

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-white/5 text-center px-4">
                        <p className="text-[10px] text-slate-600">{(t as any).profileFooter}</p>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
