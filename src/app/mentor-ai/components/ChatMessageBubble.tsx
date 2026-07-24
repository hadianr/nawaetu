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

import { User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/lib/chat-storage";
import { parseAIResponse, formatMarkdown } from "@/lib/message-parser";

interface ChatMessageBubbleProps {
    msg: ChatMessage;
    isDaylight: boolean;
}

export function ChatMessageBubble({ msg, isDaylight }: ChatMessageBubbleProps) {
    const isUser = msg.role === 'user';
    return (
        <div className={cn("flex w-full animate-in slide-in-from-bottom-2 duration-300", isUser ? "justify-end" : "justify-start")}>
            <div className={cn(
                "flex gap-2 max-w-[85%]",
                isUser ? "flex-row-reverse" : "flex-row"
            )}>
                {/* Avatar */}
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                    isUser
                        ? isDaylight ? "bg-slate-200" : "bg-white/10"
                        : "bg-[rgb(var(--color-primary))]/20"
                )}>
                    {isUser ? <User className={cn("w-4 h-4", isDaylight ? "text-slate-500" : "text-white/50")} /> : <Sparkles className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />}
                </div>

                {/* Bubble */}
                <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                    isUser
                        ? isDaylight
                            ? "bg-emerald-500 text-white rounded-tr-none px-4"
                            : "bg-[rgb(var(--color-primary))] text-white rounded-tr-none px-4"
                        : isDaylight
                            ? "bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm"
                            : "bg-[#1e293b] text-white/90 rounded-tl-none border border-white/5"
                )}>
                    {isUser ? (
                        <p>{msg.content}</p>
                    ) : (() => {
                        const parsed = parseAIResponse(msg.content);
                        return (
                            <div
                                className={cn(
                                    "prose prose-sm max-w-none",
                                    isDaylight
                                        ? "prose-slate [&_strong]:text-emerald-600 [&_strong]:font-bold"
                                        : "prose-invert [&_strong]:text-[rgb(var(--color-primary-light))] [&_strong]:font-bold"
                                )}
                                dangerouslySetInnerHTML={{ __html: formatMarkdown(parsed.mainMessage) }}
                            />
                        );
                    })()}
                    <span className={cn(
                        "text-[9px] mt-1 block text-right font-medium",
                        isUser
                            ? "text-white/80"
                            : isDaylight ? "text-slate-400" : "text-white/40"
                    )}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
}
