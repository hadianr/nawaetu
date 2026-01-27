"use client";

import { useState, useEffect } from "react";
import { User, Edit2, Sparkles, Trophy, Crown, Star, Lock, BookOpen, Fingerprint, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { getPlayerStats, PlayerStats } from "@/lib/leveling";
import { cn } from "@/lib/utils";

interface UserProfileData {
    name: string;
    title: string;
    level: number;
}

const AVAILABLE_TITLES = [
    {
        id: "hamba",
        label: "Hamba Perindu",
        icon: User,
        color: "text-slate-400",
        minLevel: 1,
        description: "Hati yang mulai menyadari jarak, melangkah pelan untuk kembali mendekat kepada-Nya."
    },
    {
        id: "penjaga",
        label: "Penjaga Niat",
        icon: Sparkles,
        color: "text-emerald-400",
        minLevel: 5,
        description: "Berusaha meluruskan hati di tengah riuh dunia, memastikan setiap sujud murni hanya untuk-Nya."
    },
    {
        id: "pejuang",
        label: "Pilar Istiqamah",
        icon: Star,
        color: "text-blue-400",
        minLevel: 10,
        description: "Tak lagi goyah oleh suasana hati, tetap teguh berdiri dalam taat meski lelah menghampiri."
    },
    {
        id: "cahaya",
        label: "Cahaya Taqwa",
        icon: Crown,
        color: "text-amber-400",
        minLevel: 20,
        description: "Menjadikan dzikir sebagai nafas hidup, memancarkan ketenangan bagi jiwa-jiwa di sekitarnya."
    },
];

interface UserProfileDialogProps {
    children: React.ReactNode;
    onProfileUpdate?: () => void;
}

export default function UserProfileDialog({ children, onProfileUpdate }: UserProfileDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [profile, setProfile] = useState<UserProfileData>({
        name: "Sobat Nawaetu",
        title: "Hamba Allah",
        level: 1
    });
    const [stats, setStats] = useState<PlayerStats>({ xp: 0, level: 1, nextLevelXp: 100, progress: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");

    const loadData = () => {
        const savedName = localStorage.getItem("user_name");
        const savedTitle = localStorage.getItem("user_title");
        const currentStats = getPlayerStats();

        setProfile({
            name: savedName || "Sobat Nawaetu",
            title: savedTitle || "Hamba Allah",
            level: currentStats.level
        });
        setStats(currentStats);
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

    const handleTitleSelect = (titleLabel: string, minLevel: number) => {
        if (stats.level >= minLevel) {
            setProfile(prev => ({ ...prev, title: titleLabel }));
            localStorage.setItem("user_title", titleLabel);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) {
                setEditName(profile.name);
                setIsEditing(false);
            }
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="w-[90%] max-w-sm rounded-[32px] bg-slate-950 border border-white/10 overflow-hidden text-white backdrop-blur-3xl h-[85vh] flex flex-col p-0 shadow-2xl">
                <DialogTitle className="sr-only">Profil Pengguna</DialogTitle>

                {/* HEADER SECTION */}
                <div className="flex-none relative h-40 bg-gradient-to-b from-emerald-900 via-slate-900 to-slate-950 shrink-0">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>

                    {/* Avatar & Name */}
                    <div className="absolute -bottom-14 left-0 right-0 flex flex-col items-center">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full bg-slate-900 border-[6px] border-slate-950 flex items-center justify-center shadow-2xl relative z-10 group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-4xl font-bold text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                                    {profile.name ? profile.name.charAt(0).toUpperCase() : "N"}
                                </span>
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
                                        className="h-8 bg-slate-800/80 border-emerald-500/50 text-center font-bold text-lg w-40 p-0 rounded-lg focus:ring-1 focus:ring-emerald-500"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                    />
                                    <Button size="icon" className="h-8 w-8 bg-emerald-500 hover:bg-emerald-600 rounded-full" onClick={handleSaveName}>
                                        <Check className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
                                    <h3 className="text-xl font-bold text-white tracking-tight">{profile.name}</h3>
                                    <Edit2 className="w-3 h-3 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
                                </div>
                            )}
                        </div>
                        <p className="text-sm font-medium text-emerald-400/80 tracking-wide mt-0.5">{profile.title}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pt-16 pb-6 space-y-8 scrollbar-hide">

                    {/* XP PROGRESS CARD */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-white/5 shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="w-12 h-12 text-emerald-400" />
                        </div>

                        <div className="flex justify-between items-end mb-2 relative z-10">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress Level</span>
                            <span className="text-xs font-mono font-bold text-emerald-400">
                                {stats.xp} <span className="text-slate-500">/</span> {stats.nextLevelXp} XP
                            </span>
                        </div>

                        {/* High Visibility Progress Bar */}
                        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 relative z-10">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000 ease-out"
                                style={{ width: `${stats.progress}%` }}
                            />
                        </div>

                        <p className="text-[10px] text-slate-500 mt-2 text-center font-medium">
                            Butuh <span className="text-white font-bold">{stats.nextLevelXp - stats.xp} XP</span> lagi untuk naik ke Level {stats.level + 1}
                        </p>
                    </div>

                    {/* TITLE COLLECTION */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Koleksi Gelar</Label>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                                {AVAILABLE_TITLES.filter(t => stats.level >= t.minLevel).length}/{AVAILABLE_TITLES.length}
                            </span>
                        </div>

                        <div className="grid gap-3">
                            {AVAILABLE_TITLES.map((t) => {
                                const isLocked = stats.level < t.minLevel;
                                const isSelected = profile.title === t.label;

                                return (
                                    <div
                                        key={t.id}
                                        onClick={() => !isLocked && handleTitleSelect(t.label, t.minLevel)}
                                        className={cn(
                                            "relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group overflow-hidden",
                                            isLocked
                                                ? "bg-slate-900/50 border-white/5 opacity-60 grayscale cursor-not-allowed"
                                                : "bg-gradient-to-r from-slate-900 to-slate-800 border-white/10 hover:border-emerald-500/30 cursor-pointer shadow-lg hover:shadow-emerald-900/10",
                                            isSelected && "ring-1 ring-emerald-500 border-emerald-500/50 bg-emerald-950/20"
                                        )}
                                    >
                                        {/* Selection Indicator */}
                                        {isSelected && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
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
                                                    isSelected ? "text-emerald-300" : (isLocked ? "text-slate-500" : "text-white group-hover:text-emerald-200")
                                                )}>
                                                    {t.label}
                                                </h4>
                                                {isLocked && (
                                                    <span className="text-[9px] font-black text-slate-950 bg-slate-600 px-1.5 py-0.5 rounded uppercase">
                                                        Lvl {t.minLevel}
                                                    </span>
                                                )}
                                                {!isLocked && isSelected && (
                                                    <Check className="w-4 h-4 text-emerald-500" />
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                                {t.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* FOOTER INFO */}
                    <div className="pt-6 border-t border-white/5">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block text-center">Cara Mendapatkan XP</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center gap-2 hover:bg-slate-800/50 transition-colors">
                                <BookOpen className="w-5 h-5 text-blue-400" />
                                <div>
                                    <span className="block text-xs font-bold text-white">Baca Quran</span>
                                    <span className="text-[10px] text-blue-400 font-mono">+5 XP/ayat</span>
                                </div>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center gap-2 hover:bg-slate-800/50 transition-colors">
                                <Fingerprint className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <span className="block text-xs font-bold text-white">Tasbih</span>
                                    <span className="text-[10px] text-emerald-400 font-mono">+50 XP/sesi</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
