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

import { X, MessageSquare, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatSession } from "@/lib/chat-storage";

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
    if (!showHistory) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[rgb(var(--color-canvas))]/70 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setShowHistory(false)}
            />

            {/* Drawer Content */}
            <div className={cn(
                "relative w-[300px] h-full border-l shadow-2xl p-4 flex flex-col animate-in slide-in-from-right duration-300",
                "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]"
            )}>
                <div className="flex items-center justify-between mb-6 pt-2">
                    <h2 className={cn(
                        "text-lg font-bold",
                        "text-[rgb(var(--color-text-strong))]"
                    )}>Riwayat Chat</h2>
                    <button
                        onClick={() => setShowHistory(false)}
                        className={cn(
                            "p-1.5 rounded-full",
                            "hover:bg-[rgb(var(--color-primary))]/10"
                        )}
                    >
                        <X className="w-5 h-5 text-[rgb(var(--color-text-muted))]" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {sessions.length === 0 ? (
                        <div className={cn(
                            "text-center py-10 text-sm",
                            "text-[rgb(var(--color-text-muted))]"
                        )}>
                            Belum ada riwayat percakapan.
                        </div>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => handleSwitchSession(session.id)}
                                className={cn(
                                    "group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                                        activeSessionId === session.id
                                            ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/30 shadow-sm"
                                            : "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-primary))]/10"
                                )}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <MessageSquare className={cn(
                                        "w-4 h-4 shrink-0",
                                        activeSessionId === session.id
                                            ? "text-[rgb(var(--color-primary))]"
                                            : "text-[rgb(var(--color-text-muted))]"
                                    )} />
                                    <div className="min-w-0">
                                        <p className={cn(
                                            "text-sm font-medium truncate",
                                            activeSessionId === session.id
                                                ? "text-[rgb(var(--color-text-strong))]"
                                                : "text-[rgb(var(--color-text))]"
                                        )}>
                                            {session.title || "Percakapan Baru"}
                                        </p>
                                        <p className={cn(
                                            "text-[10px]",
                                            "text-[rgb(var(--color-text-muted))]"
                                        )}>
                                            {new Date(session.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {/* Delete Button (Visible on hover or active) */}
                                <button
                                    onClick={(e) => handleDeleteSession(e, session.id)}
                                    className={cn(
                                        "p-1.5 rounded-full transition-colors",
                                        "text-[rgb(var(--color-text-muted))] opacity-0 group-hover:opacity-100 hover:text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10"
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
                        onClick={handleNewChat}
                        className="w-full py-3 rounded-xl bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[rgb(var(--color-primary-strong))] transition-colors shadow-[var(--shadow-card)]"
                    >
                        <Plus className="w-4 h-4" />
                        Chat Baru
                    </button>
                </div>
            </div>
        </div>
    );
}
