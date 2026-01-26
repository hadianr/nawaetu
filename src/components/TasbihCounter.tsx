"use client";

import { useState, useEffect, useCallback } from "react";
import { RotateCcw, Volume2, VolumeX, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TasbihCounter() {
    const [count, setCount] = useState(0);
    const [target, setTarget] = useState<number | null>(33);
    const [useVibrate, setUseVibrate] = useState(true);
    const [useSound, setUseSound] = useState(false); // Default sound off for politeness
    const [history, setHistory] = useState<number[]>([]);

    // Effects
    useEffect(() => {
        const saved = localStorage.getItem("tasbih_count");
        if (saved) setCount(parseInt(saved));

        const savedTarget = localStorage.getItem("tasbih_target");
        if (savedTarget) setTarget(savedTarget === "inf" ? null : parseInt(savedTarget));
    }, []);

    useEffect(() => {
        localStorage.setItem("tasbih_count", count.toString());
    }, [count]);

    useEffect(() => {
        localStorage.setItem("tasbih_target", target ? target.toString() : "inf");
    }, [target]);

    const handleIncrement = useCallback(() => {
        // Haptic Feedback
        if (useVibrate && navigator.vibrate) {
            if (target && count + 1 === target) {
                // Distinct long vibration on target reached
                navigator.vibrate([100, 50, 100]);
            } else {
                navigator.vibrate(15); // Short tick
            }
        }

        // Sound Feedback (Simple click)
        if (useSound) {
            // Placeholder for sound logic if we had assets, for now just skip
        }

        setCount(prev => {
            const next = prev + 1;
            // Loop logic if target set
            if (target && next > target) {
                return 1;
            }
            return next;
        });
    }, [count, target, useVibrate, useSound]);

    const handleReset = () => {
        if (confirm("Reset hitungan?")) {
            setCount(0);
        }
    };

    const toggleTarget = () => {
        if (target === 33) setTarget(99);
        else if (target === 99) setTarget(null); // Infinity
        else setTarget(33);
    };

    const progress = target ? (count / target) * 100 : 0;

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto min-h-[60vh] relative">

            {/* Display Area */}
            <div className="relative mb-12 flex flex-col items-center">
                {/* Progress Ring (Visual Flair) */}
                <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
                    {/* Background Ring */}
                    <div className="absolute inset-0 rounded-full border-[12px] border-white/5" />

                    {/* Active Ring - SVG for precise control */}
                    {target && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="46%" // Roughly matches the border inset
                                fill="transparent"
                                stroke="#10b981" // Emerald-500
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray="289" // Circumference approx 2*PI*r
                                strokeDashoffset={289 - (289 * progress) / 100}
                                className="transition-all duration-300 ease-out"
                            />
                        </svg>
                    )}

                    {/* Main Button (The entire center is clickable) */}
                    <button
                        onClick={handleIncrement}
                        className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-900/80 to-black border-4 border-emerald-500/20 active:scale-95 transition-transform duration-100 flex flex-col items-center justify-center group shadow-2xl"
                    >
                        <span className="text-white/40 text-sm font-medium tracking-widest uppercase mb-2">
                            {target ? `Target: ${target}` : "Tanpa Batas"}
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
            <div className="grid grid-cols-3 gap-6 w-full px-8">
                <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex flex-col h-auto py-3 gap-1 border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                >
                    <RotateCcw className="h-5 w-5" />
                    <span className="text-xs">Reset</span>
                </Button>

                <Button
                    variant="outline"
                    onClick={toggleTarget}
                    className="flex flex-col h-auto py-3 gap-1 border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                >
                    <span className="text-lg font-bold">{target || "∞"}</span>
                    <span className="text-xs">Target</span>
                </Button>

                <Button
                    variant="outline"
                    onClick={() => setUseVibrate(!useVibrate)}
                    className={cn(
                        "flex flex-col h-auto py-3 gap-1 border-white/10 hover:bg-white/10",
                        useVibrate ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-white/70"
                    )}
                >
                    <Smartphone className="h-5 w-5" />
                    <span className="text-xs">Getar</span>
                </Button>
            </div>

            {/* Hint */}
            <p className="mt-12 text-white/30 text-xs text-center px-8 italic">
                "Subhanallah, Alhamdulillah, Allahu Akbar"
            </p>
        </div>
    );
}
