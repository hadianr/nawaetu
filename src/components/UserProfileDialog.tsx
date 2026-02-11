"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Settings, Edit2, Camera, LogOut, Crown, Flame, Share2, ChevronRight, Sparkles, AlertCircle, Calendar, Check, Lock, Heart, Trophy, Zap, Mountain, BookOpen, Sun, Sprout, Target, Shield, X
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
import { useDataSync } from "@/hooks/useDataSync";
import { useProfile } from "@/hooks/useProfile";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { Loader2, RefreshCw } from "lucide-react";

// --- CONSTANTS & DATA ---

const ARCHETYPES = [
    {
        id: "pemula",
        label: "Pemula",
        icon: Sprout,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        description: "Membangun pondasi yang kokoh dengan menjaga ibadah wajib."
    },
    {
        id: "penggerak",
        label: "Penggerak",
        icon: Target,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        description: "Menambah amalan sunnah ringan untuk mendekatkan diri."
    },
    {
        id: "mujahid",
        label: "Mujahid",
        icon: Shield,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        description: "Bersungguh-sungguh dengan ibadah wajib dan sunnah yang berat."
    }
];

const AVAILABLE_TITLES = [
    { id: "hamba", label: "Hamba Allah", icon: Heart, minLevel: 1, color: "text-slate-400" },
    { id: "pencari", label: "Pencari Ilmu", icon: BookOpen, minLevel: 5, color: "text-blue-400" },
    { id: "pejuang", label: "Pejuang Subuh", icon: Sun, minLevel: 10, color: "text-orange-400" },
    { id: "ahli", label: "Ahli Dzikir", icon: Zap, minLevel: 20, color: "text-purple-400" },
    { id: "muhsinin", label: "Sahabat Nawaetu", icon: Crown, minLevel: 0, color: "text-amber-400", locked: true } // Special
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
    const { t } = useLocale();
    const { syncData, isSyncing } = useDataSync();
    const { updateProfile, isUpdating } = useProfile();

    // Derived State
    const isAuthenticated = status === "authenticated";
    // FIXED: Only logged in users can be Muhsinin
    const isMuhsinin = isAuthenticated && (session?.user?.isMuhsinin || contextIsMuhsinin || false);
    const userName = session?.user?.name || "Hamba Allah";
    const userRole = isMuhsinin ? "Muhsinin Nawaetu" : "Pengguna Setia";
    const userImage = session?.user?.image || AVATAR_LIST[0].src;

    // State for Editing
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        if (session?.user?.name) {
            setEditName(session.user.name);
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
        storage.remove(STORAGE_KEYS.USER_TOTAL_INFAQ);
        storage.remove(STORAGE_KEYS.USER_INFAQ_HISTORY);
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

        // Tasbih
        storage.remove(STORAGE_KEYS.TASBIH_COUNT);
        storage.remove(STORAGE_KEYS.TASBIH_TARGET);
        storage.remove(STORAGE_KEYS.TASBIH_ACTIVE_PRESET);
        storage.remove(STORAGE_KEYS.TASBIH_STREAK);
        storage.remove(STORAGE_KEYS.TASBIH_LAST_DATE);
        storage.remove(STORAGE_KEYS.TASBIH_DAILY_COUNT);

        // Settings
        storage.remove(STORAGE_KEYS.SETTINGS_THEME);
        storage.remove(STORAGE_KEYS.SETTINGS_MUADZIN);
        storage.remove(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD);
        storage.remove(STORAGE_KEYS.SETTINGS_LOCALE);
        storage.remove(STORAGE_KEYS.SETTINGS_RECITER);

        // AI Chat
        storage.remove(STORAGE_KEYS.AI_CHAT_HISTORY);
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

        const success = await updateProfile({ name: editName });
        if (success) {
            setIsEditing(false);
            if (onProfileUpdate) onProfileUpdate();
        }
    };

    const handleManualSync = async () => {
        await syncData();
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
                        isMuhsinin
                            ? "bg-gradient-to-r from-emerald-600 to-teal-800"
                            : "bg-gradient-to-r from-slate-700 to-slate-900"
                    )}>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        {isMuhsinin && <div className="absolute inset-0 bg-emerald-500/20 mix-blend-overlay"></div>}
                    </div>

                    {/* Top Actions */}
                    <div className="relative z-20 flex justify-between items-center p-4">
                        {!isAuthenticated ? (
                            <div className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-[10px] items-center flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                Guest Mode
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
                                isMuhsinin ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0F172A]" : "ring-2 ring-slate-700 ring-offset-2 ring-offset-[#0F172A]"
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
                {/* 2. User Info */}
                <div className="px-6 pb-6 pt-3 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="space-y-2 mb-2">
                                    <Input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="h-9 bg-white/5 border-white/10"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handleSaveProfile}
                                            disabled={isUpdating}
                                            className="h-7 text-xs bg-emerald-600"
                                        >
                                            {isUpdating ? "..." : "Simpan"}
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-7 text-xs">Batal</Button>
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
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            {isMuhsinin ? (
                                                <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                                    <Sparkles className="w-3 h-3" />
                                                    {userRole}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">{userRole}</span>
                                            )}
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
                        <div className="mb-6 bg-slate-800/50 border border-white/5 rounded-xl p-4 text-center">
                            <div className="w-10 h-10 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Settings className="w-5 h-5 text-slate-300" />
                            </div>
                            <h3 className="text-sm font-bold text-white mb-1">Simpan Progress Ibadahmu</h3>
                            <p className="text-xs text-slate-400 mb-4 leading-relaxed">Login untuk menyimpan data streak, bookmark, dan status donatur secara permanen di cloud.</p>
                            <Button
                                onClick={handleLogin}
                                className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold h-10 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Login dengan Google
                            </Button>
                        </div>
                    )}

                    {/* 4. Stats Placeholder */}
                    {isAuthenticated && (
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
                                    <Flame className="w-4 h-4 text-orange-400" />
                                </div>
                                <span className="text-2xl font-black text-white">0</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-1">Hari Streak</span>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                                    <Calendar className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-2xl font-black text-white">0</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-1">Total Hari</span>
                            </div>
                        </div>
                    )}

                    {/* 5. Menu Items */}
                    <div className="space-y-1">
                        <button onClick={() => { setIsOpen(false); router.push('/atur'); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                    <Settings className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white">Pengaturan Aplikasi</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                        </button>

                        {isAuthenticated && (
                            <button
                                onClick={handleManualSync}
                                disabled={isSyncing}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                        {isSyncing ? (
                                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                        ) : (
                                            <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                                        {isSyncing ? "Menyinkronkan..." : "Sinkronisasi Data"}
                                    </span>
                                </div>
                                {!isSyncing && <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />}
                            </button>
                        )}

                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                    <Share2 className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white">Bagikan Aplikasi</span>
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
                                        <span className="text-sm font-medium text-red-400 group-hover:text-red-300">Keluar</span>
                                    </div>
                                </button>
                            ) : (
                                <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <p className="text-xs text-red-200 mb-3 text-center">Yakin ingin keluar akun?</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleLogout}
                                            className="flex-1 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                                        >
                                            Ya, Keluar
                                        </button>
                                        <button
                                            onClick={() => setShowLogoutConfirm(false)}
                                            className="flex-1 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-[10px] text-slate-600">Terima kasih telah menggunakan Nawaetu</p>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
