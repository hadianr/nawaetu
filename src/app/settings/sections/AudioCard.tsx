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

import { useState, useRef, useEffect } from "react";
import { Headphones, Volume2, Pause, Play, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MUADZIN_OPTIONS } from "@/data/settings-data";

interface AudioCardProps {
    t: any;
    isDaylight: boolean;
    muadzin: string;
    onMuadzinChange: (value: string) => void;
}

export default function AudioCard({ t, isDaylight, muadzin, onMuadzinChange }: AudioCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const audioRequestRef = useRef(0);
    const isMountedRef = useRef(true);

    const currentMuadzin = MUADZIN_OPTIONS.find(m => m.id === muadzin);

    const stopCurrentAudio = (bumpRequest: boolean = true) => {
        if (bumpRequest) {
            audioRequestRef.current += 1;
        }

        if (audio) {
            audio.onended = null;
            audio.onerror = null;
            audio.pause();
            audio.src = "";
            setAudio(null);
        }
        if (!isMountedRef.current) return;
        setIsPlaying(false);
        setPlayingId(null);
        setIsLoading(false);
    };

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        return () => {
            if (audio) {
                audio.onended = null;
                audio.onerror = null;
                audio.pause();
                audio.src = "";
            }
        };
    }, [audio]);

    const toggleAudioPreview = (id: string) => {
        if (playingId === id && isPlaying) {
            stopCurrentAudio();
            return;
        }

        stopCurrentAudio(false);
        setIsLoading(true);
        setPlayingId(id);

        const selectedMuadzin = MUADZIN_OPTIONS.find(m => m.id === id);
        if (!selectedMuadzin || !selectedMuadzin.audio_url) {
            stopCurrentAudio();
            return;
        }
        const audioUrl = selectedMuadzin.audio_url;

        const requestId = audioRequestRef.current + 1;
        audioRequestRef.current = requestId;

        const newAudio = new Audio(audioUrl);
        newAudio.preload = "auto";

        let loadingTimeout: ReturnType<typeof setTimeout> | null = null;
        const clearLoadingTimeout = () => {
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
                loadingTimeout = null;
            }
        };

        loadingTimeout = setTimeout(() => {
            if (audioRequestRef.current !== requestId) return;
            if (!isMountedRef.current) return;
            setIsLoading(false);
        }, 4000);

        const markPlayable = () => {
            if (audioRequestRef.current !== requestId) return;
            if (!isMountedRef.current) return;
            clearLoadingTimeout();
            setIsLoading(false);
        };

        const markPlaying = () => {
            if (audioRequestRef.current !== requestId) return;
            if (!isMountedRef.current) return;
            clearLoadingTimeout();
            setIsLoading(false);
            setIsPlaying(true);
        };

        newAudio.onloadeddata = markPlayable;
        newAudio.oncanplay = markPlayable;
        newAudio.onplaying = markPlaying;
        newAudio.onplay = markPlaying;

        newAudio.oncanplaythrough = () => {
            if (audioRequestRef.current !== requestId) return;
            if (!isMountedRef.current) return;
            clearLoadingTimeout();
            setIsLoading(false);
            const playPromise = newAudio.play();
            if (playPromise) {
                playPromise.catch(err => {
                    const message = err instanceof Error ? err.message : "";
                    if (err?.name === "AbortError" || message.includes("interrupted by a call to pause")) {
                        return;
                    }
                    if (!isMountedRef.current) return;
                    setIsPlaying(false);
                    setIsLoading(false);
                });
            }
        };

        newAudio.onpause = () => {
            if (audioRequestRef.current !== requestId) return;
            if (!isMountedRef.current) return;
            setIsPlaying(false);
        };

        newAudio.onended = () => {
            if (audioRequestRef.current !== requestId) return;
            if (!isMountedRef.current) return;
            clearLoadingTimeout();
            setIsPlaying(false);
            setPlayingId(null);
        };

        newAudio.onerror = () => {
            if (audioRequestRef.current !== requestId) return;
            if (!isMountedRef.current) return;
            clearLoadingTimeout();
            setIsLoading(false);
            setIsPlaying(false);
            setPlayingId(null);
            if (newAudio.src) {
                alert("Gagal memutar pratinjau suara.");
            }
        };

        newAudio.load();
        setAudio(newAudio);
    };

    const handleMuadzinChange = (value: string) => {
        stopCurrentAudio();
        onMuadzinChange(value);
    };

    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4 mb-6">
            <div className="flex items-center gap-2 text-[rgb(var(--color-primary-light))]">
                <Headphones className="w-4 h-4" />
                <span className="text-sm font-semibold text-white">{t.audioTitle}</span>
            </div>

            <div className="space-y-3">
                <div className={cn(
                    "relative group border rounded-xl p-3 flex items-center justify-between transition-all",
                    isDaylight
                        ? "bg-white/40 border-slate-200/50 hover:bg-white/60 shadow-sm"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                )}>
                    <div className="flex items-center gap-3 flex-1 min-w-0 pointer-events-none">
                        <div className={cn(
                            "p-2 rounded-full shrink-0",
                            isDaylight ? "bg-emerald-50" : "bg-[rgb(var(--color-primary))]/10"
                        )}>
                            <Volume2 className={cn(
                                "w-4 h-4",
                                isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]"
                            )} />
                        </div>
                        <div className="min-w-0">
                            <p className={cn(
                                "text-[10px] uppercase tracking-wider font-bold mb-0.5",
                                isDaylight ? "text-slate-400" : "text-white/40"
                            )}>{t.muadzinLabel}</p>
                            <p className={cn(
                                "text-sm font-medium truncate",
                                isDaylight ? "text-slate-900" : "text-white"
                            )}>{currentMuadzin?.label || "Makkah"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 rounded-full shrink-0 transition-all duration-300 relative z-20 border flex items-center justify-center",
                                isPlaying && playingId === muadzin
                                    ? isDaylight
                                        ? "bg-emerald-100 border-emerald-200 text-emerald-600 scale-110 shadow-sm"
                                        : "bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] border-[rgb(var(--color-primary))]/30 scale-110"
                                    : isDaylight
                                        ? "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600 hover:border-slate-300"
                                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-105"
                            )}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleAudioPreview(muadzin);
                            }}
                            disabled={isLoading || !currentMuadzin?.audio_url}
                        >
                            {isLoading && playingId === muadzin ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : isPlaying && playingId === muadzin ? (
                                <Pause className="w-3 h-3 fill-current" />
                            ) : (
                                <Play className="w-3 h-3 ml-0.5" />
                            )}
                        </Button>
                        <ChevronDown className="w-4 h-4 text-white/30 group-hover:text-[rgb(var(--color-primary-light))] transition-colors" />
                    </div>

                    <Select value={muadzin} onValueChange={handleMuadzinChange}>
                        <SelectTrigger className="w-full h-full absolute inset-0 opacity-0 cursor-pointer [&>svg]:hidden z-10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                            {MUADZIN_OPTIONS.map((option) => (
                                <SelectItem key={option.id} value={option.id} className="text-white text-xs hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer transition-colors">
                                    <span>{option.label}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
