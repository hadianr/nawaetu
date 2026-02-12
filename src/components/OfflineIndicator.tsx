"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useEffect, useState } from "react";
import { WifiOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OfflineIndicator() {
    const isOnline = useOnlineStatus();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setVisible(true);
        } else {
            // Delay hiding to prevent flickering or to show "Back Online" briefly if desired
            // For now, just hide immediately or nice fade out
            const timer = setTimeout(() => setVisible(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isOnline]);

    if (!visible && isOnline) return null;

    return (
        <div
            className={cn(
                "fixed bottom-[4.5rem] left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-500 transform",
                isOnline ? "translate-y-10 opacity-0" : "translate-y-0 opacity-100"
            )}
        >
            <div className="bg-black/80 backdrop-blur-md border border-red-500/30 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2.5 max-w-[90%] pointer-events-auto">
                {isOnline ? (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ) : (
                    <WifiOff className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                )}

                <span className="text-xs font-medium">
                    {isOnline ? "Terhubung kembali" : "Anda sedang offline"}
                </span>

                {!isOnline && (
                    <button
                        onClick={() => window.location.reload()}
                        className="ml-1 text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white/80 transition-colors"
                    >
                        Muat Ulang
                    </button>
                )}
            </div>
        </div>
    );
}
