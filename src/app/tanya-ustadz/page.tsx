"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, User, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserActivity, useUserProfile } from "@/lib/activity-tracker";
import { askUstadz } from "./ai-action";
import { ChatMessage } from "@/lib/mock-ai";
import { saveChatHistory, loadChatHistory } from "@/lib/chat-storage";
import { retryWithBackoff } from "@/lib/retry-helper";
import { getCurrentTimeContext, getTimeSensitiveGreeting } from "@/lib/time-context";
import { parseAIResponse, formatMarkdown } from "@/lib/message-parser";
import { trackAIQuery } from "@/lib/analytics";

const QUICK_PROMPTS = [
    "Saya merasa malas sholat...",
    "Sedang banyak pikiran",
    "Tips khusyuk?",
    "Apa keutamaan subuh?",
];

export default function TanyaUstadzPage() {
    const { stats } = useUserActivity();
    const { profile } = useUserProfile();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize: Load chat history or show greeting
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Load chat history from localStorage on mount
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            const storedMessages = loadChatHistory();

            if (storedMessages.length > 0) {
                // Restore previous chat
                setMessages(storedMessages);
            } else if (profile.name) {
                // Show greeting for new chat
                setIsTyping(true);
                const context = {
                    name: profile.name || "Hamba Allah",
                    prayerStreak: stats.streakDays,
                    lastPrayer: "Subuh"
                };

                // Get time context for greeting
                const timeCtx = getCurrentTimeContext();

                // Try to get AI greeting with retries, fall back to static greeting
                const getGreetingWithFallback = async (retries = 3): Promise<string> => {
                    for (let i = 0; i < retries; i++) {
                        try {
                            const response = await askUstadz("berikan salam pembuka yang hangat", context, [], timeCtx);
                            // If response is an error message, throw to retry
                            if (response.includes("kendala teknis") || response.includes("sibuk banget")) {
                                throw new Error("API error response");
                            }
                            return response;
                        } catch (error) {
                            console.log(`Initial greeting attempt ${i + 1} failed, retrying...`);
                            if (i < retries - 1) {
                                // Wait before retry (exponential backoff)
                                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                            }
                        }
                    }

                    // All retries failed, return static greeting based on time
                    const { currentPeriod } = timeCtx;
                    const staticGreetings: Record<string, string> = {
                        subuh: `Assalamu'alaikum kak! 🙏 Semoga hari ini menjadi hari yang berkah dan penuh dengan kebaikan. Aku senang kamu mau ngobrol tentang ibadah dan spiritualitas Islam. *Mari kita mulai dengan hati yang bersih dan penuh harapan!* ⭐`,
                        pagi: `Assalamu'alaikum kak! ☀️ Alhamdulillah pagi yang cerah! Semoga hari ini penuh berkah. Aku siap menemani kamu dalam perjalanan spiritualmu.`,
                        siang: `Assalamu'alaikum kak! 🌤️ Gimana harinya? Semoga lancar ya. Aku di sini kalau kamu mau diskusi tentang ibadah atau spiritualitas Islam.`,
                        sore: `Assalamu'alaikum kak! 🌅 Alhamdulillah hari ini penuh berkah ya. Aku siap menemani diskusi spiritualmu.`,
                        malam: `Assalamu'alaikum kak! 🌙 Semoga harimu menyenangkan. Mau curhat atau tanya-tanya seputar ibadah? Aku siap dengerin~`
                    };

                    return staticGreetings[currentPeriod as keyof typeof staticGreetings] || staticGreetings.pagi;
                };

                getGreetingWithFallback().then((response) => {
                    const greeting = {
                        id: 'init-1',
                        role: 'assistant' as const,
                        content: response,
                        timestamp: Date.now()
                    };
                    setMessages([greeting]);
                    setIsTyping(false);
                }).catch((error) => {
                    const fallback: ChatMessage = {
                        id: 'fallback-error',
                        role: 'assistant',
                        content: "Assalamu'alaikum! Mohon maaf sepertinya ada sedikit gangguan koneksi. Tapi Ustadz tetap siap menemani diskusimu. Ada yang ingin ditanyakan?",
                        timestamp: Date.now()
                    };
                    setMessages([fallback]);
                    setIsTyping(false);
                });
            }
        }
    }, [profile.name, stats.streakDays]);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            saveChatHistory(messages);
        }
    }, [messages]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);


    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        // Add User Message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // Get AI Response from Gemini with chat history
            const context = {
                name: profile.name || "Hamba Allah",
                prayerStreak: stats.streakDays,
                lastPrayer: "Unknown"
            };

            // Convert messages to chat history format (exclude the greeting)
            const chatHistory = messages
                .filter(msg => msg.id !== 'init-1') // Exclude initial greeting
                .map(msg => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content
                }));

            // Retry API call with exponential backoff for better reliability
            const response = await retryWithBackoff(
                () => askUstadz(text, context, chatHistory),
                { maxRetries: 2, initialDelay: 1000 }
            );

            // Track usage
            trackAIQuery();

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error: any) {
            console.error("Error getting AI response:", error);

            // Show user-friendly error message
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: error?.message || "Maaf, lagi ada kendala teknis. Coba lagi ya 🙏",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center border border-[rgb(var(--color-primary))]/30">
                                    <Sparkles className="w-5 h-5 text-[rgb(var(--color-primary-light))]" />
                                </div>
                                {/* Online indicator */}
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-white">Ustadz Nawaetu</h1>
                                <p className="text-xs text-[rgb(var(--color-primary-light))] flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Online • AI Mentor
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 pt-24 pb-64 px-4 max-w-md mx-auto w-full space-y-4">
                {/* Date Divider (Mock) */}
                <div className="flex justify-center my-4">
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded-full text-white/40">Hari Ini</span>
                </div>

                {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div key={msg.id} className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
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
                                    "p-3 rounded-2xl text-sm leading-relaxed",
                                    isUser
                                        ? "bg-[rgb(var(--color-primary))] text-white rounded-tr-none px-4"
                                        : "bg-white/10 text-white/90 rounded-tl-none border border-white/5"
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
                                    <span className="text-[10px] opacity-40 mt-1 block text-right">
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
                            <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-1 h-10">
                                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 pb-16 md:pb-12 pt-4 z-[60]">
                <div className="max-w-md mx-auto px-4 space-y-3">
                    {/* Follow-up Questions or Quick Prompts */}
                    {(() => {
                        // Get last AI message (skip initial greeting)
                        const lastAIMessage = [...messages]
                            .reverse()
                            .find(m => m.role === 'assistant' && m.id !== 'init-1');
                        const followUpQuestions = lastAIMessage
                            ? parseAIResponse(lastAIMessage.content).followUpQuestions
                            : [];

                        // Show follow-up if available, otherwise show quick prompts for new chats
                        if (followUpQuestions.length > 0) {
                            return (
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                                    {followUpQuestions.map((question, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSend(question)}
                                            disabled={isTyping}
                                            className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[rgb(var(--color-primary))]/50 rounded-full text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1.5 flex-shrink-0"
                                        >
                                            <span className="text-[rgb(var(--color-primary-light))]">🔹</span>
                                            <span>{question}</span>
                                        </button>
                                    ))}
                                </div>
                            );
                        } else if (messages.length < 3) {
                            return (
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                                    {QUICK_PROMPTS.map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSend(prompt)}
                                            disabled={isTyping}
                                            className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-white/70 hover:text-white transition-colors flex-shrink-0"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            );
                        }
                        return null;
                    })()}

                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-3xl p-1.5 pl-4 focus-within:border-[rgb(var(--color-primary))]/50 focus-within:ring-1 focus-within:ring-[rgb(var(--color-primary))]/50 transition-all"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ceritakan masalah ibadahmu..."
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
                </div>
            </div>
        </div>
    );
}
