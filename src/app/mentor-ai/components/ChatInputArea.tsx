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

import { Lock, Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputAreaProps {
    input: string;
    setInput: (val: string) => void;
    handleSend: (val?: string) => void;
    isTyping: boolean;
    isDaylight: boolean;
    dailyCount: number;
    DAILY_LIMIT: number;
    setShowLimitBlocking: (show: boolean) => void;
    t: any;
    isMuhsinin: boolean;
}

export function ChatInputArea({
    input,
    setInput,
    handleSend,
    isTyping,
    isDaylight,
    dailyCount,
    DAILY_LIMIT,
    setShowLimitBlocking,
    t,
    isMuhsinin
}: ChatInputAreaProps) {
    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t pb-6 md:pb-8 pt-4 z-30",
            isDaylight ? "bg-white/95 border-slate-200" : "bg-black/95 border-white/10"
        )}>
            <div className="max-w-md mx-auto px-4 space-y-3">
                {/* Limit Reached Card */}
                {(dailyCount >= DAILY_LIMIT) ? (
                    <div className={cn(
                        "backdrop-blur-md rounded-2xl p-4 border flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-bottom-2",
                        isDaylight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-800/90 border-red-500/10"
                    )}>
                        {/* Icon & Text */}
                        <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                                isDaylight ? "bg-red-50 border-red-100" : "bg-red-500/10 border-red-500/20"
                            )}>
                                <Lock size={16} className="text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-sm font-semibold truncate",
                                    isDaylight ? "text-slate-900" : "text-white"
                                )}>
                                    {t.tanyaLimitReached || "Kuota Habis"}
                                </p>
                                <p className={cn(
                                    "text-xs leading-tight",
                                    isDaylight ? "text-slate-500" : "text-slate-400"
                                )}>
                                    {t.tanyaUpgradeHint || "Tunggu besok atau Infaq untuk 5x kuota."}
                                </p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => setShowLimitBlocking(true)}
                            className={cn(
                                "text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0",
                                isDaylight
                                    ? "bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
                                    : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] shadow-lg shadow-[rgb(var(--color-primary))]/20"
                            )}
                        >
                            <Sparkles size={14} className="text-yellow-200" />
                            {t.tanyaInfaqButton || "Berinfaq"}
                        </button>
                    </div>
                ) : (
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className={cn(
                            "flex items-end gap-2 border rounded-3xl p-1.5 pl-4 transition-all",
                            isDaylight
                                ? "bg-slate-50 border-slate-200 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50"
                                : "bg-white/5 border-white/10 focus-within:border-[rgb(var(--color-primary))]/50 focus-within:ring-1 focus-within:ring-[rgb(var(--color-primary))]/50"
                        )}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t.tanyaPlaceholder}
                            className={cn(
                                "flex-1 bg-transparent border-none outline-none text-sm py-2.5 min-h-[44px]",
                                isDaylight ? "text-slate-900 placeholder:text-slate-400" : "text-white placeholder:text-white/30"
                            )}
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className={cn(
                                "w-10 h-10 rounded-full text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all",
                                isDaylight
                                    ? "bg-emerald-500 shadow-md shadow-emerald-500/20"
                                    : "bg-[rgb(var(--color-primary))] shadow-lg shadow-[rgb(var(--color-primary))]/20"
                            )}
                        >
                            <Send className="w-4 h-4 ml-0.5" />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
