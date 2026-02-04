"use client";

import { useState, useEffect } from "react";
import { User, Edit2, Sparkles, Trophy, Crown, Star, Lock, BookOpen, Fingerprint, Check, Flame, Zap, Sprout, Shield, Target, Heart, Compass, Mountain, Gem, Sun, Camera, Image } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { getPlayerStats, PlayerStats } from "@/lib/leveling";
import { getStreak, StreakData } from "@/lib/streak-utils";
import { cn } from "@/lib/utils";
import { useInfaq } from "@/context/InfaqContext";
import { useLocale } from "@/context/LocaleContext";
import InfaqModal from "./InfaqModal";

interface UserProfileData {
    name: string;
    title: string;
    level: number;
    gender: 'male' | 'female' | null;
    archetype: 'pemula' | 'penggerak' | 'mujahid' | null;
    avatar?: string; // Base64 image or emoji
}

const ARCHETYPES = [
    {
        id: "pemula",
        label: "Pemula",
        sub: "Fokus Wajib",
        icon: Sprout,
        color: "text-[rgb(var(--color-primary-light))]",
        bg: "bg-[rgb(var(--color-primary))]/10",
        border: "border-[rgb(var(--color-primary))]/20",
        description: "Membangun pondasi yang kokoh dengan menjaga ibadah wajib."
    },
    {
        id: "penggerak",
        label: "Penggerak",
        sub: "Wajib + Sunnah",
        icon: Target, // Or Zap
        color: "text-[rgb(var(--color-primary-light))]",
        bg: "bg-[rgb(var(--color-primary))]/10",
        border: "border-blue-500/20",
        description: "Menambah amalan sunnah ringan untuk mendekatkan diri."
    },
    {
        id: "mujahid",
        label: "Mujahid",
        sub: "Extra Strong",
        icon: Shield,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        description: "Bersungguh-sungguh dengan ibadah wajib dan sunnah yang berat."
    }
];

const AVAILABLE_TITLES = [
    {
        id: "hamba",
        label: "Hamba Perindu",
        icon: Heart,
        color: "text-rose-400",
        minLevel: 1,
        description: "Langkah pertama seorang hamba yang mulai merindukan pulang, mengetuk pintu langit dengan doa-doa lirih.",
        rewards: ["Akses Misi Harian", "Badge Hati"]
    },
    {
        id: "penjaga",
        label: "Penjaga Niat",
        icon: Compass,
        color: "text-[rgb(var(--color-primary-light))]",
        minLevel: 5,
        description: "Berjuang menjaga hati di tengah riuh dunia, belajar ikhlas dalam setiap sujud dan sedekah.",
        rewards: ["Unlock Statistik Mingguan", "Akses 'Streak Saver' [PRO]"]
    },
    {
        id: "pejuang",
        label: "Pilar Istiqamah",
        icon: Mountain,
        color: "text-[rgb(var(--color-primary-light))]",
        minLevel: 10,
        description: "Tak lagi goyah oleh suasana hati. Ibadah telah menjadi kebutuhan, bukan sekadar kewajiban.",
        rewards: ["Unlock Kustomisasi Tema [PRO]", "Mode Fokus [PRO]"]
    },
    {
        id: "ridha",
        label: "Pencari Ridha",
        icon: Gem,
        color: "text-violet-400",
        minLevel: 15,
        description: "Mata tak lagi tertuju pada surga atau neraka, melainkan pada senyum ridha Sang Pencipta. Lelah menjadi Lillah.",
        rewards: ["Unlock Fitur 'Target Hafalan'", "Analisis Ibadah Bulanan [PRO]"]
    },
    {
        id: "cahaya",
        label: "Cahaya Taqwa",
        icon: Sun,
        color: "text-amber-400",
        minLevel: 20,
        description: "Ketaatan yang memancar, memberi ketenangan bagi sekitar. Lisannya basah oleh dzikir, hatinya sibuk dengan pikir.",
        rewards: ["Akses Mentor AI (Beta) [PRO]", "Rekomendasi Misi Personal"]
    },
    {
        id: "kekasih",
        label: "Kekasih Allah",
        icon: Crown,
        color: "text-yellow-300",
        minLevel: 30,
        description: "Puncak perjalanan cinta. Ketika Allah menjadi pendengaran, penglihatan, dan tujuannya.",
        rewards: ["Badge Mahkota Abadi", "Efek Visual 'Glow' Avatar [PRO]"]
    },
];

interface UserProfileDialogProps {
    children: React.ReactNode;
    onProfileUpdate?: () => void;
}

export default function UserProfileDialog({ children, onProfileUpdate }: UserProfileDialogProps) {
    const { isMuhsinin } = useInfaq();
    const [showInfaqModal, setShowInfaqModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [profile, setProfile] = useState<UserProfileData>({
        name: "Sobat Nawaetu",
        title: "Hamba Allah",
        level: 1,
        gender: null,
        archetype: null
    });
    const [stats, setStats] = useState<PlayerStats>({ xp: 0, level: 1, nextLevelXp: 100, progress: 0 });
    const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastActiveDate: "", milestones: [] });
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [selectedTier, setSelectedTier] = useState<typeof AVAILABLE_TITLES[0] | null>(null);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    
    const { t } = useLocale();

    const loadData = () => {
        const savedName = localStorage.getItem("user_name");
        const savedTitle = localStorage.getItem("user_title");
        const savedGender = localStorage.getItem("user_gender") as 'male' | 'female' | null;
        const savedArchetype = localStorage.getItem("user_archetype") as 'pemula' | 'penggerak' | 'mujahid' | null;
        const savedAvatar = localStorage.getItem("user_avatar");
        const currentStats = getPlayerStats();
        const currentStreak = getStreak();

        setProfile({
            name: savedName || "Sobat Nawaetu",
            title: savedTitle || "Hamba Allah",
            level: currentStats.level,
            gender: savedGender,
            archetype: savedArchetype,
            avatar: savedAvatar || undefined
        });
        setStats(currentStats);
        setStreak(currentStreak);
    };

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    // Listen for external updates (e.g. from TasbihCounter) even if open
    useEffect(() => {
        const handleUpdate = () => {
            if (isOpen) loadData();
        };
        window.addEventListener("xp_updated", handleUpdate);
        return () => window.removeEventListener("xp_updated", handleUpdate);
    }, [isOpen]);

    const handleSaveName = () => {
        if (editName.trim()) {
            localStorage.setItem("user_name", editName);
            setProfile(prev => ({ ...prev, name: editName }));
            setIsEditing(false);
            if (onProfileUpdate) onProfileUpdate();
        }
    };

    // Just select the title if unlocked
    const handleTitleSelect = (titleLabel: string) => {
        setProfile(prev => ({ ...prev, title: titleLabel }));
        localStorage.setItem("user_title", titleLabel);
    };

    const handleGenderSelect = (gender: 'male' | 'female') => {
        setProfile(prev => ({ ...prev, gender }));
        localStorage.setItem("user_gender", gender);
        if (onProfileUpdate) onProfileUpdate();
    };

    const handleArchetypeSelect = (archetype: 'pemula' | 'penggerak' | 'mujahid') => {
        setProfile(prev => ({ ...prev, archetype }));
        localStorage.setItem("user_archetype", archetype);
        if (onProfileUpdate) onProfileUpdate();
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size <= 1024 * 1024) { // Max 1MB
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                localStorage.setItem("user_avatar", base64);
                setProfile(prev => ({ ...prev, avatar: base64 }));
                window.dispatchEvent(new Event('avatar_updated'));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarSelect = (emoji: string) => {
        localStorage.setItem("user_avatar", emoji);
        setProfile(prev => ({ ...prev, avatar: emoji }));
        window.dispatchEvent(new Event('avatar_updated'));
        setIsEditingAvatar(false); // Close after selection
    };

    // Avatar Collections - Free vs Premium (matches subscription tiers)
    const AVATAR_COLLECTIONS = {
        free: {
            label: "Gratis",
            description: "Islamic & peaceful themes",
            avatars: [
                { id: 'moon', name: 'Crescent Moon', emoji: '🌙' },
                { id: 'mosque', name: 'Mosque', emoji: '🕌' },
                { id: 'beads', name: 'Prayer Beads', emoji: '📿' },
                { id: 'book', name: 'Quran', emoji: '📖' },
                { id: 'lantern', name: 'Lantern', emoji: '🏮' },
                { id: 'droplet', name: 'Water', emoji: '💧' },
                { id: 'pattern', name: 'Islamic Pattern', emoji: '✨' },
                { id: 'leaf', name: 'Nature', emoji: '🍃' },
                { id: 'compass', name: 'Compass', emoji: '🧭' },
                { id: 'star', name: 'Star', emoji: '⭐' },
            ]
        },
        premium: {
            label: "Koleksi Muhsinin",
            description: isMuhsinin ? "Terbuka - Terima kasih orang baik!" : "Khusus untuk donatur Nawaetu",
            locked: !isMuhsinin,
            avatars: [
                // Luxury gradient tier
                { id: 'crown', name: 'Crown', emoji: '👑' },
                { id: 'diamond', name: 'Diamond', emoji: '💎' },
                { id: 'trophy', name: 'Trophy', emoji: '🏆' },
                { id: 'lightning', name: 'Lightning', emoji: '⚡' },
                { id: 'flame', name: 'Flame', emoji: '🔥' },
                { id: 'butterfly', name: 'Butterfly', emoji: '🦋' },
                { id: 'palette', name: 'Art', emoji: '🎨' },
                { id: 'blossom', name: 'Blossom', emoji: '🌸' },
                // Epic creatures tier
                { id: 'dragon', name: 'Dragon', emoji: '🐉' },
                { id: 'eagle', name: 'Eagle', emoji: '🦅' },
                { id: 'lion', name: 'Lion', emoji: '🦁' },
                { id: 'wolf', name: 'Wolf', emoji: '🐺' },
                { id: 'unicorn', name: 'Unicorn', emoji: '🦄' },
                { id: 'peacock', name: 'Peacock', emoji: '🦚' },
                { id: 'phoenix', name: 'Phoenix', emoji: '🔥' },
                { id: 'nebula', name: 'Nebula', emoji: '🌌' },
            ]
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) {
                setEditName(profile.name);
                setIsEditing(false);
                setSelectedTier(null);
            }
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="w-[90%] max-w-sm rounded-[32px] bg-slate-950/80 border border-white/10 overflow-hidden text-white backdrop-blur-3xl h-[85vh] flex flex-col p-0 shadow-2xl">
                <DialogTitle className="sr-only">Profil Pengguna</DialogTitle>

                {selectedTier ? (
                    // TIER DETAIL OVERLAY
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-10 duration-300">
                        {/* Header */}
                        <div className="flex-none p-6 pt-8 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>

                            <button
                                onClick={() => setSelectedTier(null)}
                                className="absolute top-4 left-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </button>

                            <div className="flex flex-col items-center justify-center pt-4 relative z-10">
                                <div className={cn(
                                    "w-24 h-24 rounded-2xl flex items-center justify-center mb-4 shadow-2xl border-4 border-slate-950",
                                    selectedTier.minLevel > stats.level ? "bg-slate-800 opacity-50 grayscale" : "bg-slate-900",
                                    selectedTier.color.replace('text-', 'bg-').replace('400', '900/50')
                                )}>
                                    <selectedTier.icon className={cn("w-12 h-12", selectedTier.color)} />
                                </div>
                                <h2 className={cn("text-2xl font-bold tracking-tight mb-1 text-center", selectedTier.color)}>
                                    {selectedTier.label}
                                </h2>
                                <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono font-bold text-slate-400 border border-white/5">
                                    Minimal Level {selectedTier.minLevel}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/50">
                            {/* Status */}
                            <div className="text-center">
                                {stats.level >= selectedTier.minLevel ? (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 rounded-xl text-[rgb(var(--color-primary-light))] text-sm font-bold">
                                        <Check className="w-4 h-4" /> {t?.profileTitleUnlock}
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-white/5 rounded-xl text-slate-400 text-sm font-bold">
                                        <Lock className="w-4 h-4" /> {t?.profileTitleLocked?.replace("{level}", selectedTier.minLevel.toString())}
                                    </div>
                                )}
                            </div>

                            {/* Philosophy */}
                            <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{t?.profilePhilosophy}</h3>
                                <p className="text-sm text-slate-300 leading-relaxed italic">
                                    "{selectedTier.description}"
                                </p>
                            </div>

                            {/* Rewards */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">{t?.profileRewards}</h3>
                                {selectedTier.rewards?.map((reward, i) => {
                                    const isPrem = reward.includes("[PRO]");
                                    const displayReward = reward.replace(" [PRO]", "");
                                    const isLockedPremium = isPrem && !isMuhsinin;

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => isLockedPremium && setShowInfaqModal(true)}
                                            className={cn(
                                                "flex items-center gap-3 p-3 border rounded-xl transition-all",
                                                isLockedPremium
                                                    ? "bg-amber-500/5 border-amber-500/20 cursor-pointer hover:bg-amber-500/10"
                                                    : "bg-gradient-to-r from-slate-900/80 to-slate-900/40 border-white/5"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-2 rounded-lg shrink-0",
                                                isLockedPremium ? "bg-amber-500/10" : "bg-white/5"
                                            )}>
                                                {isLockedPremium ? (
                                                    <Lock className="w-3 h-3 text-amber-500" />
                                                ) : (
                                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <span className={cn("text-sm font-medium", isLockedPremium ? "text-amber-200" : "text-slate-200")}>
                                                    {displayReward}
                                                </span>
                                                {isLockedPremium && (
                                                    <p className="text-[10px] text-amber-500/60 leading-none mt-0.5">PRO Only</p>
                                                )}
                                            </div>
                                            {isLockedPremium && <Crown className="w-3 h-3 text-amber-500" />}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Action Button */}
                            {stats.level >= selectedTier.minLevel && profile.title !== selectedTier.label && (
                                <Button
                                    className="w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white font-bold h-12 rounded-xl mt-4"
                                    onClick={() => handleTitleSelect(selectedTier.label)}
                                >
                                    {t?.profileUseTitle}
                                </Button>
                            )}

                            {profile.title === selectedTier.label && (
                                <div className="text-center text-xs text-[rgb(var(--color-primary))] font-medium mt-4">
                                    {t?.profileCurrentTitle}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // MAIN PROFILE VIEW
                    <>
                        {/* HEADER SECTION */}
                        <div className="flex-none relative h-40 bg-gradient-to-b from-[rgb(var(--color-primary-dark))] via-slate-900 to-slate-950 shrink-0">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>

                            {/* Avatar & Name */}
                            <div className="absolute -bottom-14 left-0 right-0 flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-full bg-slate-900 border-[6px] border-slate-950 flex items-center justify-center shadow-2xl relative z-10 overflow-hidden cursor-pointer">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-[rgb(var(--color-primary))]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Avatar Display - Image, Emoji, or Initial */}
                                        {profile.avatar ? (
                                            profile.avatar.startsWith('data:') ? (
                                                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-5xl">{profile.avatar}</span>
                                            )
                                        ) : (
                                            <span className="text-4xl font-bold text-[rgb(var(--color-primary))] drop-shadow-[0_0_15px_rgba(var(--color-primary),0.5)]">
                                                {profile.name ? profile.name.charAt(0).toUpperCase() : "N"}
                                            </span>
                                        )}

                                        {/* Camera Overlay */}
                                        <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <Camera className="w-8 h-8 text-white" />
                                        </label>
                                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                    </div>

                                    {/* Tiered Avatar Selector */}
                                    <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none group-hover:pointer-events-auto">
                                        <div className="bg-slate-900/98 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl w-80">
                                            {/* Free Collection */}
                                            <div className="mb-3">
                                                <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold mb-2 px-1">{AVATAR_COLLECTIONS.free.label}</p>
                                                <p className="text-[8px] text-white/30 mb-2 px-1">{AVATAR_COLLECTIONS.free.description}</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {AVATAR_COLLECTIONS.free.avatars.map((avatar) => (
                                                        <button
                                                            key={avatar.id}
                                                            onClick={() => handleAvatarSelect(avatar.emoji)}
                                                            className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all text-xl hover:scale-110 active:scale-95 group relative"
                                                            title={avatar.name}
                                                        >
                                                            {avatar.emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Premium Collection */}
                                            <div className="mb-3">
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <p className="text-[9px] uppercase tracking-wider text-amber-400 font-bold px-1">{AVATAR_COLLECTIONS.premium.label}</p>
                                                    {AVATAR_COLLECTIONS.premium.locked && <Lock className="w-3 h-3 text-amber-400" />}
                                                </div>
                                                <p className="text-[8px] text-amber-400/60 mb-2 px-1">{AVATAR_COLLECTIONS.premium.description}</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {AVATAR_COLLECTIONS.premium.avatars.map((avatar) => (
                                                        <button
                                                            key={avatar.id}
                                                            onClick={() => AVATAR_COLLECTIONS.premium.locked ? setShowInfaqModal(true) : handleAvatarSelect(avatar.emoji)}
                                                            className={cn("w-9 h-9 flex items-center justify-center rounded-lg transition-all text-xl relative", AVATAR_COLLECTIONS.premium.locked ? "opacity-40 grayscale" : "hover:bg-amber-500/10 hover:scale-110")}
                                                            title={avatar.name}
                                                        >
                                                            {avatar.emoji}
                                                            {AVATAR_COLLECTIONS.premium.locked && <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg"><Lock className="w-3 h-3 text-white" /></div>}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-black px-3 py-0.5 rounded-full border-[3px] border-slate-950 shadow-lg flex items-center gap-1 min-w-max uppercase tracking-wider">
                                        <Crown className="w-3 h-3 fill-current" />
                                        <span>LEVEL {stats.level}</span>
                                    </div>
                                </div>

                                {/* Editable Name */}
                                <div className="mt-4 flex items-center gap-2 relative z-10">
                                    {isEditing ? (
                                        <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-8 bg-slate-800/80 border-[rgb(var(--color-primary))]/50 text-center font-bold text-lg w-40 p-0 rounded-lg focus:ring-1 focus:ring-[rgb(var(--color-primary))]"
                                                autoFocus
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                            />
                                            <Button size="icon" className="h-8 w-8 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] rounded-full" onClick={handleSaveName}>
                                                <Check className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
                                            <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{profile.name}</h3>
                                            <Edit2 className="w-3 h-3 text-[rgb(var(--color-primary))]/50 group-hover:text-[rgb(var(--color-primary-light))] transition-colors" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                    <p className="text-sm font-medium text-[rgb(var(--color-primary-light))] tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{profile.title}</p>
                                    {!isMuhsinin ? (
                                        <button
                                            onClick={() => setShowInfaqModal(true)}
                                            className="ml-2 text-[10px] font-bold px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/30 to-teal-600/30 text-emerald-300 border border-emerald-500/40 hover:from-emerald-500/40 hover:to-teal-600/40 transition-all flex items-center gap-1 animate-pulse shadow-lg"
                                        >
                                            <Heart className="w-3 h-3" /> Dukung
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setShowInfaqModal(true)}
                                            className="ml-2 bg-emerald-500 rounded-full p-1.5 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)] hover:bg-emerald-400 transition-all hover:scale-110 cursor-pointer group/infaq relative"
                                            title="Tambah Infaq"
                                        >
                                            <Heart className="w-3.5 h-3.5 text-white fill-white" />
                                            {/* Tooltip hint on hover */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-[10px] text-white rounded opacity-0 group-hover/infaq:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                Tambah Infaq
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pt-16 pb-6 space-y-6 scrollbar-hide">

                            {/* GENDER SELECTION */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 border border-white/5">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">{t?.profileGenderLabel}</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleGenderSelect('male')}
                                        className={cn(
                                            "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                                            profile.gender === 'male'
                                                ? "bg-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary))]/50 text-[rgb(var(--color-primary-light))]"
                                                : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                                        )}
                                    >
                                        <span className="text-xl">👨</span>
                                        <span className="text-sm font-semibold">{t?.profileMale}</span>
                                    </button>
                                    <button
                                        onClick={() => handleGenderSelect('female')}
                                        className={cn(
                                            "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                                            profile.gender === 'female'
                                                ? "bg-pink-500/20 border-pink-500/50 text-pink-400"
                                                : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                                        )}
                                    >
                                        <span className="text-xl">👩</span>
                                        <span className="text-sm font-semibold">{t?.profileFemale}</span>
                                    </button>
                                </div>
                                {!profile.gender && (
                                    <p className="text-[10px] text-amber-400/70 mt-2 text-center">
                                        {t?.profileGenderHint}
                                    </p>
                                )}
                            </div>

                            {/* ARCHETYPE SELECTION (FOKUS IBADAH) */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 border border-white/5">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">{t?.profileArchetypeLabel}</Label>
                                <div className="space-y-2">
                                    {ARCHETYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => handleArchetypeSelect(type.id as any)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group relative overflow-hidden",
                                                profile.archetype === type.id
                                                    ? `bg-slate-800 ${type.border} ring-1 ring-offset-0 ${type.color.replace('text-', 'ring-')}`
                                                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                                            )}
                                        >
                                            {profile.archetype === type.id && (
                                                <div className={cn("absolute inset-0 opacity-10", type.bg)} />
                                            )}

                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
                                                profile.archetype === type.id
                                                    ? `bg-slate-900 ${type.border}`
                                                    : "bg-slate-900 border-white/5 text-slate-500"
                                            )}>
                                                <type.icon className={cn("w-5 h-5", profile.archetype === type.id ? type.color : "text-slate-500")} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className={cn("text-sm font-bold", profile.archetype === type.id ? "text-white" : "text-slate-300")}>
                                                        {type.label}
                                                    </span>
                                                    {profile.archetype === type.id && <Check className="w-4 h-4 text-[rgb(var(--color-primary))]" />}
                                                </div>
                                                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{type.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* XP PROGRESS CARD */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-white/5 shadow-inner relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Sparkles className="w-12 h-12 text-[rgb(var(--color-primary-light))]" />
                                </div>

                                <div className="flex justify-between items-end mb-2 relative z-10">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t?.profileProgressLabel}</span>
                                    <span className="text-xs font-mono font-bold text-[rgb(var(--color-primary-light))]">
                                        {stats.xp} <span className="text-slate-500">/</span> {stats.nextLevelXp} XP
                                    </span>
                                </div>

                                {/* High Visibility Progress Bar */}
                                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 relative z-10">
                                    <div
                                        className="h-full bg-gradient-to-r from-[rgb(var(--color-primary-dark))] via-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-light))] shadow-[0_0_10px_rgba(var(--color-primary),0.5)] transition-all duration-1000 ease-out"
                                        style={{ width: `${stats.progress}%` }}
                                    />
                                </div>

                                <p className="text-[10px] text-slate-500 mt-2 text-center font-medium">
                                    {t?.profileNeedXP?.replace("{xp}", (stats.nextLevelXp - stats.xp).toString()).replace("{level}", (stats.level + 1).toString())}
                                </p>
                            </div>

                            {/* STREAK & STATS CARD */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Current Streak */}
                                <div className="bg-gradient-to-br from-orange-900/50 to-amber-900/50 rounded-2xl p-4 border border-orange-500/20 relative overflow-hidden group">
                                    <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                                        <Flame className="w-16 h-16 text-orange-500" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-orange-500/20 rounded-lg">
                                                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                                            </div>
                                            <span className="text-[10px] font-bold text-orange-200 uppercase tracking-wider">{t?.profileStreak}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-white">{streak.currentStreak}</span>
                                            <span className="text-xs font-bold text-orange-300">{t?.profileDays}</span>
                                        </div>
                                        <p className="text-[10px] text-orange-200/60 font-medium leading-tight mt-1">
                                            {t?.profileStreakMaintain}
                                        </p>
                                    </div>
                                </div>

                                {/* Longest Streak (Best Record) */}
                                <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/5 relative overflow-hidden">
                                    <div className="absolute -right-2 -top-2 opacity-5 rotate-12">
                                        <Trophy className="w-16 h-16 text-white" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-slate-800 rounded-lg">
                                                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t?.profileRecord}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-white">{streak.longestStreak}</span>
                                            <span className="text-xs font-bold text-slate-500">{t?.profileDays}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">
                                            {t?.profileBestAchievement}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* TITLE COLLECTION */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t?.profileTitleCollection}</Label>
                                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                                        {AVAILABLE_TITLES.filter(t => stats.level >= t.minLevel).length}/{AVAILABLE_TITLES.length}
                                    </span>
                                </div>

                                <div className="grid gap-3">
                                    {AVAILABLE_TITLES.map((t) => {
                                        const isLocked = stats.level < t.minLevel;
                                        const isSelected = profile.title === t.label;

                                        return (
                                            <button
                                                key={t.id}
                                                onClick={() => setSelectedTier(t)}
                                                className={cn(
                                                    "relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group overflow-hidden w-full text-left",
                                                    isLocked
                                                        ? "bg-slate-900/50 border-white/5 opacity-60 grayscale"
                                                        : "bg-gradient-to-r from-slate-900 to-slate-800 border-white/10 hover:border-[rgb(var(--color-primary))]/30 cursor-pointer shadow-lg hover:shadow-[rgb(var(--color-primary-dark))]/10",
                                                    isSelected && "ring-1 ring-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))]/50 bg-[rgb(var(--color-primary-dark))]/20"
                                                )}
                                            >
                                                {/* Selection Indicator */}
                                                {isSelected && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[rgb(var(--color-primary))] shadow-[0_0_10px_rgba(var(--color-primary),0.8)]" />
                                                )}

                                                {/* Icon Box */}
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-inner transition-colors",
                                                    isLocked
                                                        ? "bg-slate-950 border-slate-800 text-slate-700"
                                                        : cn("bg-slate-950 border-white/5", t.color)
                                                )}>
                                                    {isLocked ? <Lock className="w-5 h-5" /> : <t.icon className="w-6 h-6" />}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0 py-0.5">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className={cn(
                                                            "font-bold text-sm tracking-tight",
                                                            isSelected ? "text-[rgb(var(--color-primary-light))]" : (isLocked ? "text-slate-500" : "text-white group-hover:text-[rgb(var(--color-primary-light))]")
                                                        )}>
                                                            {t.label}
                                                        </h4>
                                                        {isLocked && (
                                                            <span className="text-[9px] font-black text-slate-950 bg-slate-600 px-1.5 py-0.5 rounded uppercase">
                                                                Lvl {t.minLevel}
                                                            </span>
                                                        )}
                                                        {!isLocked && isSelected && (
                                                            <Check className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed truncate">
                                                        {t.description}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* FOOTER INFO */}
                            <div className="pt-6 border-t border-white/5">
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block text-center">{t.xpSectionTitle}</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/quran" onClick={() => setIsOpen(false)} className="bg-slate-900/50 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center gap-2 hover:bg-slate-800/50 hover:border-blue-500/30 transition-all cursor-pointer group">
                                        <BookOpen className="w-5 h-5 text-[rgb(var(--color-primary-light))] group-hover:scale-110 transition-transform" />
                                        <div>
                                            <span className="block text-xs font-bold text-white group-hover:text-[rgb(var(--color-primary-light))] transition-colors">{t.xpMethodReadQuran}</span>
                                            <span className="text-[10px] text-[rgb(var(--color-primary-light))] font-mono">{t.xpReadQuranReward}</span>
                                        </div>
                                    </Link>
                                    <Link href="/tasbih" onClick={() => setIsOpen(false)} className="bg-slate-900/50 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center gap-2 hover:bg-slate-800/50 hover:border-[rgb(var(--color-primary))]/30 transition-all cursor-pointer group">
                                        <Fingerprint className="w-5 h-5 text-[rgb(var(--color-primary-light))] group-hover:scale-110 transition-transform" />
                                        <div>
                                            <span className="block text-xs font-bold text-white group-hover:text-[rgb(var(--color-primary-light))] transition-colors">{t.xpMethodTasbih}</span>
                                            <span className="text-[10px] text-[rgb(var(--color-primary-light))] font-mono">{t.xpTasbihReward}</span>
                                        </div>
                                    </Link>
                                    <Link href="/" onClick={() => setIsOpen(false)} className="bg-slate-900/50 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center gap-2 hover:bg-slate-800/50 hover:border-purple-500/30 transition-all cursor-pointer group">
                                        <Check className="w-5 h-5 text-[rgb(var(--color-accent))] group-hover:scale-110 transition-transform" />
                                        <div>
                                            <span className="block text-xs font-bold text-white group-hover:text-[rgb(var(--color-accent))] transition-colors">{t.xpMethodDailyMission}</span>
                                            <span className="text-[10px] text-[rgb(var(--color-accent))] font-mono">{t.xpDailyMissionReward}</span>
                                        </div>
                                    </Link>
                                    <Link href="/stats" onClick={() => setIsOpen(false)} className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-3 rounded-xl border border-amber-500/20 flex flex-col items-center text-center gap-2 hover:bg-amber-500/20 hover:border-amber-500/30 transition-all cursor-pointer group">
                                        <Star className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                                        <div>
                                            <span className="block text-xs font-bold text-amber-200 group-hover:text-amber-100 transition-colors">{t.xpMethodStatistics}</span>
                                            <span className="text-[10px] text-amber-400/70 font-mono">{t.xpStatisticsHint}</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
            <InfaqModal isOpen={showInfaqModal} onClose={() => setShowInfaqModal(false)} />
        </Dialog>
    );
}
