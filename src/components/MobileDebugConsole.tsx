"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { useLocale } from "@/context/LocaleContext";

interface LogEntry {
    message: string;
    type: "log" | "error" | "warn" | "info";
    timestamp: number;
}

const MobileDebugConsole = () => {
    const { t } = useLocale();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Toggle visibility with secret shortcut: 3 rapid clicks on a specific area 
        // Or just check if development
        if (process.env.NODE_ENV === "development") {
            setIsVisible(true);
        }

        // Hidden override: check localStorage
        const forceDev = typeof window !== "undefined" && localStorage.getItem("nawaetu_debug") === "true";
        if (forceDev) setIsVisible(true);

        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        const addLog = (message: any, type: "log" | "error" | "warn" | "info" = "log") => {
            let logMsg = "";
            try {
                logMsg = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
            } catch (e) {
                logMsg = String(message);
            }

            setLogs((prev) => [...prev.slice(-100), {
                message: logMsg,
                type,
                timestamp: Date.now()
            }]);

            // Also call original console method
            if (type === "log") originalLog(message);
            else if (type === "error") originalError(message);
            else if (type === "warn") originalWarn(message);
            else if (type === "info") originalInfo(message);
        };

        console.log = (msg) => addLog(msg, "log");
        console.error = (msg) => addLog(msg, "error");
        console.warn = (msg) => addLog(msg, "warn");
        console.info = (msg) => addLog(msg, "info");

        // Catch unhandled errors
        const handleError = (event: ErrorEvent) => {
            addLog(event.message, "error");
        };

        const handleRejection = (event: PromiseRejectionEvent) => {
            addLog(`Promise Rejected: ${event.reason}`, "error");
        };

        window.addEventListener("error", handleError);
        window.addEventListener("unhandledrejection", handleRejection);

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
            console.info = originalInfo;
            window.removeEventListener("error", handleError);
            window.removeEventListener("unhandledrejection", handleRejection);
        };
    }, []);

    useEffect(() => {
        if (isOpen && logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs, isOpen]);

    if (!isVisible) return null;

    return (
        <>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-20 right-4 z-[100] w-10 h-10 bg-blue-600/80 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg border border-white/20 active:scale-95 transition-all cursor-pointer"
                    aria-label="Open Debug Console"
                >
                    <span className="text-xl">🐛</span>
                    {logs.filter(l => l.type === 'error').length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[8px] items-center justify-center font-bold">
                                {logs.filter(l => l.type === 'error').length}
                            </span>
                        </span>
                    )}
                </button>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent
                    className="max-w-[95vw] w-full h-[80vh] bg-black/95 border-blue-500/50 p-0 flex flex-col overflow-hidden gap-0 rounded-2xl"
                    showCloseButton={false}
                >
                    <DialogTitle className="sr-only">
                        {(t as any).debugConsoleTitle || "Debug Console"}
                    </DialogTitle>

                    {/* Custom Header */}
                    <div className="flex items-center justify-between p-3 border-b border-blue-500/30 bg-blue-500/10">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-blue-400">
                                {((t as any).debugConsoleTitle || "Debug Console").toUpperCase()}
                            </span>
                            <span className="text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300">
                                {logs.length} entries
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setLogs([])}
                                className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-gray-300 transition-colors cursor-pointer"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    {/* Logs List */}
                    <div className="flex-1 overflow-auto p-4 font-mono text-[10px] space-y-2 scrollbar-hide">
                        {logs.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-white/20 italic">
                                No logs captured yet...
                            </div>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className="flex flex-col gap-0.5 border-b border-white/5 pb-2 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-white/40">
                                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                        <span className={cn(
                                            "text-[9px] font-black px-1 rounded",
                                            log.type === "error" ? "bg-red-500/20 text-red-500" :
                                                log.type === "warn" ? "bg-yellow-500/20 text-yellow-500" :
                                                    log.type === "info" ? "bg-blue-500/20 text-blue-500" :
                                                        "bg-gray-500/20 text-gray-400"
                                        )}>
                                            {log.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <pre className="text-white whitespace-pre-wrap break-all pl-2 border-l border-white/5 mt-1 leading-relaxed">
                                        {log.message}
                                    </pre>
                                </div>
                            ))
                        )}
                        <div ref={logEndRef} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MobileDebugConsole;
