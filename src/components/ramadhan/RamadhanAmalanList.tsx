"use client";

import { RAMADHAN_PRACTICES } from "@/data/ramadhan-data";
import DalilBadge from "./DalilBadge";
import NiatCard from "./NiatCard";
import { useState } from "react";

export default function RamadhanAmalanList() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/20 backdrop-blur-md shadow-lg transition-all duration-300">
            {/* Header */}
            <div className="px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📿</span>
                    <h3 className="font-bold text-white text-base">Amalan Ramadhan</h3>
                </div>
                <p className="text-xs text-white/40 mt-0.5">Tap untuk lihat niat &amp; dalil</p>
            </div>

            {/* Amalan list */}
            <div className="divide-y divide-white/5">
                {RAMADHAN_PRACTICES.map((amalan) => {
                    const isExpanded = expandedId === amalan.id;
                    return (
                        <div key={amalan.id} className="transition-all duration-300">
                            {/* Amalan row */}
                            <div
                                onClick={() => setExpandedId(isExpanded ? null : amalan.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setExpandedId(isExpanded ? null : amalan.id);
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                className="w-full flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 text-left hover:bg-white/5 transition-all cursor-pointer outline-none focus-visible:bg-white/5"
                            >
                                <span className="text-xl sm:text-2xl shrink-0">{amalan.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white text-xs sm:text-sm">{amalan.title}</p>
                                    <p className="text-[10px] sm:text-xs text-white/50 truncate">{amalan.description}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <DalilBadge dalil={amalan.dalil} variant="pill" />
                                    <span className={`text-white/20 transition-transform duration-300 group-hover:text-white/50 ${isExpanded ? "rotate-180" : ""}`}>
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Expanded detail */}
                            {isExpanded && (
                                <div className="px-3 pb-4 pt-2 space-y-3 sm:px-4 sm:pb-6 sm:space-y-4 animate-in slide-in-from-top-2 fade-in duration-300 bg-black/10 backdrop-blur-sm">
                                    {/* Tips */}
                                    {amalan.tips && amalan.tips.length > 0 && (
                                        <div className="rounded-xl bg-black/20 border border-white/10 p-4 shadow-md backdrop-blur-sm">
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4">💡 Tips Amalan</p>
                                            <ul className="space-y-1.5">
                                                {amalan.tips.map((tip, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                                                        <span className="shrink-0 mt-0.5" style={{ color: "rgb(var(--color-primary-light))" }}>•</span>
                                                        <span>{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Niat */}
                                    {amalan.niat && (
                                        <NiatCard niat={amalan.niat} compact />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
