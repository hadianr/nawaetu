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
import type { TranslationTree } from "@/context/LocaleContext";

interface ChatInputAreaProps {
    input: string;
    setInput: (val: string) => void;
    handleSend: (val?: string) => void;
    isTyping: boolean;
    dailyCount: number;
    DAILY_LIMIT: number;
    setShowLimitBlocking: (show: boolean) => void;
    t: TranslationTree;
    isMuhsinin: boolean;
}

export function ChatInputArea({
    input,
    setInput,
    handleSend,
    isTyping,
    dailyCount,
    DAILY_LIMIT,
    setShowLimitBlocking,
    t
}: ChatInputAreaProps) {
    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t pb-6 md:pb-8 pt-4 z-30",
            "bg-[rgb(var(--color-canvas))]/95 border-[rgb(var(--color-border))]"
        )}>
            <div className="w-full max-w-none mx-auto px-4 space-y-3 xl:max-w-md">
                {/* Limit Reached Card */}
                {(dailyCount >= DAILY_LIMIT) ? (
                    <div className={cn(
                        "backdrop-blur-md rounded-2xl p-4 border flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-bottom-2",
                        "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-danger))]/20 shadow-[var(--shadow-card)]"
                    )}>
                        {/* Icon & Text */}
                        <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                                "bg-[rgb(var(--color-danger))]/10 border-[rgb(var(--color-danger))]/20"
                            )}>
                                <Lock size={16} className="text-[rgb(var(--color-danger))]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-sm font-semibold truncate",
                                    "text-[rgb(var(--color-text-strong))]"
                                )}>
                                    {t.tanyaLimitReached || "Kuota Habis"}
                                </p>
                                <p className={cn(
                                    "text-xs leading-tight",
                                    "text-[rgb(var(--color-text-muted))]"
                                )}>
                                    {t.tanyaUpgradeHint || "Tunggu besok atau Infaq untuk 5x kuota."}
                                </p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => setShowLimitBlocking(true)}
                            className={cn(
                                "text-[rgb(var(--color-primary-foreground))] text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))] shadow-[var(--shadow-card)]"
                            )}
                        >
                            <Sparkles size={14} className="text-[rgb(var(--color-accent-foreground))]" />
                            {t.tanyaInfaqButton || "Berinfaq"}
                        </button>
                    </div>
                ) : (
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className={cn(
                            "flex items-end gap-2 border rounded-3xl p-1.5 pl-4 transition-all",
                            "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] focus-within:border-[rgb(var(--color-primary))]/50 focus-within:ring-1 focus-within:ring-[rgb(var(--color-primary))]/50"
                        )}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t.tanyaPlaceholder}
                            autoCapitalize="none"
                            autoCorrect="off"
                            className={cn(
                                "flex-1 bg-transparent border-none outline-none text-[16px] sm:text-sm py-2.5 min-h-[44px]",
                                "text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))]"
                            )}
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className={cn(
                                "w-10 h-10 rounded-full text-[rgb(var(--color-primary-foreground))] flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all bg-[rgb(var(--color-primary))] shadow-[var(--shadow-card)]"
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
