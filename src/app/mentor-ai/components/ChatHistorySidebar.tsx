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
    isDaylight: boolean;
    sessions: ChatSession[];
    activeSessionId: string | null;
    handleSwitchSession: (id: string) => void;
    handleDeleteSession: (e: React.MouseEvent, id: string) => void;
    handleNewChat: () => void;
}

export function ChatHistorySidebar({
    showHistory,
    setShowHistory,
    isDaylight,
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
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setShowHistory(false)}
            />

            {/* Drawer Content */}
            <div className={cn(
                "relative w-[300px] h-full border-l shadow-2xl p-4 flex flex-col animate-in slide-in-from-right duration-300",
                isDaylight ? "bg-white border-slate-200" : "bg-slate-950 border-white/10"
            )}>
                <div className="flex items-center justify-between mb-6 pt-2">
                    <h2 className={cn(
                        "text-lg font-bold",
                        isDaylight ? "text-slate-900" : "text-white"
                    )}>Riwayat Chat</h2>
                    <button
                        onClick={() => setShowHistory(false)}
                        className={cn(
                            "p-1.5 rounded-full",
                            isDaylight ? "hover:bg-slate-100" : "hover:bg-white/10"
                        )}
                    >
                        <X className={cn("w-5 h-5", isDaylight ? "text-slate-400" : "text-white/50")} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {sessions.length === 0 ? (
                        <div className={cn(
                            "text-center py-10 text-sm",
                            isDaylight ? "text-slate-400" : "text-white/30"
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
                                        ? isDaylight
                                            ? "bg-emerald-50 border-emerald-200/60 shadow-sm"
                                            : "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/30"
                                        : isDaylight
                                            ? "bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200"
                                            : "bg-white/5 border-white/5 hover:bg-white/10"
                                )}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <MessageSquare className={cn(
                                        "w-4 h-4 shrink-0",
                                        activeSessionId === session.id
                                            ? isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary))]"
                                            : isDaylight ? "text-slate-300" : "text-white/30"
                                    )} />
                                    <div className="min-w-0">
                                        <p className={cn(
                                            "text-sm font-medium truncate",
                                            activeSessionId === session.id
                                                ? isDaylight ? "text-slate-900" : "text-white"
                                                : isDaylight ? "text-slate-600" : "text-white/70"
                                        )}>
                                            {session.title || "Percakapan Baru"}
                                        </p>
                                        <p className={cn(
                                            "text-[10px]",
                                            isDaylight ? "text-slate-400" : "text-white/30"
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
                                        isDaylight
                                            ? "text-slate-0 group-hover:text-slate-300 hover:text-red-500 hover:bg-red-50"
                                            : "hover:bg-red-500/20 text-white/0 group-hover:text-white/30 hover:text-red-400"
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
                    isDaylight ? "border-slate-100" : "border-white/10"
                )}>
                    <button
                        onClick={handleNewChat}
                        className="w-full py-3 rounded-xl bg-[rgb(var(--color-primary))] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[rgb(var(--color-primary-dark))] transition-colors shadow-lg shadow-[rgb(var(--color-primary))]/20"
                    >
                        <Plus className="w-4 h-4" />
                        Chat Baru
                    </button>
                </div>
            </div>
        </div>
    );
}
