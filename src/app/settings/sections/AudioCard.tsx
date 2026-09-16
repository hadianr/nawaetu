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
    t: {
        audioTitle: string;
        muadzinLabel: string;
    };
    isDaylight: boolean;
    muadzin: string;
    onMuadzinChange: (value: string) => void;
}

export default function AudioCard({ t, isDaylight, muadzin, onMuadzinChange }: AudioCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioRequestRef = useRef(0);
    const isMountedRef = useRef(true);

    const currentMuadzin = MUADZIN_OPTIONS.find(m => m.id === muadzin);

    const stopCurrentAudio = (bumpRequest: boolean = true) => {
        if (bumpRequest) {
            audioRequestRef.current += 1;
        }

        if (audioRef.current) {
            audioRef.current.onended = null;
            audioRef.current.onerror = null;
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current = null;
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
            if (audioRef.current) {
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        };
    }, []);

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
        audioRef.current = newAudio;
    };

    const handleMuadzinChange = (value: string) => {
        stopCurrentAudio();
        onMuadzinChange(value);
    };

    return (
        <div className="bg-[rgb(var(--color-surface))]/70 border border-[rgb(var(--color-border))]/20 rounded-2xl p-4 space-y-4 mb-6">
            <div className="flex items-center gap-2 text-[rgb(var(--color-primary-light))]">
                <Headphones className="w-4 h-4" />
                <span className="text-sm font-semibold text-[rgb(var(--color-text-strong))]">{t.audioTitle}</span>
            </div>

            <div className="space-y-3">
                <div className={cn(
                    "relative group border rounded-xl p-3 flex items-center justify-between transition-all",
                    isDaylight
                        ? "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-subtle))] shadow-[var(--shadow-card)]"
                        : "bg-[rgb(var(--color-surface-subtle))]/60 border-[rgb(var(--color-border))]/20 hover:bg-[rgb(var(--color-surface-subtle))]"
                )}>
                    <div className="flex items-center gap-3 flex-1 min-w-0 pointer-events-none">
                        <div className={cn(
                            "p-2 rounded-full shrink-0",
                            isDaylight ? "bg-[rgb(var(--color-primary-light))]/45" : "bg-[rgb(var(--color-primary))]/10"
                        )}>
                            <Volume2 className={cn(
                                "w-4 h-4",
                                isDaylight ? "text-[rgb(var(--color-primary-strong))]" : "text-[rgb(var(--color-primary-light))]"
                            )} />
                        </div>
                        <div className="min-w-0">
                            <p className={cn(
                                "text-[10px] uppercase tracking-wider font-bold mb-0.5",
                                "text-[rgb(var(--color-text-muted))]"
                            )}>{t.muadzinLabel}</p>
                            <p className={cn(
                                "text-sm font-medium truncate",
                                "text-[rgb(var(--color-text-strong))]"
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
                                        ? "bg-[rgb(var(--color-primary-light))] border-[rgb(var(--color-primary))]/40 text-[rgb(var(--color-primary-strong))] scale-110 shadow-[var(--shadow-card)]"
                                        : "bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] border-[rgb(var(--color-primary))]/30 scale-110"
                                    : isDaylight
                                        ? "bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text-muted))] border-[rgb(var(--color-border))]/20 hover:bg-[rgb(var(--color-surface))] hover:text-[rgb(var(--color-text-strong))] hover:border-[rgb(var(--color-primary))]/30"
                                        : "bg-[rgb(var(--color-surface-subtle))]/60 text-[rgb(var(--color-text-muted))] border-[rgb(var(--color-border))]/20 hover:bg-[rgb(var(--color-surface-subtle))] hover:text-[rgb(var(--color-text-strong))] hover:border-[rgb(var(--color-primary))]/30 hover:scale-105"
                            )}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleAudioPreview(muadzin);
                            }}
                            disabled={isLoading || !currentMuadzin?.audio_url}
                        >
                            {isLoading && playingId === muadzin ? (
                                <div className="w-3 h-3 border-2 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin" />
                            ) : isPlaying && playingId === muadzin ? (
                                <Pause className="w-3 h-3 fill-current" />
                            ) : (
                                <Play className="w-3 h-3 ml-0.5" />
                            )}
                        </Button>
                        <ChevronDown className="w-4 h-4 text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-primary))] transition-colors" />
                    </div>

                    <Select value={muadzin} onValueChange={handleMuadzinChange}>
                        <SelectTrigger className="w-full h-full absolute inset-0 opacity-0 cursor-pointer [&>svg]:hidden z-10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]/20">
                            {MUADZIN_OPTIONS.map((option) => (
                                <SelectItem key={option.id} value={option.id} className="text-[rgb(var(--color-text))] text-xs hover:bg-[rgb(var(--color-surface-subtle))] focus:bg-[rgb(var(--color-surface-subtle))] focus:text-[rgb(var(--color-text-strong))] cursor-pointer transition-colors">
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
