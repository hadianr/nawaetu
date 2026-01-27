"use client";

import { useState, useEffect } from "react";
import { Moon, CheckCircle2, Circle, Trophy, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mission Types
type Mission = {
    id: string;
    title: string;
    category: 'Fiqih' | 'Ibadah' | 'Social';
    xp: number;
};

const MISSIONS: Mission[] = [
    { id: 'qadha_puasa', title: 'Bayar Qadha Puasa', category: 'Fiqih', xp: 30 },
    { id: 'cek_kesehatan', title: 'Cek Kesehatan (Medical Checkup)', category: 'Fiqih', xp: 10 },
    { id: 'puasa_sunnah', title: 'Puasa Sunnah (Min. 1x)', category: 'Ibadah', xp: 15 },
    { id: 'baca_article', title: 'Baca Artikel Fiqih Ramadhan', category: 'Fiqih', xp: 5 },
    { id: 'sedekah_subuh', title: 'Rutin Sedekah Subuh', category: 'Social', xp: 15 },
    { id: 'maaf_maafan', title: 'Saling Memaafkan', category: 'Social', xp: 10 },
    { id: 'rencana_cuti', title: 'Ajukan Cuti Itikaf (Opsional)', category: 'Social', xp: 5 },
    { id: 'target_khatam', title: 'Set Target Khatam Qur\'an', category: 'Ibadah', xp: 10 },
];

export default function RamadhanCountdown() {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);
    const [completedMissions, setCompletedMissions] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Target: Estimated 1 Ramadhan 1447H (Feb 18, 2026)
    const TARGET_DATE = new Date("2026-02-18T00:00:00+07:00");

    useEffect(() => {
        // Countdown Logic
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = TARGET_DATE.getTime() - now.getTime();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                };
            }
            return null;
        };
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);

        // Load Missions
        const saved = localStorage.getItem("ramadhan_missions");
        if (saved) setCompletedMissions(JSON.parse(saved));

        return () => clearInterval(timer);
    }, []);

    // Gamification Logic
    const toggleMission = (id: string) => {
        const next = completedMissions.includes(id)
            ? completedMissions.filter(m => m !== id)
            : [...completedMissions, id];

        setCompletedMissions(next);
        localStorage.setItem("ramadhan_missions", JSON.stringify(next));
    };

    const totalXP = MISSIONS.reduce((acc, m) => acc + m.xp, 0);
    const currentXP = completedMissions.reduce((acc, id) => {
        const m = MISSIONS.find(m => m.id === id);
        return acc + (m ? m.xp : 0);
    }, 0);
    const progress = Math.round((currentXP / totalXP) * 100);

    const getLevelTitle = (p: number) => {
        if (p === 100) return "Ramadhan Ready! 🌙";
        if (p >= 75) return "Pejuang Istiqomah";
        if (p >= 50) return "Siap Melangkah";
        if (p >= 25) return "Niat Terpasang";
        return "Newbie Ramadhan";
    };

    if (!timeLeft) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="w-full relative mb-6 group cursor-pointer active:scale-[0.99] transition-transform">
                    {/* Background with Gold/Emerald Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600/30 via-emerald-900/40 to-black rounded-3xl blur-md -z-10 group-hover:blur-lg transition-all duration-700 opacity-70" />

                    <div className="relative w-full bg-black/40 backdrop-blur-md border border-amber-500/20 rounded-3xl p-6 flex flex-col justify-between overflow-hidden">
                        {/* Decorative Accent */}
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col gap-1 z-10">
                                <div className="flex items-center gap-2 text-amber-400 mb-1">
                                    <Moon className="w-4 h-4 fill-amber-400/20" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Menuju Ramadhan</span>
                                </div>
                                <h3 className="text-2xl font-serif text-white font-medium">
                                    1447 H
                                </h3>
                            </div>

                            {/* Tap Hint */}
                            <div className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-full group-hover:bg-white/10 transition-colors">
                                <span>Misi</span>
                                <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>

                        {/* Countdown & Level Section */}
                        <div className="flex items-end justify-between z-10 text-white mt-2">
                            <div className="flex items-end gap-3">
                                <div className="flex flex-col items-center">
                                    <span className="text-3xl font-bold font-mono leading-none">{timeLeft.days}</span>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Hari</span>
                                </div>
                                <span className="text-2xl font-light text-white/20 pb-4">:</span>
                                <div className="flex flex-col items-center">
                                    <span className="text-3xl font-bold font-mono leading-none">{timeLeft.hours}</span>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Jam</span>
                                </div>
                            </div>

                            {/* Mini Progress Circle */}
                            <div className="flex flex-col items-end gap-1">
                                <div className="text-xs font-bold text-amber-400/90">{getLevelTitle(progress)}</div>
                                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="text-[10px] text-white/40">{progress}% Siap</div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogTrigger>

            {/* Mission Board Modal */}
            <DialogContent className="w-[90%] max-w-sm max-h-[80vh] overflow-y-auto rounded-[24px] border-amber-500/20 bg-black/95 backdrop-blur-xl text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-serif">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        Persiapan Ramadhan
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Header Progress */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-white/60">Level Anda</span>
                            <span className="text-sm font-bold text-amber-400">{getLevelTitle(progress)}</span>
                        </div>
                        <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden mb-1">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-center text-white/40 mt-2">Selesaikan misi di bawah untuk menaikkan level.</p>
                    </div>

                    {/* Missions List */}
                    <div className="space-y-3">
                        {MISSIONS.map((mission) => {
                            const isDone = completedMissions.includes(mission.id);
                            return (
                                <div
                                    key={mission.id}
                                    onClick={() => toggleMission(mission.id)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer active:scale-95",
                                        isDone
                                            ? "bg-emerald-500/10 border-emerald-500/30"
                                            : "bg-white/5 border-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className={cn("font-medium text-sm", isDone ? "text-emerald-400 line-through decoration-emerald-500/50" : "text-white")}>
                                            {mission.title}
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50">{mission.category}</span>
                                            <span className="text-[10px] text-amber-400/80">+{mission.xp} XP</span>
                                        </div>
                                    </div>

                                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors",
                                        isDone ? "bg-emerald-500 border-emerald-500" : "border-white/20"
                                    )}>
                                        {isDone && <CheckCircle2 className="w-4 h-4 text-black" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
