"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";

interface LogEntry {
    id: string;
    time: string;
    message: string;
    type: "log" | "error" | "warn" | "info";
}

export default function MobileDebugConsole() {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if debug mode is enabled
        const debugEnabled = localStorage.getItem('nawaetu_debug') === 'true';
        setIsVisible(debugEnabled);

        // Capture console logs
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        const addLog = (message: string, type: "log" | "error" | "warn" | "info" = "log") => {
            const now = new Date();
            const time = now.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });

            // Defer state update to avoid "Cannot update a component while rendering" error
            setTimeout(() => {
                setLogs((prev) => {
                    const newLogs = [
                        ...prev,
                        {
                            id: `${Date.now()}-${Math.random()}`,
                            time,
                            message: String(message),
                            type,
                        },
                    ];
                    // Keep only last 50 logs to avoid memory issues
                    return newLogs.slice(-50);
                });
            }, 0);

            // Also call original console method
            if (type === "log") originalLog(message);
            else if (type === "error") originalError(message);
            else if (type === "warn") originalWarn(message);
        };

        console.log = (...args) => {
            addLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), "log");
        };

        console.error = (...args) => {
            addLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), "error");
        };

        console.warn = (...args) => {
            addLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), "warn");
        };

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    // Listen for toggle (triple tap on status bar area or via localStorage)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Alt+D to toggle debug console
            if (e.altKey && e.key === "d") {
                setIsOpen((prev) => !prev);
                setIsVisible(true);
                localStorage.setItem('nawaetu_debug', 'true');
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, []);

    if (!isVisible) {
        return (
            <button
                onClick={() => {
                    localStorage.setItem('nawaetu_debug', 'true');
                    setIsVisible(true);
                    setIsOpen(true);
                }}
                className="fixed bottom-20 right-4 z-50 w-12 h-12 bg-blue-600/80 rounded-full flex items-center justify-center text-white text-lg font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg"
                title="Enable Debug Console (Alt+D to toggle, long press to open)"
            >
                🐛
            </button>
        );
    }

    return (
        <div
            className={`fixed z-50 transition-all duration-300 ${isOpen
                    ? "inset-0 bg-black/40"
                    : "bottom-20 right-4 w-12 h-12"
                }`}
            onClick={() => isOpen && setIsOpen(false)}
        >
            <div
                className={`absolute transition-all duration-300 ${isOpen
                        ? "inset-4 md:right-1/4 md:left-auto md:w-1/2 lg:w-1/3"
                        : "bottom-4 right-4 w-12 h-12"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {isOpen ? (
                    <div className="flex flex-col h-full bg-black/95 border border-blue-500/50 rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 bg-blue-900/50 border-b border-blue-500/30">
                            <span className="text-xs font-bold text-blue-300">
                                🐛 Debug Console ({logs.length})
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-blue-600/50 rounded"
                            >
                                <X className="w-4 h-4 text-blue-300" />
                            </button>
                        </div>

                        {/* Logs */}
                        <div className="flex-1 overflow-y-auto font-mono text-[10px] p-2 space-y-0.5">
                            {logs.length === 0 ? (
                                <div className="text-gray-500 text-center py-4">
                                    No logs yet...
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <div
                                        key={log.id}
                                        className={`text-xs ${log.type === "error"
                                                ? "text-red-400"
                                                : log.type === "warn"
                                                    ? "text-yellow-400"
                                                    : log.type === "info"
                                                        ? "text-blue-400"
                                                        : "text-green-400"
                                            }`}
                                    >
                                        <span className="text-gray-600">[{log.time}]</span> {log.message}
                                    </div>
                                ))
                            )}
                            <div ref={logsEndRef} />
                        </div>

                        {/* Footer */}
                        <div className="flex gap-2 p-2 bg-blue-900/50 border-t border-blue-500/30">
                            <button
                                onClick={() => setLogs([])}
                                className="flex-1 text-xs px-2 py-1 bg-red-600/50 hover:bg-red-600 text-red-100 rounded"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.setItem('nawaetu_debug', 'false');
                                    setIsVisible(false);
                                    setIsOpen(false);
                                }}
                                className="flex-1 text-xs px-2 py-1 bg-gray-600/50 hover:bg-gray-600 text-gray-100 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-full h-full bg-blue-600/80 hover:bg-blue-700 rounded-full flex items-center justify-center text-white text-lg font-bold active:scale-95 transition-all"
                        title="Open Debug Console"
                    >
                        🐛
                    </button>
                )}
            </div>
        </div>
    );
}
