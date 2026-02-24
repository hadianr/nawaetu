"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, User, X, MessageSquare, History, Lock, Plus, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserActivity, useUserProfile } from "@/lib/activity-tracker";
import { askMentor } from "./ai-action";
import { ChatMessage, ChatSession, getAllSessions, saveSession, createNewSession, deleteSession } from "@/lib/chat-storage";
import { retryWithBackoff } from "@/lib/retry-helper";
import { parseAIResponse, formatMarkdown } from "@/lib/message-parser";
import { trackAIQuery } from "@/lib/analytics";
import { useInfaq } from "@/context/InfaqContext";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import DonationModal from "@/components/DonationModal";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { useSession, signIn } from "next-auth/react";

const storage = getStorageService();

export default function MentorAIPage() {
    const { data: session, status } = useSession();
    const { stats } = useUserActivity();
    const { profile } = useUserProfile();
    const { t } = useLocale();
    const HADITH_THEMES = [
        { label: "Sabar", prompt: "Berikan hadits tentang keutamaan sabar" },
        { label: "Syukur", prompt: "Apa hadits tentang cara bersyukur?" },
        { label: "Adab", prompt: "Jelaskan adab berbicara dalam Islam" },
        { label: "Ilmu", prompt: "Apa pentingnya menuntut ilmu?" },
        { label: "Sholat", prompt: "Tips khusyuk dalam sholat" },
        { label: "Sedekah", prompt: "Keutamaan sedekah subuh" },
        { label: "Puasa", prompt: "Manfaat puasa bagi jiwa" },
        { label: "Memaafkan", prompt: "Hadits tentang saling memaafkan" },
    ];

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

    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const { isMuhsinin, refreshStatus, isLoading: isInfaqLoading } = useInfaq();

    // Rate Limiting Logic (3/Day Free, 15/Day Muhsinin)
    const FREE_LIMIT = 3;
    const MUHSININ_LIMIT = 15;
    const DAILY_LIMIT = isMuhsinin ? MUHSININ_LIMIT : FREE_LIMIT;
    const [dailyCount, setDailyCount] = useState(0);
    const [lastResetDate, setLastResetDate] = useState("");
    const [showLimitBlocking, setShowLimitBlocking] = useState(false);

    // Eagerly sync infaq status for authenticated users on mount to ensure
    // new devices or cleared caches don't get stuck on the free tier until limit is reached
    useEffect(() => {
        if (status === "authenticated") {
            refreshStatus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);
    // Sync status if reached limit (Check for payment update)
    useEffect(() => {
        if (isInfaqLoading) return; // Don't check limits while loading tier status

        let timer: any;
        if (dailyCount >= DAILY_LIMIT && status === "authenticated" && !isMuhsinin) {
            // Auto-refresh immediately and then again in 5 seconds if still blocked
            refreshStatus();

            timer = setTimeout(() => {
                if (!isMuhsinin) refreshStatus();
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [dailyCount, DAILY_LIMIT, status, isMuhsinin]);

    // Initialize: Load Sessions (Optimistic & Background Sync)
    useEffect(() => {
        const initSessions = async () => {
            // 1. Load from local first (Instant UI)
            const localSessions = getAllSessions();
            if (localSessions.length > 0) {
                setSessions(localSessions);
            }

            // 2. ALWAYS start with a New Chat (Blank State) as requested
            handleNewChat();

            // 3. Background Sync with Server
            if (status === "authenticated") {
                try {
                    const res = await fetch("/api/mentor-ai/history");
                    if (res.ok) {
                        const serverSessions = await res.json();
                        if (Array.isArray(serverSessions)) {
                            setSessions(prev => {
                                // Merge logic: Server is Source of Truth for existing sessions
                                // Local is for current unsaved session
                                const idMap = new Map();

                                // Start with server sessions
                                serverSessions.forEach((s: ChatSession) => idMap.set(s.id, s));

                                // Add local sessions if they don't exist on server yet (merge)
                                prev.forEach((s: ChatSession) => {
                                    if (!idMap.has(s.id)) {
                                        idMap.set(s.id, s);
                                    }
                                });

                                return Array.from(idMap.values()).sort((a, b) => {
                                    const dateA = new Date(a.updatedAt).getTime();
                                    const dateB = new Date(b.updatedAt).getTime();
                                    return dateB - dateA;
                                });
                            });

                            // Reconstruct today's AI usage count from server sessions
                            const todayStart = new Date();
                            todayStart.setHours(0, 0, 0, 0);
                            const todayTime = todayStart.getTime();

                            let serverDailyCount = 0;
                            serverSessions.forEach((s: ChatSession) => {
                                if (s.messages && Array.isArray(s.messages)) {
                                    s.messages.forEach(m => {
                                        if (m.role === 'user' && m.timestamp >= todayTime) {
                                            serverDailyCount++;
                                        }
                                    });
                                }
                            });

                            // Update local daily count if server has higher usage
                            setDailyCount(prev => {
                                if (serverDailyCount > prev) {
                                    const todayStr = new Date().toDateString();
                                    storage.set(STORAGE_KEYS.AI_USAGE as any, JSON.stringify({
                                        date: todayStr,
                                        count: serverDailyCount,
                                        tier: isMuhsinin ? 'muhsinin' : 'free'
                                    }));
                                    return serverDailyCount;
                                }
                                return prev;
                            });
                        }
                    }
                } catch (e) {
                    console.error("Background history sync failed", e);
                }
            }
        };

        if (status !== "loading") {
            initSessions();
        }
    }, [status]);

    // Initialize & Watch: Rate Limit Logic (Run on mount & when isMuhsinin changes)
    useEffect(() => {
        if (isInfaqLoading) return; // Wait for tier to settle

        const savedUsage = storage.getOptional<any>(STORAGE_KEYS.AI_USAGE as any);
        const today = new Date().toDateString();
        const currentTier = isMuhsinin ? 'muhsinin' : 'free';

        if (savedUsage) {
            const parsed = typeof savedUsage === 'string' ? JSON.parse(savedUsage) : savedUsage;
            // Support legacy format (without tier)
            const { date, count, tier } = parsed;

            if (date === today) {
                // Check if user just upgraded (Stored as Free, now is Muhsinin)
                if ((!tier || tier === 'free') && isMuhsinin) {
                    // Update tier to muhsinin but keep current usage count
                    setDailyCount(count);
                    setLastResetDate(today);
                    storage.set(STORAGE_KEYS.AI_USAGE as any, JSON.stringify({
                        date: today,
                        count: count,
                        tier: 'muhsinin'
                    }));
                } else {
                    // Normal Load
                    setDailyCount(count);
                    setLastResetDate(date);
                }
            } else {
                // New Day Reset
                setDailyCount(0);
                setLastResetDate(today);
                storage.set(STORAGE_KEYS.AI_USAGE as any, JSON.stringify({ date: today, count: 0, tier: currentTier }));
            }
        } else {
            // Initial Start
            setLastResetDate(today);
            setDailyCount(0);
            storage.set(STORAGE_KEYS.AI_USAGE as any, JSON.stringify({ date: today, count: 0, tier: currentTier }));
        }
    }, [isMuhsinin, status]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Handle New Chat
    const handleNewChat = () => {
        const newSession = createNewSession();
        setActiveSessionId(newSession.id);
        setMessages([]); // Empty messages for new chat
        setShowHistory(false);
        setIsTyping(false);
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
    const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();

        // Optimistic UI
        const updatedSessions = sessions.filter(s => s.id !== sessionId);
        setSessions(updatedSessions);

        // Local Delete
        deleteSession(sessionId);

        // Server Delete
        if (status === "authenticated") {
            try {
                await fetch(`/api/mentor-ai/history/${sessionId}`, { method: "DELETE" });
            } catch (e) {
                console.error("Failed to delete session on server", e);
            }
        }

        if (activeSessionId === sessionId) {
            if (updatedSessions.length > 0) {
                handleSwitchSession(updatedSessions[0].id);
            } else {
                handleNewChat();
            }
        }
    };

    // Helper to Save to Server (Debounced ideally, but simple for now: save on every AI response)
    const saveSessionToServer = async (session: ChatSession) => {
        if (status !== "authenticated") return;
        try {
            await fetch("/api/mentor-ai/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(session)
            });
        } catch (e) {
            console.error("Failed to save session to server", e);
        }
    };

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        // CHECK RATE LIMIT
        if (dailyCount >= DAILY_LIMIT) {
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
        const newCount = dailyCount + 1;
        setDailyCount(newCount);
        storage.set(STORAGE_KEYS.AI_USAGE as any, JSON.stringify({
            date: lastResetDate,
            count: newCount,
            tier: isMuhsinin ? 'muhsinin' : 'free'
        }));

        try {
            // Get AI Response...
            const context = {
                name: profile.name || "Hamba Allah",
                prayerStreak: stats.streakDays,
                lastPrayer: "Unknown"
            };

            // Only send last 10 messages context to save tokens/complexity
            // Use 'messages' (previous) instead of 'newMessages' (current) to avoid redundancy
            const chatHistoryContext = messages
                .slice(-10)
                .map(msg => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content
                }));

            const response = await retryWithBackoff(
                () => askMentor(text, context, chatHistoryContext),
                { maxRetries: 2, initialDelay: 1000 }
            );

            // Revert quota if the response is a known error message
            const isErrorMsg = response.startsWith("Maaf,") || response.startsWith("Wah,") || response.startsWith("Pesan ");

            if (isErrorMsg) {
                setDailyCount(prev => {
                    const reverted = Math.max(0, prev - 1);
                    const todayStr = new Date().toDateString();
                    storage.set(STORAGE_KEYS.AI_USAGE as any, JSON.stringify({
                        date: todayStr,
                        count: reverted,
                        tier: isMuhsinin ? 'muhsinin' : 'free'
                    }));
                    return reverted;
                });
            } else {
                trackAIQuery();
            }

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
            saveSessionToServer(currentSession); // SYNC TO SERVER

            // Update session list order
            setSessions(prev => {
                const updated = prev.map(s => s.id === currentSession!.id ? currentSession! : s);
                return updated.sort((a, b) => b.updatedAt - a.updatedAt);
            });

        } catch (error: any) {
            // Revert quota on actual exception
            setDailyCount(prev => {
                const reverted = Math.max(0, prev - 1);
                const todayStr = new Date().toDateString();
                storage.set(STORAGE_KEYS.AI_USAGE as any, JSON.stringify({
                    date: todayStr,
                    count: reverted,
                    tier: isMuhsinin ? 'muhsinin' : 'free'
                }));
                return reverted;
            });

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

    // --- RENDER ---

    // 1. Access Control Check
    if (status === "unauthenticated") {
        return (
            <div className={cn(
                "min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans",
                isDaylight ? "bg-[#f8fafc]" : "bg-black text-white"
            )}>
                {/* Background Pattern */}
                {!isDaylight && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-80" />}
                <div className={cn(
                    "absolute top-0 left-0 right-0 h-64 blur-3xl pointer-events-none",
                    isDaylight ? "bg-emerald-500/10" : "bg-[rgb(var(--color-primary))]/20"
                )} />

                <div className="relative z-10 max-w-sm w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-20 h-20 bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-[rgb(var(--color-primary))]/30 rotate-3">
                        <Lock className="w-10 h-10 text-white" />
                    </div>

                    <div className="space-y-3">
                        <h1 className={cn(
                            "text-2xl font-bold",
                            isDaylight ? "text-slate-900" : "bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
                        )}>
                            {(t as any).tanyaLoginTitle || "Login Diperlukan"}
                        </h1>
                        <p className={cn(
                            "leading-relaxed text-sm",
                            isDaylight ? "text-slate-500" : "text-white/60"
                        )}>
                            {(t as any).tanyaLoginDesc || "Fitur Tanya Nawaitu hanya tersedia untuk pengguna yang sudah login."}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => signIn('google')}
                            className={cn(
                                "w-full h-12 font-bold rounded-xl transition-all flex items-center justify-center gap-3",
                                isDaylight
                                    ? "bg-white border border-slate-200 text-slate-900 shadow-sm hover:bg-slate-50"
                                    : "bg-white text-slate-900 hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            )}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            {(t as any).profileAuthButton || "Login dengan Google"}
                        </button>

                        <Link
                            href="/"
                            className={cn(
                                "block text-sm transition-colors",
                                isDaylight ? "text-slate-400 hover:text-slate-600" : "text-white/40 hover:text-white"
                            )}
                        >
                            {(t as any).onboardingBack || "Kembali"}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Loading State (Reduced priority - we allow the page to show cached data even while session is loading)
    // Removed full-page blocking spinner to improve perceived performance

    return (
        <div className={cn(
            "h-screen h-[100dvh] flex flex-col font-sans relative overflow-hidden",
            isDaylight ? "bg-[#f0f4f8] text-slate-900" : "bg-black text-white"
        )}>
            {/* Header */}
            <div className={cn(
                "fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b",
                isDaylight ? "bg-white/80 border-slate-200/60" : "bg-black/80 border-white/10"
            )}>
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Back Button */}
                        <Link href="/" className={cn(
                            "p-2 -ml-2 rounded-full transition-colors",
                            isDaylight ? "hover:bg-slate-100 text-slate-900" : "hover:bg-white/10 text-white"
                        )}>
                            <ArrowLeft className="w-5 h-5" />
                        </Link>

                        {/* Title & Status */}
                        <div>
                            <h1 className={cn(
                                "text-sm font-bold flex items-center gap-1.5",
                                isDaylight ? "text-slate-900" : "text-white"
                            )}>
                                Tanya Nawaetu
                                {isMuhsinin && <Sparkles className="w-3 h-3 text-[rgb(var(--color-primary))]" />}
                            </h1>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] text-[rgb(var(--color-primary-light))] flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    Online
                                </p>
                                {isInfaqLoading ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/30 animate-pulse">
                                        Loading...
                                    </span>
                                ) : (
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1",
                                        dailyCount >= DAILY_LIMIT
                                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                                            : isDaylight
                                                ? "bg-slate-100 text-slate-500 border-slate-200"
                                                : "bg-white/5 text-white/50 border-white/10"
                                    )}>
                                        <span className={cn("w-1.5 h-1.5 rounded-full", dailyCount >= DAILY_LIMIT ? "bg-red-500" : "bg-emerald-500")} />
                                        {Math.max(0, DAILY_LIMIT - dailyCount)} Credit
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions: History & New Chat */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowHistory(true)}
                            className={cn(
                                "p-2 rounded-full transition-colors",
                                isDaylight ? "hover:bg-slate-100 text-slate-600" : "hover:bg-white/10 text-white/70"
                            )}
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
            )}

            {/* Chat Area */}
            <div className="flex-1 pt-20 pb-24 px-4 max-w-md mx-auto w-full space-y-4 overflow-y-auto">
                {messages.length === 0 ? (
                    // Empty State / Greeting
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-700 min-h-[calc(100vh-250px)]">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] flex items-center justify-center mb-6 shadow-xl shadow-[rgb(var(--color-primary))]/20">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h2 className={cn(
                            "text-xl font-bold mb-2",
                            isDaylight ? "text-slate-900" : "text-white"
                        )}>
                            Assalamu'alaikum, {profile.name?.split(' ')[0] || "Teman"}!
                        </h2>
                        <p className={cn(
                            "text-sm max-w-[260px] leading-relaxed mb-8",
                            isDaylight ? "text-slate-500" : "text-white/60"
                        )}>
                            Saya asisten AI Nawaetu. Ada yang bisa saya bantu terkait ibadah atau agama hari ini?
                        </p>

                        {/* Quick Prompts */}
                        <div className="grid grid-cols-1 gap-2 w-full max-w-[300px]">
                            {QUICK_PROMPTS.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(prompt)}
                                    className={cn(
                                        "p-3 rounded-xl border text-left text-sm transition-all flex items-center justify-between group",
                                        isDaylight
                                            ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-200"
                                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-white/80"
                                    )}
                                >
                                    {prompt}
                                    <Send className={cn(
                                        "w-3 h-3 transition-all -translate-x-2 group-hover:translate-x-0",
                                        isDaylight ? "text-emerald-500 opacity-0 group-hover:opacity-100" : "text-white/0 group-hover:text-[rgb(var(--color-primary))]"
                                    )} />
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
                                        {(t as any).tanyaLimitReached || "Kuota Habis"}
                                    </p>
                                    <p className={cn(
                                        "text-xs leading-tight",
                                        isDaylight ? "text-slate-500" : "text-slate-400"
                                    )}>
                                        {(t as any).tanyaUpgradeHint || "Tunggu besok atau Infaq untuk 5x kuota."}
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
                                {(t as any).tanyaInfaqButton || "Berinfaq"}
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

            <DonationModal
                isOpen={showLimitBlocking}
                onClose={() => setShowLimitBlocking(false)}
                headerTitle={isMuhsinin ? (t as any).tanyaDailyLimit : (t as any).tanyaUnlockPremium}
                headerDescription={isMuhsinin
                    ? (t as any).tanyaLimitReached + " " + (t as any).tanyaLimitReset
                    : (t as any).tanyaLimitReached + " " + (t as any).tanyaUpgradeHint}
            />
        </div>
    );
}
