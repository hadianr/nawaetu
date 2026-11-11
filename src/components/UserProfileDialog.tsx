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
import { Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useInfaq } from "@/context/InfaqContext";
import { useLocale } from "@/context/LocaleContext";
import { useSession, signOut } from "next-auth/react";
import { signInWithGoogle } from "@/lib/auth-client";
import { useProfile } from "@/hooks/useProfile";
import { useDataSync } from "@/hooks/useDataSync";
import { clearAccountData } from "@/lib/account-data";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { getDisplayStreak } from "@/lib/habits/streak-utils";
import { getPlayerStats } from "@/lib/habits/leveling";
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
    const { syncData } = useDataSync();

    const isAuthenticated = status === "authenticated";
    const isMuhsinin = isAuthenticated && (session?.user?.isMuhsinin || contextIsMuhsinin || false);

    // Keep the first render identical on server and client; storage is loaded below.
    const [userName, setUserName] = useState<string>("Sobat Nawaetu");
    const [userImage, setUserImage] = useState<string>(AVATAR_LIST[0].src);

    // State for Editing
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editGender, setEditGender] = useState<"male" | "female" | null>(null);
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

        queueMicrotask(() => {
        if (session?.user?.name) {
            setUserName(session.user.name);
            setEditName(session.user.name);
        } else if (savedName) {
            setUserName(savedName);
            setEditName(savedName);
        } else {
            const defaultName = (t as unknown as Record<string, string>).onboardingDefaultName || "Sobat Nawaetu";
            setUserName(defaultName);
            setEditName(defaultName);
        }

        if (session?.user?.image) {
            storage.set(STORAGE_KEYS.USER_AVATAR, session.user.image);
            setUserImage(session.user.image);
        } else if (savedAvatar) {
            setUserImage(savedAvatar);
        } else {
            setUserImage(AVATAR_LIST[0].src);
        }

        if (savedGender === "male" || savedGender === "female") setEditGender(savedGender);
        else if (session?.user?.gender === "male" || session?.user?.gender === "female") setEditGender(session.user.gender);
        });

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

    const handleLogin = () => signInWithGoogle();

    const handleLogout = async () => {
        const storage = getStorageService();

        // Send unsent work first: the clean-up below removes it from this device. If it cannot be sent,
        // let the user decide instead of deleting it silently.
        const result = await syncData({ silent: true });
        if (!result.success && !window.confirm((t as unknown as Record<string, string>).logoutUnsyncedConfirm)) return;

        // The device keeps its prayer alerts as a guest, but no longer belongs to this account.
        const pushToken = localStorage.getItem("fcm_token");
        if (pushToken) {
            await fetch(`/api/notifications/subscribe?token=${encodeURIComponent(pushToken)}`, { method: "DELETE" }).catch(() => undefined);
        }

        // Everything that belongs to this account, including its unsent queue and premium status
        clearAccountData(storage);

        resetInfaq();
        // Cached API responses (including the session) belong to this account.
        if (typeof caches !== "undefined") {
            await Promise.all(["apis", "next-data", "pages-rsc"].map((name) => caches.delete(name).catch(() => false)));
        }
        await signOut({ callbackUrl: "/" });
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) return;

        const success = await updateProfile({
            name: editName,
            gender: editGender as "male" | "female"
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
            url: 'https://nawaetu.com/?utm_source=user_share&utm_medium=social&utm_campaign=app_share'
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success(locale === 'id' ? 'Terima kasih telah membagikan Nawaetu!' : 'Thanks for sharing Nawaetu!');
            } else {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
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
                    "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] shadow-[var(--shadow-floating)]"
                )}
            >
                <DialogTitle className="sr-only">Profil Pengguna</DialogTitle>

                <ProfileHeader
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
                                    editName={editName}
                                    setEditName={setEditName}
                                    editGender={editGender}
                                    setEditGender={setEditGender}
                                    handleSaveProfile={handleSaveProfile}
                                    isUpdating={isUpdating}
                                    setIsEditing={setIsEditing}
                                />
                            ) : (
                                <>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold leading-tight text-[rgb(var(--color-text-strong))]">{userName}</h2>
                                            <button onClick={() => setIsEditing(true)} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-primary-strong))] transition-colors">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        {isAuthenticated && session?.user?.email && (
                                            <div className="flex items-center gap-1.5 text-[10px] mt-0.5 text-[rgb(var(--color-text-muted))]">
                                                <div className={cn(
                                                    "w-3 h-3 rounded-full flex items-center justify-center",
                                                    "bg-[rgb(var(--color-surface-subtle))]"
                                                )}>
                                                    <span className="text-[6px] font-bold text-[rgb(var(--color-text))]">G</span>
                                                </div>
                                                {session.user.email}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <GamificationStats stats={stats} />

                    <AuthActions
                        isAuthenticated={isAuthenticated}
                        handleLogin={handleLogin}
                        handleShareApp={handleShareApp}
                        showLogoutConfirm={showLogoutConfirm}
                        setShowLogoutConfirm={setShowLogoutConfirm}
                        handleLogout={handleLogout}
                    />

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-[rgb(var(--color-border))] text-center px-4">
                        <p className="text-[10px] text-[rgb(var(--color-text-muted))]">{(t as unknown as Record<string, string>).profileFooter}</p>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
