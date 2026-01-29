"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RotateCcw, Volume2, VolumeX, Smartphone, Settings2, Check, Flame, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addXP } from "@/lib/leveling";

const playTick = (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 800;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
};

const ZIKIR_PRESETS = [
    { label: "Tasbih", arab: "سُبْحَانَ ٱللَّٰهِ", latin: "Subhanallah", tadabbur: "Maha Suci Allah dari segala kekurangan.", target: 33 },
    { label: "Tahmid", arab: "ٱلْحَمْدُ لِلَّٰهِ", latin: "Alhamdulillah", tadabbur: "Segala puji bagi Allah atas segala nikmat.", target: 33 },
    { label: "Takbir", arab: "ٱللَّٰهُ أَكْبَرُ", latin: "Allahu Akbar", tadabbur: "Allah Maha Besar.", target: 33 },
    { label: "Istighfar", arab: "أَسْتَغْفِرُ ٱللَّٰهَ", latin: "Astaghfirullah", tadabbur: "Aku memohon ampunan kepada Allah SWT.", target: 100 },
    { label: "Sholawat Jibril", arab: "صَلَّى ٱللَّٰهُ عَلَىٰ مُحَمَّدٍ", latin: "Shallallahu 'ala Muhammad", tadabbur: "Semoga Allah melimpahkan rahmat kepada Nabi Muhammad.", target: 1000 },
];

export default function TasbihCounter() {
    const [count, setCount] = useState(0);
    const [target, setTarget] = useState<number | null>(33);
    const [activeZikir, setActiveZikir] = useState<typeof ZIKIR_PRESETS[0] | null>(ZIKIR_PRESETS[0]);
    const [feedbackMode, setFeedbackMode] = useState<'vibrate' | 'sound' | 'both' | 'none'>('vibrate');
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dailyCount, setDailyCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [lastZikirDate, setLastZikirDate] = useState<string>("");
    const [showReward, setShowReward] = useState(false);

    useEffect(() => {
        const savedCount = localStorage.getItem("tasbih_count");
        if (savedCount) setCount(parseInt(savedCount));
        const savedTarget = localStorage.getItem("tasbih_target");
        if (savedTarget) setTarget(savedTarget === "inf" ? null : parseInt(savedTarget));
        const savedZikir = localStorage.getItem("tasbih_zikir_label");
        if (savedZikir) {
            const found = ZIKIR_PRESETS.find(z => z.label === savedZikir);
            if (found) setActiveZikir(found);
        }
        const savedDaily = localStorage.getItem("tasbih_daily_count");
        if (savedDaily) setDailyCount(parseInt(savedDaily));
        const savedStreak = localStorage.getItem("tasbih_streak");
        if (savedStreak) setStreak(parseInt(savedStreak));
        const savedDate = localStorage.getItem("tasbih_last_date");
        const today = new Date().toISOString().split('T')[0];
        if (savedDate) {
            setLastZikirDate(savedDate);
            if (savedDate !== today) {
                setDailyCount(0);
                const last = new Date(savedDate);
                const curr = new Date(today);
                const diffTime = Math.abs(curr.getTime() - last.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 1) setStreak(0);
            }
        } else {
            setLastZikirDate(today);
        }
    }, []);

    useEffect(() => { localStorage.setItem("tasbih_count", count.toString()); }, [count]);
    useEffect(() => { localStorage.setItem("tasbih_target", target ? target.toString() : "inf"); }, [target]);
    useEffect(() => { if (activeZikir) localStorage.setItem("tasbih_zikir_label", activeZikir.label); }, [activeZikir]);
    useEffect(() => { localStorage.setItem("tasbih_daily_count", dailyCount.toString()); }, [dailyCount]);
    useEffect(() => { localStorage.setItem("tasbih_streak", streak.toString()); }, [streak]);
    useEffect(() => { if (lastZikirDate) localStorage.setItem("tasbih_last_date", lastZikirDate); }, [lastZikirDate]);

    const initAudio = () => {
        if (!audioContext && typeof window !== "undefined") {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                const ctx = new AudioCtx();
                setAudioContext(ctx);
                return ctx;
            }
        }
        return audioContext;
    };

    useEffect(() => {
        if (target && count === target) {
            setTimeout(() => {
                addXP(50);
                setShowReward(true);
                if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200]);
            }, 100);
        }
    }, [count, target]);

    const handleIncrement = () => {
        let ctx = audioContext;
        if (!ctx) ctx = initAudio();
        if (ctx && ctx.state === 'suspended') ctx.resume();

        const today = new Date().toISOString().split('T')[0];
        if (lastZikirDate !== today) {
            setDailyCount(1);
            setLastZikirDate(today);
            const last = new Date(lastZikirDate);
            const curr = new Date(today);
            const diffDays = Math.ceil(Math.abs(curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) setStreak(prev => prev + 1);
            else setStreak(1);
        } else {
            setDailyCount(prev => prev + 1);
            if (streak === 0) setStreak(1);
        }

        if ((feedbackMode === 'vibrate' || feedbackMode === 'both') && typeof navigator !== "undefined" && navigator.vibrate) {
            if (!target || count + 1 !== target) navigator.vibrate(50);
        }
        if ((feedbackMode === 'sound' || feedbackMode === 'both') && ctx) playTick(ctx);

        setCount(prev => (target && prev + 1 > target) ? 1 : prev + 1);
    };

    const handleReset = () => { if (confirm("Reset hitungan?")) setCount(0); };
    const toggleFeedback = () => {
        const modes: ('vibrate' | 'sound' | 'both' | 'none')[] = ['vibrate', 'sound', 'both', 'none'];
        setFeedbackMode(modes[(modes.indexOf(feedbackMode) + 1) % modes.length]);
    };
    const handlePresetSelect = (preset: typeof ZIKIR_PRESETS[0]) => {
        setTarget(preset.target);
        setActiveZikir(preset);
        setCount(0);
        setIsDialogOpen(false);
    };

    const FeedbackIcon = { vibrate: Smartphone, sound: Volume2, both: Volume2, none: VolumeX }[feedbackMode] || Smartphone;
    const progress = target ? (count / target) * 100 : 0;

    return (
        <div className="flex flex-col items-center w-full h-full relative px-4 pb-[100px] pt-4 overflow-hidden">

            {/* Tap Area Overlay */}
            <div className="absolute inset-0 z-0 cursor-pointer active:bg-white/5 transition-colors" onClick={handleIncrement} />

            {/* Top: Branding + Zikir Text */}
            <div className="w-full text-center z-10 pointer-events-none mt-1 xs:mt-6 shrink-0">
                <div className="mb-0.5 xs:mb-2">
                    <h1 className="text-lg xs:text-xl font-bold tracking-tight text-white/90 leading-tight">Tasbih Digital</h1>
                    <p className="text-[9px] xs:text-[10px] text-white/40 uppercase tracking-[0.2em]">Zikir Penenang Hati</p>
                </div>

                {activeZikir ? (
                    <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-2 duration-500 pb-0.5 xs:pb-2">
                        <div className="px-4 pt-4 xs:pt-20 pb-0.5 xs:pb-1"> {/* Fills taller screens (390px+ width often = 800px+ height) */}
                            <h2 className="text-2xl xs:text-5xl font-bold text-white drop-shadow-2xl font-serif leading-none">
                                {activeZikir.arab}
                            </h2>
                        </div>
                        <div className="mt-1 xs:mt-3 flex flex-col items-center">
                            <p className="text-[rgb(var(--color-primary-light))] font-extrabold text-[10px] xs:text-base tracking-tight uppercase">
                                {activeZikir.latin}
                            </p>
                            <p className="text-white/40 text-[8px] xs:text-xs italic line-clamp-2 max-w-[90%] mt-0.5 xs:mt-1.5">
                                {activeZikir.tadabbur}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-white/20 text-[10px] italic">Mode Bebas</p>
                )}
            </div>

            {/* Middle: Digital Counter - Responsive Size */}
            <div className="flex-1 flex items-center justify-center w-full pointer-events-none min-h-0 py-0.5 xs:py-10">
                {/* Balanced Size: SE (375px) = w-52 (208px) fill space. Modern iPhones (390px+, xs) = w-64. Large Desktop = w-80 */}
                <div className="relative w-52 h-52 xs:w-64 xs:h-64 md:w-64 md:h-64 lg:w-80 lg:h-80 flex items-center justify-center pointer-events-auto shadow-[0_0_60px_rgba(0,0,0,0.6)] rounded-full transition-all duration-300">
                    <div className="absolute inset-[-10px] rounded-full blur-3xl bg-[rgb(var(--color-primary)/0.08)] transition-all duration-700" />

                    <div className="absolute inset-0 rounded-full border-[6px] md:border-[12px] border-white/5" />

                    {target && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50" cy="50" r="46.5"
                                fill="transparent"
                                stroke="rgb(var(--color-primary))"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray="292"
                                strokeDashoffset={292 - (292 * progress) / 100}
                                className="transition-all duration-300 ease-out"
                            />
                        </svg>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); handleIncrement(); }}
                        className="absolute inset-1.5 md:inset-4 rounded-full bg-gradient-to-br from-[rgb(var(--color-primary-dark)/0.4)] to-black border border-[rgb(var(--color-primary)/0.15)] active:scale-95 transition-transform duration-75 flex flex-col items-center justify-center group z-20 shadow-xl"
                    >
                        <span className="text-white/30 text-[7px] md:text-xs font-bold tracking-widest uppercase mb-0.5 xs:mb-1.5">
                            {activeZikir ? activeZikir.label : "Counter"}
                        </span>
                        <span className="text-7xl xs:text-8xl md:text-9xl font-mono font-bold text-white tracking-tighter drop-shadow-2xl">
                            {count}
                        </span>
                        <div className="mt-1 text-[rgb(var(--color-primary))]/40 text-[8px] md:text-sm animate-pulse">
                            Tap
                        </div>
                    </button>
                </div>
            </div>

            {/* Bottom Section: Stats & Controls - Fixed at Bottom clear of Nav */}
            <div className="w-full shrink-0 flex flex-col items-center z-10 pt-2 pb-2">

                {/* Stats Bar */}
                <div className="flex justify-center gap-3 text-white/30 text-[9px] font-bold uppercase tracking-widest mb-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                        <CalendarDays className="h-3.5 w-3.5 text-[rgb(var(--color-primary-light)/0.4)]" />
                        <span>HARI INI: <span className="text-white">{dailyCount}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                        <Flame className="h-3.5 w-3.5 text-orange-500/60" />
                        <span>STREAK: <span className="text-white">{streak}</span> HARI</span>
                    </div>
                </div>

                {/* Control Grid */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] pointer-events-auto px-2">
                    <Button
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); handleReset(); }}
                        className="flex flex-col h-auto py-3 gap-1 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5"
                    >
                        <RotateCcw className="h-4 w-4 text-white/60" />
                        <span className="text-[10px] text-white/40 font-medium">Reset</span>
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                onClick={(e) => e.stopPropagation()}
                                className="flex flex-col h-auto py-3 gap-1 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5"
                            >
                                <Settings2 className="h-4 w-4 text-white/60" />
                                <span className="text-[10px] text-white/40 font-medium">Doa</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[90%] max-w-sm rounded-[32px] border-white/10 bg-neutral-950/98 backdrop-blur-3xl text-white">
                            <DialogHeader>
                                <DialogTitle className="text-center text-sm font-bold uppercase tracking-widest opacity-40">Daftar Bacaan</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col gap-2 py-4">
                                {ZIKIR_PRESETS.map((p) => (
                                    <Button
                                        key={p.label}
                                        variant="outline"
                                        onClick={() => handlePresetSelect(p)}
                                        className={cn(
                                            "justify-between h-auto py-3 px-4 border-white/5 bg-white/5 rounded-2xl",
                                            activeZikir?.label === p.label && "bg-[rgb(var(--color-primary)/0.15)] border-[rgb(var(--color-primary)/0.3)] shadow-[inset_0_0_12px_rgba(var(--color-primary),0.05)]"
                                        )}
                                    >
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-bold text-sm">{p.label}</span>
                                            <span className="text-[10px] text-white/30">{p.latin}</span>
                                        </div>
                                        <span className="text-[10px] font-mono opacity-20">{p.target}x</span>
                                    </Button>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); toggleFeedback(); }}
                        className={cn(
                            "flex flex-col h-auto py-3 gap-1 rounded-2xl border transition-all",
                            feedbackMode !== 'none' ? "bg-[rgb(var(--color-primary)/0.15)] text-[rgb(var(--color-primary-light))] border-[rgb(var(--color-primary)/0.25)]" : "bg-white/5 text-white/40 border-white/5"
                        )}
                    >
                        <FeedbackIcon className="h-4 w-4" />
                        <span className="text-[10px] font-medium uppercase tracking-tighter">
                            {feedbackMode === 'vibrate' ? "Getar" : feedbackMode === 'sound' ? "Suara" : feedbackMode === 'both' ? "Dual" : "Mute"}
                        </span>
                    </Button>
                </div>
            </div>

            {/* Achievement Layer */}
            <Dialog open={showReward} onOpenChange={setShowReward}>
                <DialogContent className="w-[85%] max-w-[280px] rounded-[32px] bg-neutral-900/95 border-[rgb(var(--color-primary)/0.2)] text-white backdrop-blur-2xl flex flex-col items-center p-5 md:p-6 text-center [&>button.absolute]:hidden shadow-2xl">
                    <DialogHeader className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-[rgb(var(--color-primary)/0.1)] flex items-center justify-center mb-4 border border-[rgb(var(--color-primary)/0.2)]">
                            <Check className="w-7 h-7 text-[rgb(var(--color-primary-light))]" />
                        </div>
                        <DialogTitle className="text-xl font-bold mb-1">Alhamdulillah!</DialogTitle>
                    </DialogHeader>
                    <p className="text-white/40 text-[13px] mb-6 px-2 leading-relaxed">Target {target}x tercapai dengan baik.</p>

                    <div className="flex flex-row items-stretch gap-2.5 w-full">
                        {(() => {
                            const currentIndex = activeZikir ? ZIKIR_PRESETS.findIndex(z => z.label === activeZikir.label) : -1;
                            const nextZikir = currentIndex !== -1 && currentIndex < ZIKIR_PRESETS.length - 1
                                ? ZIKIR_PRESETS[currentIndex + 1]
                                : null;

                            return (
                                <>
                                    {nextZikir ? (
                                        <>
                                            <Button
                                                onClick={() => {
                                                    handlePresetSelect(nextZikir);
                                                    setShowReward(false);
                                                }}
                                                className="flex-[1.5] bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-light))] text-white font-bold h-11 rounded-xl flex flex-col items-center justify-center p-0"
                                            >
                                                <span className="text-[7px] opacity-70 uppercase tracking-widest mb-0.5">Lanjut ke</span>
                                                <span className="text-xs">{nextZikir.label}</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => { setCount(0); setShowReward(false); }}
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 h-11 rounded-xl flex flex-row items-center justify-center gap-1.5 px-3"
                                            >
                                                <RotateCcw className="h-3 w-3 opacity-70" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider">Ulangi</span>
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={() => { setCount(0); setShowReward(false); }}
                                            className="bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-light))] text-white font-bold h-11 rounded-xl w-full"
                                        >
                                            Ulangi Bacaan
                                        </Button>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
