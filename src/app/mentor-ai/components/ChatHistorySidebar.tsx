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

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, MessageSquare, Trash2, Plus } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { ChatSession } from "@/lib/chat-storage";
import { useLocale } from "@/context/LocaleContext";

interface ChatHistorySidebarProps {
    showHistory: boolean;
    setShowHistory: (show: boolean) => void;
    sessions: ChatSession[];
    activeSessionId: string | null;
    handleSwitchSession: (id: string) => void;
    handleDeleteSession: (e: React.MouseEvent, id: string) => void;
    handleNewChat: () => void;
}

export function ChatHistorySidebar({
    showHistory,
    setShowHistory,
    sessions,
    activeSessionId,
    handleSwitchSession,
    handleDeleteSession,
    handleNewChat
}: ChatHistorySidebarProps) {
    const { t, locale } = useLocale();

    return (
        <DialogPrimitive.Root open={showHistory} onOpenChange={setShowHistory}>
            <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgb(var(--color-canvas))]/70 animate-in fade-in duration-300" />

            <DialogPrimitive.Content aria-describedby={undefined} className={cn(
                "fixed right-0 top-0 z-50 w-[300px] h-full border-l shadow-[var(--shadow-floating)] p-4 flex flex-col animate-in slide-in-from-right duration-300",
                "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]"
            )}>
                <div className="flex items-center justify-between mb-6 pt-2">
                    <DialogPrimitive.Title className={cn(
                        "text-lg font-bold",
                        "text-[rgb(var(--color-text-strong))]"
                    )}>{t.tanyaHistory}</DialogPrimitive.Title>
                    <DialogPrimitive.Close
                        aria-label={t.tanyaClose}
                        className={cn(
                            "p-1.5 rounded-full",
                            "hover:bg-[rgb(var(--color-primary))]/10"
                        )}
                    >
                        <X className="w-5 h-5 text-[rgb(var(--color-text-muted))]" />
                    </DialogPrimitive.Close>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {sessions.length === 0 ? (
                        <div className={cn(
                            "text-center py-10 text-sm",
                            "text-[rgb(var(--color-text-muted))]"
                        )}>
                            {t.tanyaNoHistory}
                        </div>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session.id}
                                className={cn(
                                    "flex items-center justify-between rounded-xl border transition-all",
                                        activeSessionId === session.id
                                            ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/30 shadow-[var(--shadow-card)]"
                                            : "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-primary))]/10"
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={() => handleSwitchSession(session.id)}
                                    aria-current={activeSessionId === session.id ? "true" : undefined}
                                    className="flex flex-1 items-center gap-3 min-w-0 p-3 text-left rounded-xl"
                                >
                                    <MessageSquare className={cn(
                                        "w-4 h-4 shrink-0",
                                        activeSessionId === session.id
                                            ? "text-[rgb(var(--color-primary-strong))]"
                                            : "text-[rgb(var(--color-text-muted))]"
                                    )} />
                                    <span className="min-w-0">
                                        <span className={cn(
                                            "block text-sm font-medium truncate",
                                            activeSessionId === session.id
                                                ? "text-[rgb(var(--color-text-strong))]"
                                                : "text-[rgb(var(--color-text))]"
                                        )}>
                                            {session.title || t.tanyaUntitled}
                                        </span>
                                        <span className={cn(
                                            "block text-xs",
                                            "text-[rgb(var(--color-text-muted))]"
                                        )}>
                                            {new Date(session.updatedAt).toLocaleDateString(locale)}
                                        </span>
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleDeleteSession(e, session.id)}
                                    aria-label={`${t.tanyaDeleteChat}: ${session.title || t.tanyaUntitled}`}
                                    className={cn(
                                        "p-1.5 mr-2 rounded-full transition-colors",
                                        "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10"
                                    )}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className={cn(
                    "pt-4 mt-4 border-t",
                    "border-[rgb(var(--color-border))]"
                )}>
                    <button
                        type="button"
                        onClick={handleNewChat}
                        className="w-full py-3 rounded-xl bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[rgb(var(--color-primary-strong))] transition-colors shadow-[var(--shadow-card)]"
                    >
                        <Plus className="w-4 h-4" />
                        {t.tanyaNewChat}
                    </button>
                </div>
            </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
