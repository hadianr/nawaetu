"use client";

import { useState, useEffect, useMemo } from "react";
import { RotateCcw, Volume2, VolumeX, Smartphone, Settings2, Check, Flame, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addXP } from "@/lib/leveling";
import { useLocale } from "@/context/LocaleContext";
import { useTasbihPersistence } from "@/hooks/useTasbihPersistence";

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

type ZikirPreset = {
    id: string;
    label: string;
    arab: string;
    latin: string;
    tadabbur: string;
    target: number;
};

export default function TasbihCounter() {
    const { t } = useLocale();
    const zikirPresets = useMemo<ZikirPreset[]>(
        () => [
            {
                id: "tasbih",
                label: t.tasbihPresetTasbihLabel,
                arab: "سُبْحَانَ ٱللَّٰهِ",
                latin: t.tasbihPresetTasbihLatin,
                tadabbur: t.tasbihPresetTasbihTadabbur,
                target: 33
            },
            {
                id: "tahmid",
                label: t.tasbihPresetTahmidLabel,
                arab: "ٱلْحَمْدُ لِلَّٰهِ",
                latin: t.tasbihPresetTahmidLatin,
                tadabbur: t.tasbihPresetTahmidTadabbur,
                target: 33
            },
            {
                id: "takbir",
                label: t.tasbihPresetTakbirLabel,
                arab: "ٱللَّٰهُ أَكْبَرُ",
                latin: t.tasbihPresetTakbirLatin,
                tadabbur: t.tasbihPresetTakbirTadabbur,
                target: 33
            },
            {
                id: "istighfar",
                label: t.tasbihPresetIstighfarLabel,
                arab: "أَسْتَغْفِرُ ٱللَّٰهَ",
                latin: t.tasbihPresetIstighfarLatin,
                tadabbur: t.tasbihPresetIstighfarTadabbur,
                target: 100
            },
            {
                id: "sholawat_jibril",
                label: t.tasbihPresetSholawatJibrilLabel,
                arab: "صَلَّى ٱللَّٰهُ عَلَىٰ مُحَمَّدٍ",
                latin: t.tasbihPresetSholawatJibrilLatin,
                tadabbur: t.tasbihPresetSholawatJibrilTadabbur,
                target: 1000
            }
        ],
        [t]
    );
    const [feedbackMode, setFeedbackMode] = useState<'vibrate' | 'sound' | 'both' | 'none'>('vibrate');
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showReward, setShowReward] = useState(false);
    const { state: tasbihState, updateState, hasHydrated } = useTasbihPersistence({
        defaultActiveId: zikirPresets[0]?.id ?? "tasbih",
        validActiveIds: zikirPresets.map((preset) => preset.id),
        defaultTarget: 33
    });
    const { count, target, activeZikirId, dailyCount, streak, lastZikirDate } = tasbihState;
    const activeZikir = zikirPresets.find((zikir) => zikir.id === activeZikirId) || null;

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
        let newDailyCount = dailyCount;
        let newStreak = streak;
        let newLastDate = lastZikirDate;

        if (lastZikirDate !== today) {
            newDailyCount = 1;
            newLastDate = today;
            const last = new Date(lastZikirDate);
            const curr = new Date(today);
            const diffDays = Math.ceil(Math.abs(curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) newStreak = streak + 1;
            else newStreak = 1;
        } else {
            newDailyCount = dailyCount + 1;
            if (streak === 0) newStreak = 1;
        }

        if ((feedbackMode === 'vibrate' || feedbackMode === 'both') && typeof navigator !== "undefined" && navigator.vibrate) {
            if (!target || count + 1 !== target) navigator.vibrate(50);
        }
        if ((feedbackMode === 'sound' || feedbackMode === 'both') && ctx) playTick(ctx);

        // Calculate new count and save immediately
        const newCount = (target && count + 1 > target) ? 1 : count + 1;
        updateState({
            count: newCount,
            dailyCount: newDailyCount,
            streak: newStreak,
            lastZikirDate: newLastDate
        });
    };

    const handleReset = () => { 
        if (confirm(t.tasbihResetConfirm)) {
            updateState({ count: 0 });
        }
    };
    
    const toggleFeedback = () => {
        const modes: ('vibrate' | 'sound' | 'both' | 'none')[] = ['vibrate', 'sound', 'both', 'none'];
        setFeedbackMode(modes[(modes.indexOf(feedbackMode) + 1) % modes.length]);
    };
    
    const handlePresetSelect = (preset: ZikirPreset) => {
        // Save preset and reset count immediately
        updateState({
            target: preset.target,
            activeZikirId: preset.id,
            count: 0
        });
        setIsDialogOpen(false);
    };

    const FeedbackIcon = { vibrate: Smartphone, sound: Volume2, both: Volume2, none: VolumeX }[feedbackMode] || Smartphone;
    const progress = target && hasHydrated ? (count / target) * 100 : 0;

    return (
        <div className="flex flex-col items-center w-full h-full relative px-4 pb-nav pt-4 overflow-hidden">

            {/* Tap Area Overlay */}
            <div className="absolute inset-0 z-0 cursor-pointer active:bg-white/5 transition-colors" onClick={handleIncrement} />

            {/* Top: Branding + Zikir Text */}
            <div className="w-full text-center z-10 pointer-events-none mt-1 xs:mt-6 shrink-0">
                <div className="mb-0.5 xs:mb-2">
                    <h1 className="text-lg xs:text-xl font-bold tracking-tight text-white/90 leading-tight">{t.tasbihTitle}</h1>
                    <p className="text-[9px] xs:text-[10px] text-white/40 uppercase tracking-[0.2em]">{t.tasbihSubtitle}</p>
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
                    <p className="text-white/20 text-[10px] italic">{t.tasbihFreeMode}</p>
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
                            {activeZikir ? activeZikir.label : t.tasbihCounterLabel}
                        </span>
                        <span className="text-7xl xs:text-8xl md:text-9xl font-mono font-bold text-white tracking-tighter drop-shadow-2xl">
                            {hasHydrated ? (
                                count
                            ) : (
                                <span className="inline-block w-12 xs:w-16 md:w-20 h-10 xs:h-12 md:h-14 rounded bg-white/10 animate-pulse align-middle" />
                            )}
                        </span>
                        <div className="mt-1 text-[rgb(var(--color-primary))]/40 text-[8px] md:text-sm animate-pulse">
                            {t.tasbihTap}
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
                        <span>
                            {t.tasbihDaily}:{" "}
                            <span className="text-white">
                                {hasHydrated ? (isNaN(dailyCount) ? 0 : dailyCount) : "--"}
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                        <Flame className="h-3.5 w-3.5 text-[rgb(var(--color-accent))]/70" />
                        <span>
                            {t.tasbihStreak}:{" "}
                            <span className="text-white">
                                {hasHydrated ? (isNaN(streak) ? 0 : streak) : "--"}
                            </span>{" "}
                            {t.tasbihDays}
                        </span>
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
                        <span className="text-[10px] text-white/40 font-medium">{t.tasbihReset}</span>
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                onClick={(e) => e.stopPropagation()}
                                className="flex flex-col h-auto py-3 gap-1 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5"
                            >
                                <Settings2 className="h-4 w-4 text-white/60" />
                                <span className="text-[10px] text-white/40 font-medium">{t.tasbihSelectZikir}</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[90%] max-w-sm rounded-[32px] border-white/10 bg-neutral-950/98 backdrop-blur-3xl text-white">
                            <DialogHeader>
                                <DialogTitle className="text-center text-sm font-bold uppercase tracking-widest opacity-40">{t.tasbihListTitle}</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col gap-2 py-4">
                                {zikirPresets.map((p) => (
                                    <Button
                                        key={p.id}
                                        variant="outline"
                                        onClick={() => handlePresetSelect(p)}
                                        className={cn(
                                            "justify-between h-auto py-3 px-4 border-white/5 bg-white/5 rounded-2xl",
                                            activeZikir?.id === p.id && "bg-[rgb(var(--color-primary)/0.15)] border-[rgb(var(--color-primary)/0.3)] shadow-[inset_0_0_12px_rgba(var(--color-primary),0.05)]"
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
                            {feedbackMode === 'vibrate' ? t.tasbihVibrate : feedbackMode === 'sound' ? t.tasbihSound : feedbackMode === 'both' ? t.tasbihDual : t.tasbihMute}
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
                        <DialogTitle className="text-xl font-bold mb-1">{t.tasbihComplete}</DialogTitle>
                    </DialogHeader>
                    <p className="text-white/40 text-[13px] mb-6 px-2 leading-relaxed">{t.tasbihCompleteMessage}</p>

                    <div className="flex flex-row items-stretch gap-2.5 w-full">
                        {(() => {
                            const currentIndex = activeZikir ? zikirPresets.findIndex(z => z.id === activeZikir.id) : -1;
                            const nextZikir = currentIndex !== -1 && currentIndex < zikirPresets.length - 1
                                ? zikirPresets[currentIndex + 1]
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
                                                <span className="text-[7px] opacity-70 uppercase tracking-widest mb-0.5">{t.tasbihNextUp}</span>
                                                <span className="text-xs">{nextZikir.label}</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => { updateState({ count: 0 }); setShowReward(false); }}
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 h-11 rounded-xl flex flex-row items-center justify-center gap-1.5 px-3"
                                            >
                                                <RotateCcw className="h-3 w-3 opacity-70" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider">{t.tasbihRepeat}</span>
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={() => { updateState({ count: 0 }); setShowReward(false); }}
                                            className="bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-light))] text-white font-bold h-11 rounded-xl w-full"
                                        >
                                            {t.tasbihRepeatReading}
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
