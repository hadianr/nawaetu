"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RotateCcw, Volume2, VolumeX, Smartphone, Settings2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// Short "Pop" sound in Base64 (Reliable for mobile)
const CLICK_SOUND = "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" // Very short placeholder, will replace with better one below or generate short noise buffer. 
// Actually for reliable click without external assets, creating a BufferSource is better but if context failed previousy, let's use a real base64 of a short click.
// A short 'tick' sound.
const POP_SOUND = "data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzb21tcDQyAP/7UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAInfoAAAAjAAAAAwAABqwAAgMDCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLAAAABMYXZjNTguMTM0AAAAAAAAAAAAAAAAAAAAAP/7UmQAAAGkH6AAAAAAAAlwAAAAAP/7UmQAAAGkH6AAAAAAAAlwAAAAAP/7UmQAAAGkH6AAAAAAAAlwAAAAAP/7UmQAAAGkH6AAAAAAAAlwAAAAA="; // Placeholder logic is risky if invalid.

// Reliable "Tick" generator function using Audio context but with resume
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
    { label: "Tasbih", arab: "سُبْحَانَ ٱللَّٰهِ", latin: "Subhanallah", target: 33 },
    { label: "Tahmid", arab: "ٱلْحَمْدُ لِلَّٰهِ", latin: "Alhamdulillah", target: 33 },
    { label: "Takbir", arab: "ٱللَّٰهُ أَكْبَرُ", latin: "Allahu Akbar", target: 33 },
    { label: "Istighfar", arab: "أَسْتَغْفِرُ ٱللَّٰهَ", latin: "Astaghfirullah", target: 100 },
    { label: "Tahlil", arab: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", latin: "Laa ilaha illallah", target: 100 },
    { label: "Sholawat", arab: "ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", latin: "Allahumma sholli 'ala Muhammad", target: 1000 },
];

export default function TasbihCounter() {
    const [count, setCount] = useState(0);
    const [target, setTarget] = useState<number | null>(33);
    const [activeZikir, setActiveZikir] = useState<typeof ZIKIR_PRESETS[0] | null>(ZIKIR_PRESETS[0]);
    const [feedbackMode, setFeedbackMode] = useState<'vibrate' | 'sound' | 'both' | 'none'>('vibrate');
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Initial load
    useEffect(() => {
        const savedCount = localStorage.getItem("tasbih_count");
        if (savedCount) setCount(parseInt(savedCount));

        const savedTarget = localStorage.getItem("tasbih_target");
        if (savedTarget) setTarget(savedTarget === "inf" ? null : parseInt(savedTarget));

        const savedMode = localStorage.getItem("tasbih_feedback");
        if (savedMode) setFeedbackMode(savedMode as any);

        const savedZikirLabel = localStorage.getItem("tasbih_zikir_label");
        if (savedZikirLabel) {
            const found = ZIKIR_PRESETS.find(z => z.label === savedZikirLabel);
            if (found) setActiveZikir(found);
            else setActiveZikir(null); // Custom/Manual
        }
    }, []);

    // Persistence
    useEffect(() => { localStorage.setItem("tasbih_count", count.toString()); }, [count]);
    useEffect(() => { localStorage.setItem("tasbih_target", target ? target.toString() : "inf"); }, [target]);
    useEffect(() => { localStorage.setItem("tasbih_feedback", feedbackMode); }, [feedbackMode]);
    useEffect(() => {
        if (activeZikir) localStorage.setItem("tasbih_zikir_label", activeZikir.label);
        else localStorage.removeItem("tasbih_zikir_label");
    }, [activeZikir]);

    const initAudio = () => {
        if (!audioContext && typeof window !== "undefined") {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                setAudioContext(ctx);
                return ctx;
            }
        }
        return audioContext;
    };

    const handleIncrement = () => {
        let ctx = audioContext;
        if (!ctx) ctx = initAudio();
        if (ctx && ctx.state === 'suspended') ctx.resume();

        // Haptic Feedback
        const shouldVibrate = feedbackMode === 'vibrate' || feedbackMode === 'both';
        if (shouldVibrate && typeof navigator !== "undefined" && navigator.vibrate) {
            if (target && count + 1 === target) {
                navigator.vibrate([200, 100, 200]);
            } else {
                navigator.vibrate(50);
            }
        }

        // Sound Feedback
        const shouldSound = feedbackMode === 'sound' || feedbackMode === 'both';
        if (shouldSound && ctx) playTick(ctx);

        setCount(prev => {
            const next = prev + 1;
            if (target && next > target) return 1;
            return next;
        });
    };

    const handleReset = () => {
        if (confirm("Reset hitungan?")) setCount(0);
    };

    const toggleFeedback = () => {
        const modes: ('vibrate' | 'sound' | 'both' | 'none')[] = ['vibrate', 'sound', 'both', 'none'];
        const nextIndex = (modes.indexOf(feedbackMode) + 1) % modes.length;
        setFeedbackMode(modes[nextIndex]);
    };

    const handlePresetSelect = (preset: typeof ZIKIR_PRESETS[0]) => {
        setTarget(preset.target);
        setActiveZikir(preset);
        setCount(0);
        setIsDialogOpen(false);
    };

    const handleCustomTarget = (customTarget: number | null) => {
        setTarget(customTarget);
        setActiveZikir(null); // Clear preset
        setCount(0);
        setIsDialogOpen(false);
    };

    const getFeedbackIcon = () => {
        switch (feedbackMode) {
            case 'vibrate': return Smartphone;
            case 'sound': return Volume2;
            case 'both': return Volume2;
            case 'none': return VolumeX;
        }
    };

    const getFeedbackLabel = () => {
        switch (feedbackMode) {
            case 'vibrate': return "Getar";
            case 'sound': return "Suara";
            case 'both': return "Dual";
            case 'none': return "Mute";
        }
    };

    const progress = target ? (count / target) * 100 : 0;
    const FeedbackIcon = getFeedbackIcon();

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto min-h-[60vh] relative">

            {/* Full Screen Tap Area */}
            <div
                className="absolute inset-0 z-0 w-full h-[120%] -top-10 cursor-pointer active:bg-white/5 transition-colors"
                onClick={handleIncrement}
                aria-label="Tap to count"
            />

            {/* Zikir Text Display */}
            <div className="absolute top-0 z-10 w-full text-center px-4 pointer-events-none space-y-1 mt-4">
                {activeZikir ? (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg font-serif">{activeZikir.arab}</h2>
                        <p className="text-emerald-400 font-medium text-sm md:text-base tracking-wide">{activeZikir.latin}</p>
                    </div>
                ) : (
                    <p className="text-white/40 text-sm italic py-4">Mode Bebas</p>
                )}
            </div>

            {/* Display Area */}
            <div className="relative mb-12 flex flex-col items-center pointer-events-none mt-20">
                <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center pointer-events-auto">
                    <div className="absolute inset-0 rounded-full border-[12px] border-white/5" />

                    {target && (
                        <svg
                            className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                            viewBox="0 0 100 100"
                        >
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="transparent"
                                stroke="#10b981"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * progress) / 100}
                                className="transition-all duration-300 ease-out"
                            />
                        </svg>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); handleIncrement(); }}
                        className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-900/80 to-black border-4 border-emerald-500/20 active:scale-95 transition-transform duration-100 flex flex-col items-center justify-center group shadow-2xl z-10"
                    >
                        <span className="text-white/40 text-sm font-medium tracking-widest uppercase mb-2">
                            {activeZikir ? activeZikir.label : (target ? `Target: ${target}` : "Tanpa Batas")}
                        </span>
                        <span className="text-7xl md:text-8xl font-mono font-bold text-white tracking-tighter drop-shadow-lg group-active:text-emerald-400 transition-colors">
                            {count}
                        </span>
                        <div className="mt-4 text-emerald-500/50 text-xs animate-pulse">
                            Tap di sini
                        </div>
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-3 gap-6 w-full px-8 relative z-20 pointer-events-auto">
                <Button
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                    className="flex flex-col h-auto py-3 gap-1 border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                >
                    <RotateCcw className="h-5 w-5" />
                    <span className="text-xs">Reset</span>
                </Button>

                {/* Zikir Selection Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            onClick={(e) => e.stopPropagation()}
                            className="flex flex-col h-auto py-3 gap-1 border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                        >
                            <Settings2 className="h-5 w-5" />
                            <span className="text-xs">Pilih Doa</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[90%] max-w-sm max-h-[80vh] overflow-y-auto rounded-[24px] border-white/10 bg-black/95 backdrop-blur-xl text-white">
                        <DialogHeader>
                            <DialogTitle className="text-center text-lg font-bold">Pilih Bacaan Zikir</DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col gap-2 py-4">
                            <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Preset Populer</p>
                            {ZIKIR_PRESETS.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="outline"
                                    onClick={() => handlePresetSelect(preset)}
                                    className={cn(
                                        "justify-between h-auto py-3 border-white/10 bg-transparent text-white hover:bg-emerald-500/20 hover:text-white hover:border-emerald-500/50",
                                        activeZikir?.label === preset.label && "bg-emerald-500/20 border-emerald-500/50"
                                    )}
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="font-semibold text-base">{preset.label}</span>
                                        <span className="text-xs text-white/50 font-normal">{preset.latin}</span>
                                    </div>
                                    <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white/70">
                                        {preset.target}x
                                    </span>
                                </Button>
                            ))}

                            <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 mt-4">Manual</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleCustomTarget(33)}
                                    className="border-white/10 bg-transparent text-white hover:bg-white/10"
                                >
                                    Target 33
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleCustomTarget(null)}
                                    className="border-white/10 bg-transparent text-white hover:bg-white/10"
                                >
                                    ∞ Tanpa Batas
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Button
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); toggleFeedback(); }}
                    className={cn(
                        "flex flex-col h-auto py-3 gap-1 border-white/10 hover:bg-white/10",
                        feedbackMode !== 'none' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-white/70"
                    )}
                >
                    <FeedbackIcon className="h-5 w-5" />
                    <span className="text-xs">{getFeedbackLabel()}</span>
                </Button>
            </div>

            {/* Simple spacer */}
            <div className="h-8"></div>
        </div>
    );
}
