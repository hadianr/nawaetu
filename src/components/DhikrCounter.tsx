"use client";

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

import { useState, useEffect, useMemo } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { dhikrCategories, dhikrSequences } from "@/data/dhikrLibrary";
import { addHasanah } from "@/lib/leveling";
import { dhikrMilestones } from "@/data/dhikrMilestones";
import { syncQueue } from "@/lib/sync-queue";
import { useLocale } from "@/context/LocaleContext";
import { useDhikrPersistence } from "@/hooks/useDhikrPersistence";
import { useTheme } from "@/context/ThemeContext";

import { DhikrPreset } from "./dhikr/types";
import { DhikrDisplay } from "./dhikr/DhikrDisplay";
import { DhikrHistory } from "./dhikr/DhikrHistory";
import { DhikrPresetSelector } from "./dhikr/DhikrPresetSelector";
import { DhikrControls } from "./dhikr/DhikrControls";
import { DhikrZenMode } from "./dhikr/DhikrZenMode";

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

export default function DhikrCounter() {
    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    const dhikrPresets = useMemo<DhikrPreset[]>(
        () => [
            { id: "tasbih", label: t.tasbihPresetTasbihLabel, arab: "سُبْحَانَ ٱللَّٰهِ", latin: t.tasbihPresetTasbihLatin, tadabbur: t.tasbihPresetTasbihTadabbur, target: 33 },
            { id: "tahmid", label: t.tasbihPresetTahmidLabel, arab: "ٱلْحَمْدُ لِلَّٰهِ", latin: t.tasbihPresetTahmidLatin, tadabbur: t.tasbihPresetTahmidTadabbur, target: 33 },
            { id: "takbir", label: t.tasbihPresetTakbirLabel, arab: "ٱللَّٰهُ أَكْبَرُ", latin: t.tasbihPresetTakbirLatin, tadabbur: t.tasbihPresetTakbirTadabbur, target: 33 },
            { id: "istighfar", label: t.tasbihPresetIstighfarLabel, arab: "أَسْتَغْفِرُ ٱللَّٰهَ", latin: t.tasbihPresetIstighfarLatin, tadabbur: t.tasbihPresetIstighfarTadabbur, target: 100 },
            { id: "sholawat_jibril", label: t.tasbihPresetSholawatJibrilLabel, arab: "صَلَّى ٱللَّٰهُ عَلَىٰ مُحَمَّدٍ", latin: t.tasbihPresetSholawatJibrilLatin, tadabbur: t.tasbihPresetSholawatJibrilTadabbur, target: 1000 },
            { id: "tahlil", label: "Tahlil", arab: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", latin: "Laa ilaaha illallaah", tadabbur: "Tiada Tuhan selain Allah.", target: 100 },
            { id: "hawqalah", label: "Hawqalah", arab: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ", latin: "Laa hawla wa laa quwwata illaa billaah", tadabbur: "Tiada daya dan upaya kecuali dengan pertolongan Allah.", target: 100 }
        ],
        [t]
    );

    const libraryPresets = useMemo(() => dhikrCategories.flatMap(c => c.items), []);

    const [feedbackMode, setFeedbackMode] = useState<'sound' | 'none'>('sound');
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
    const [showReward, setShowReward] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>("harian");
    const [isZenMode, setIsZenMode] = useState(false);

    const { state: dhikrState, updateState, hasHydrated } = useDhikrPersistence({
        defaultActiveId: dhikrPresets[0]?.id ?? "tasbih",
        validActiveIds: [...dhikrPresets, ...libraryPresets].map((preset) => preset.id),
        defaultTarget: 33
    });
    
    const { count, target, activeDhikrId, dailyCount, streak, lastDhikrDate, activeSequenceId, sequenceIndex, lifetimeCount, dhikrHistory } = dhikrState;
    const allPresets = [...dhikrPresets, ...libraryPresets];
    const activeDhikr = allPresets.find((dhikr) => dhikr.id === activeDhikrId) || null;
    const activeSequence = dhikrSequences.find((seq) => seq.id === activeSequenceId) || null;

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
            // Check if we are in a sequence
            if (activeSequence && activeSequence.items) {
                if (sequenceIndex < activeSequence.items.length - 1) {
                    // Auto advance
                    setTimeout(() => {
                        const nextDhikrId = activeSequence.items[sequenceIndex + 1];
                        const nextDhikr = allPresets.find(p => p.id === nextDhikrId);
                        if (nextDhikr) {
                            updateState({
                                count: 0,
                                activeDhikrId: nextDhikr.id,
                                target: nextDhikr.target,
                                sequenceIndex: sequenceIndex + 1
                            });
                        }
                    }, 100);
                    return; // Do not show reward yet
                }
            }

            // Normal completion or end of sequence
            setTimeout(() => {
                addHasanah(50);
                setShowReward(true);
            }, 100);
        }
    }, [count, target, activeSequence, sequenceIndex, dhikrPresets, updateState, allPresets]);

    const handleIncrement = () => {
        let ctx = audioContext;
        if (!ctx) ctx = initAudio();
        if (ctx && ctx.state === 'suspended') ctx.resume();

        const today = new Date().toISOString().split('T')[0];
        let newDailyCount = dailyCount;
        let newStreak = streak;
        let newLastDate = lastDhikrDate;

        if (lastDhikrDate !== today) {
            newDailyCount = 1;
            newLastDate = today;
            const last = new Date(lastDhikrDate);
            const curr = new Date(today);
            const diffDays = Math.ceil(Math.abs(curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) newStreak = streak + 1;
            else newStreak = 1;
        } else {
            newDailyCount = dailyCount + 1;
            if (streak === 0) newStreak = 1;
        }

        if (feedbackMode === 'sound' && ctx) playTick(ctx);

        // Gamification & Tracking
        const newLifetimeCount = (lifetimeCount || 0) + 1;
        const newDhikrHistory = { ...(dhikrHistory || {}) };
        if (activeDhikrId) {
            newDhikrHistory[activeDhikrId] = (newDhikrHistory[activeDhikrId] || 0) + 1;
        }

        // Check if milestone crossed
        const currentMilestoneIdx = dhikrMilestones.findIndex(m => m.target > (lifetimeCount || 0)) - 1;
        const nextMilestoneIdx = dhikrMilestones.findIndex(m => m.target > newLifetimeCount) - 1;

        if (nextMilestoneIdx > currentMilestoneIdx && nextMilestoneIdx >= 0) {
            const milestone = dhikrMilestones[nextMilestoneIdx];
            addHasanah(milestone.reward);
        }

        // Debounce sync queue (sync every 10 counts roughly)
        if (newLifetimeCount % 10 === 0) {
            syncQueue.addToQueue('dhikr_stats', 'update', {
                lifetimeCount: newLifetimeCount,
                dhikrHistory: newDhikrHistory,
                timestamp: Date.now()
            });
        }

        // Calculate new count and save immediately
        const newCount = (target && count + 1 > target) ? 1 : count + 1;
        updateState({
            count: newCount,
            dailyCount: newDailyCount,
            streak: newStreak,
            lastDhikrDate: newLastDate,
            lifetimeCount: newLifetimeCount,
            dhikrHistory: newDhikrHistory
        });
    };

    const handleReset = () => {
        if (confirm(t.tasbihResetConfirm)) {
            if (activeSequence) {
                const firstDhikrId = activeSequence.items[0];
                const firstDhikr = allPresets.find(p => p.id === firstDhikrId);
                updateState({
                    count: 0,
                    sequenceIndex: 0,
                    activeDhikrId: firstDhikr?.id || activeDhikrId,
                    target: firstDhikr?.target || target
                });
            } else {
                updateState({ count: 0 });
            }
        }
    };

    const toggleFeedback = () => {
        setFeedbackMode(prev => prev === 'sound' ? 'none' : 'sound');
    };

    const handlePresetSelect = (preset: DhikrPreset) => {
        updateState({
            target: preset.target,
            activeDhikrId: preset.id,
            activeSequenceId: null,
            sequenceIndex: 0,
            count: 0
        });
        setIsDialogOpen(false);
    };

    const handleSequenceSelect = (sequence: typeof dhikrSequences[0]) => {
        const firstDhikrId = sequence.items[0];
        const firstDhikr = allPresets.find(p => p.id === firstDhikrId);
        if (firstDhikr) {
            updateState({
                target: firstDhikr.target,
                activeDhikrId: firstDhikr.id,
                activeSequenceId: sequence.id,
                sequenceIndex: 0,
                count: 0
            });
        }
        setIsDialogOpen(false);
    };

    const progress = target && hasHydrated ? (count / target) * 100 : 0;

    return (
        <div className="flex flex-col items-center w-full h-full relative px-4 pb-nav pt-4 overflow-hidden">
            <DhikrZenMode
                isZenMode={isZenMode}
                setIsZenMode={setIsZenMode}
                activeDhikr={activeDhikr}
                target={target}
                count={count}
                hasHydrated={hasHydrated}
                t={t}
                handleIncrement={handleIncrement}
                feedbackMode={feedbackMode}
                toggleFeedback={toggleFeedback}
            />

            {/* Tap Area Overlay */}
            <div className="absolute inset-0 z-0 cursor-pointer active:bg-white/5 transition-colors" onClick={handleIncrement} />

            <DhikrDisplay
                t={t}
                isDaylight={isDaylight}
                activeSequence={activeSequence}
                sequenceIndex={sequenceIndex}
                activeDhikr={activeDhikr}
                target={target}
                progress={progress}
                count={count}
                hasHydrated={hasHydrated}
                handleIncrement={handleIncrement}
            />

            {/* Bottom Section: Stats & Controls - Fixed at Bottom clear of Nav */}
            <div className="w-full shrink-0 flex flex-col items-center relative z-20 pt-2 pb-2 pointer-events-none">
                <DhikrHistory
                    isMilestoneModalOpen={isMilestoneModalOpen}
                    setIsMilestoneModalOpen={setIsMilestoneModalOpen}
                    t={t}
                    isDaylight={isDaylight}
                    dailyCount={dailyCount}
                    streak={streak}
                    lifetimeCount={lifetimeCount || 0}
                    hasHydrated={hasHydrated}
                    dhikrHistory={dhikrHistory || {}}
                    allPresets={allPresets as DhikrPreset[]}
                />

                <DhikrControls
                    t={t}
                    isDaylight={isDaylight}
                    handleReset={handleReset}
                    setIsZenMode={setIsZenMode}
                    feedbackMode={feedbackMode}
                    setFeedbackMode={setFeedbackMode}
                    toggleFeedback={toggleFeedback}
                >
                    <DhikrPresetSelector
                        isDialogOpen={isDialogOpen}
                        setIsDialogOpen={setIsDialogOpen}
                        t={t}
                        isDaylight={isDaylight}
                        expandedCategory={expandedCategory}
                        setExpandedCategory={setExpandedCategory}
                        handleSequenceSelect={handleSequenceSelect}
                        handlePresetSelect={handlePresetSelect}
                        dhikrPresets={dhikrPresets}
                        activeSequenceId={activeSequenceId}
                        activeDhikr={activeDhikr}
                    />
                </DhikrControls>
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
                            const currentIndex = activeDhikr ? allPresets.findIndex(z => z.id === activeDhikr.id) : -1;
                            const nextZikir = currentIndex !== -1 && currentIndex < allPresets.length - 1
                                ? allPresets[currentIndex + 1]
                                : null;

                            return (
                                <>
                                    {nextZikir ? (
                                        <>
                                            <Button
                                                onClick={() => {
                                                    handlePresetSelect(nextZikir as DhikrPreset);
                                                    setShowReward(false);
                                                }}
                                                className="flex-[1.5] bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-light))] text-white font-bold h-11 rounded-xl flex flex-col items-center justify-center p-0"
                                            >
                                                <span className="text-[7px] opacity-70 uppercase tracking-widest mb-0.5">{t.tasbihNextUp}</span>
                                                <span className="text-xs">{nextZikir.label}</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    if (activeSequence) {
                                                        const firstDhikrId = activeSequence.items[0];
                                                        const firstDhikr = allPresets.find(p => p.id === firstDhikrId);
                                                        updateState({
                                                            count: 0,
                                                            sequenceIndex: 0,
                                                            activeDhikrId: firstDhikr?.id || activeDhikrId,
                                                            target: firstDhikr?.target || target
                                                        });
                                                    } else {
                                                        updateState({ count: 0 });
                                                    }
                                                    setShowReward(false);
                                                }}
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 h-11 rounded-xl flex flex-row items-center justify-center gap-1.5 px-3"
                                            >
                                                <RotateCcw className="h-3 w-3 opacity-70" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider">{t.tasbihRepeat}</span>
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={() => {
                                                if (activeSequence) {
                                                    const firstDhikrId = activeSequence.items[0];
                                                    const firstDhikr = allPresets.find(p => p.id === firstDhikrId);
                                                    updateState({
                                                        count: 0,
                                                        sequenceIndex: 0,
                                                        activeDhikrId: firstDhikr?.id || activeDhikrId,
                                                        target: firstDhikr?.target || target
                                                    });
                                                } else {
                                                    updateState({ count: 0 });
                                                }
                                                setShowReward(false);
                                            }}
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
