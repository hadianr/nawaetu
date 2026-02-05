"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, User, UserCheck, Menu, Plus, Trash2, X, MessageSquare, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserActivity, useUserProfile } from "@/lib/activity-tracker";
import { askMentor } from "./ai-action";
import { ChatMessage, ChatSession, getAllSessions, saveSession, createNewSession, deleteSession, getSession } from "@/lib/chat-storage";
import { retryWithBackoff } from "@/lib/retry-helper";
import { getCurrentTimeContext } from "@/lib/time-context";
import { parseAIResponse, formatMarkdown } from "@/lib/message-parser";
import { trackAIQuery } from "@/lib/analytics";
import { useInfaq } from "@/context/InfaqContext";
import { useLocale } from "@/context/LocaleContext";
import InfaqModal from "@/components/InfaqModal";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const storage = getStorageService();

export default function MentorAIPage() {
    const { stats } = useUserActivity();
    const { profile } = useUserProfile();
    const { t } = useLocale();

    const QUICK_PROMPTS = [
        t.tanyaPrompt1,
        t.tanyaPrompt2,
        t.tanyaPrompt3,
        t.tanyaPrompt4,
    ];

    // Session State
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // AI & Input State
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Rate Limiting Logic (5 Questions/Day)
    const DAILY_LIMIT = 5;
    const [dailyCount, setDailyCount] = useState(0);
    const [lastResetDate, setLastResetDate] = useState("");
    const [showLimitBlocking, setShowLimitBlocking] = useState(false);
    const { isMuhsinin } = useInfaq(); // From Context

    // Initialize: Load Sessions and Rate Limit
    useEffect(() => {
        // 1. Load Sessions
        const loadedSessions = getAllSessions();
        setSessions(loadedSessions);

        if (loadedSessions.length > 0) {
            // Load most recent session
            setActiveSessionId(loadedSessions[0].id);
            setMessages(loadedSessions[0].messages);
        } else {
            // No sessions? Initialize first one (but don't save yet until first message to avoid empty spam)
            // Or maybe just show empty state. Let's start clean.
            handleNewChat();
        }

        // 2. Load Rate Limit from Storage
        const savedUsage = storage.getOptional<any>(STORAGE_KEYS.AI_USAGE as any);
        const today = new Date().toDateString();

        if (savedUsage) {
            const parsed = typeof savedUsage === 'string' ? JSON.parse(savedUsage) : savedUsage;
            const { date, count } = parsed;
            if (date === today) {
                setDailyCount(count);
                setLastResetDate(date);
            } else {
                // Reset if new day
                setDailyCount(0);
                setLastResetDate(today);
                storage.set(STORAGE_KEYS.AI_USAGE as any, JSON.stringify({ date: today, count: 0 }));
            }
        } else {
            setLastResetDate(today);
            storage.set(STORAGE_KEYS.AI_USAGE as any, JSON.stringify({ date: today, count: 0 }));
        }

    }, []);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Handle New Chat
    const handleNewChat = () => {
        const newSession = createNewSession();
        // Check if we already have an empty new session to avoid duplicates?
        // Actually createNewSession just returns an object, doesn't save yet.
        // We will treat this as "staging" a new session.
        setActiveSessionId(newSession.id);
        setMessages([]); // Empty messages for new chat
        setShowHistory(false);
        setIsTyping(false);

        // If previous session was empty, maybe remove it? Nah, keep it simple.
    };

    // Handle Switch Session
    const handleSwitchSession = (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            setActiveSessionId(sessionId);
            setMessages(session.messages);
            setShowHistory(false);
        }
    };

    // Handle Delete Session
    const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        deleteSession(sessionId);
        const updatedSessions = sessions.filter(s => s.id !== sessionId);
        setSessions(updatedSessions);

        if (activeSessionId === sessionId) {
            if (updatedSessions.length > 0) {
                handleSwitchSession(updatedSessions[0].id);
            } else {
                handleNewChat();
            }
        }
    };

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        // CHECK RATE LIMIT (Skip for Muhsinin)
        if (!isMuhsinin && dailyCount >= DAILY_LIMIT) {
            setShowLimitBlocking(true);
            return;
        }

        // Add User Message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: Date.now()
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setIsTyping(true);

        // Update Session in Storage immediately
        let currentSession = sessions.find(s => s.id === activeSessionId);
        let isNewSession = false;

        if (!currentSession) {
            // First message in a new "staged" session
            currentSession = createNewSession();
            currentSession.id = activeSessionId || crypto.randomUUID(); // Should match state
            currentSession.title = text.substring(0, 30) + (text.length > 30 ? "..." : "");
            isNewSession = true;
        }

        // Update local session object
        currentSession.messages = newMessages;
        currentSession.updatedAt = Date.now();
        if (isNewSession) {
            // Update title if it was "Percakapan Baru" or similar
            currentSession.title = text.substring(0, 30) + (text.length > 30 ? "..." : "");
        }

        // Save to storage
        saveSession(currentSession);

        // Update State
        if (isNewSession) {
            setSessions(prev => [currentSession!, ...prev]);
        } else {
            setSessions(prev => prev.map(s => s.id === currentSession!.id ? currentSession! : s).sort((a, b) => b.updatedAt - a.updatedAt));
        }

        // INCREMENT COUNT
        if (!isMuhsinin) {
            const newCount = dailyCount + 1;
            setDailyCount(newCount);
            storage.set(STORAGE_KEYS.AI_USAGE as any, JSON.stringify({ date: lastResetDate, count: newCount }));
        }

        try {
            // Get AI Response...
            const context = {
                name: profile.name || "Hamba Allah",
                prayerStreak: stats.streakDays,
                lastPrayer: "Unknown"
            };

            // Only send last 10 messages context to save tokens/complexity
            const chatHistoryContext = newMessages
                .slice(-10)
                .map(msg => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content
                }));

            const response = await retryWithBackoff(
                () => askMentor(text, context, chatHistoryContext),
                { maxRetries: 2, initialDelay: 1000 }
            );

            trackAIQuery();

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: Date.now()
            };

            const finalMessages = [...newMessages, aiMsg];
            setMessages(finalMessages);

            // Update session with AI response
            currentSession.messages = finalMessages;
            currentSession.updatedAt = Date.now();
            saveSession(currentSession);

            // Update session list order
            setSessions(prev => {
                const updated = prev.map(s => s.id === currentSession!.id ? currentSession! : s);
                return updated.sort((a, b) => b.updatedAt - a.updatedAt);
            });

        } catch (error: any) {
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Maaf, lagi ada kendala teknis. Coba lagi ya 🙏",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-hidden">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Back Button */}
                        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </Link>

                        {/* Title & Status */}
                        <div>
                            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
                                Tanya Nawaetu
                                {isMuhsinin && <Sparkles className="w-3 h-3 text-[rgb(var(--color-primary))]" />}
                            </h1>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] text-[rgb(var(--color-primary-light))] flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    Online
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions: History & New Chat */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowHistory(true)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                        >
                            <History className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNewChat}
                            className="p-2 rounded-full hover:bg-[rgb(var(--color-primary))]/20 transition-colors text-[rgb(var(--color-primary-light))]"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* History Sidebar (Drawer) */}
            {showHistory && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowHistory(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative w-[300px] h-full bg-slate-950 border-l border-white/10 shadow-2xl p-4 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-6 pt-2">
                            <h2 className="text-lg font-bold text-white">Riwayat Chat</h2>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="p-1.5 rounded-full hover:bg-white/10"
                            >
                                <X className="w-5 h-5 text-white/50" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                            {sessions.length === 0 ? (
                                <div className="text-center py-10 text-white/30 text-sm">
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
                                                ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/30"
                                                : "bg-white/5 border-white/5 hover:bg-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <MessageSquare className={cn(
                                                "w-4 h-4 shrink-0",
                                                activeSessionId === session.id ? "text-[rgb(var(--color-primary))]" : "text-white/30"
                                            )} />
                                            <div className="min-w-0">
                                                <p className={cn(
                                                    "text-sm font-medium truncate",
                                                    activeSessionId === session.id ? "text-white" : "text-white/70"
                                                )}>
                                                    {session.title || "Percakapan Baru"}
                                                </p>
                                                <p className="text-[10px] text-white/30">
                                                    {new Date(session.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Delete Button (Visible on hover or active) */}
                                        <button
                                            onClick={(e) => handleDeleteSession(e, session.id)}
                                            className="p-1.5 rounded-full hover:bg-red-500/20 text-white/0 group-hover:text-white/30 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/10">
                            <button
                                onClick={handleNewChat}
                                className="w-full py-3 rounded-xl bg-[rgb(var(--color-primary))] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[rgb(var(--color-primary-dark))] transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Chat Baru
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 pt-20 pb-24 px-4 max-w-md mx-auto w-full space-y-4 overflow-y-auto">
                {messages.length === 0 ? (
                    // Empty State / Greeting
                    <div className="h-full flex flex-col items-center justify-center text-center pt-20 animate-in fade-in duration-700">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] flex items-center justify-center mb-6 shadow-xl shadow-[rgb(var(--color-primary))]/20">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">
                            Assalamu'alaikum, {profile.name?.split(' ')[0] || "Teman"}!
                        </h2>
                        <p className="text-white/60 text-sm max-w-[260px] leading-relaxed mb-8">
                            Saya asisten AI Nawaetu. Ada yang bisa saya bantu terkait ibadah atau agama hari ini?
                        </p>

                        {/* Quick Prompts */}
                        <div className="grid grid-cols-1 gap-2 w-full max-w-[300px]">
                            {QUICK_PROMPTS.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(prompt)}
                                    className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 text-left text-sm text-white/80 transition-all flex items-center justify-between group"
                                >
                                    {prompt}
                                    <Send className="w-3 h-3 text-white/0 group-hover:text-[rgb(var(--color-primary))] transition-all -translate-x-2 group-hover:translate-x-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Chat Messages
                    <>
                        <div className="flex justify-center my-4 opacity-50">
                            <span className="text-[10px] bg-white/5 px-2 py-1 rounded-full text-white/40">
                                {messages.length > 0 && new Date(messages[0].timestamp).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                        </div>

                        {messages.map((msg) => {
                            const isUser = msg.role === 'user';
                            return (
                                <div key={msg.id} className={cn("flex w-full animate-in slide-in-from-bottom-2 duration-300", isUser ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "flex gap-2 max-w-[85%]",
                                        isUser ? "flex-row-reverse" : "flex-row"
                                    )}>
                                        {/* Avatar */}
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                                            isUser ? "bg-white/10" : "bg-[rgb(var(--color-primary))]/20"
                                        )}>
                                            {isUser ? <User className="w-4 h-4 text-white/50" /> : <Sparkles className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />}
                                        </div>

                                        {/* Bubble */}
                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                                            isUser
                                                ? "bg-[rgb(var(--color-primary))] text-white rounded-tr-none px-4"
                                                : "bg-[#1e293b] text-white/90 rounded-tl-none border border-white/5"
                                        )}>
                                            {isUser ? (
                                                <p>{msg.content}</p>
                                            ) : (() => {
                                                const parsed = parseAIResponse(msg.content);
                                                return (
                                                    <div
                                                        className="prose prose-invert prose-sm max-w-none [&_strong]:text-[rgb(var(--color-primary-light))] [&_strong]:font-bold [&_em]:italic"
                                                        dangerouslySetInnerHTML={{ __html: formatMarkdown(parsed.mainMessage) }}
                                                    />
                                                );
                                            })()}
                                            <span className="text-[9px] opacity-40 mt-1 block text-right">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex w-full justify-start animate-fade-in">
                                <div className="flex gap-2 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center shrink-0 mt-1 border border-[rgb(var(--color-primary))]/30">
                                        <Sparkles className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                                    </div>
                                    <div className="bg-[#1e293b] p-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-1 h-10">
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 pb-16 md:pb-12 pt-4 z-30">
                <div className="max-w-md mx-auto px-4 space-y-3">
                    {/* Limit Reached Card */}
                    {(!isMuhsinin && dailyCount >= DAILY_LIMIT) ? (
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-4 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-5">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--color-primary))]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5 shadow-inner shrink-0">
                                    <span className="text-2xl">🛑</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-white mb-0.5">Kuota Harian Habis</h3>
                                    <p className="text-[10px] text-slate-400 leading-tight">
                                        Tunggu besok atau jadi Muhsinin untuk akses tanpa batas.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowLimitBlocking(true)}
                                    className="bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-[rgb(var(--color-primary))]/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Upgrade
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-3xl p-1.5 pl-4 focus-within:border-[rgb(var(--color-primary))]/50 focus-within:ring-1 focus-within:ring-[rgb(var(--color-primary))]/50 transition-all"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={t.tanyaPlaceholder}
                                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30 py-2.5 min-h-[44px]"
                                disabled={isTyping}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="w-10 h-10 rounded-full bg-[rgb(var(--color-primary))] text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-[0_0_15px_rgba(var(--color-primary),0.3)]"
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <InfaqModal
                isOpen={showLimitBlocking}
                onClose={() => setShowLimitBlocking(false)}
                headerTitle={t.tanyaDailyLimit}
                headerDescription={t.tanyaLimitReached + ". " + t.tanyaLimitReset}
            />
        </div>
    );
}
