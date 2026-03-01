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

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Star } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const DISMISSED_KEY = "maa_voting_banner_dismissed";

export default function VotingBanner() {
    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(DISMISSED_KEY);
        if (!dismissed) {
            setVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem(DISMISSED_KEY, "true");
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.96 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full relative overflow-hidden rounded-2xl mb-2"
                >
                    {/* Background */}
                    {isDaylight ? (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border border-emerald-200 rounded-2xl z-0" />
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-[#0a2e1a] z-0" />
                            {/* Islamic geometric pattern overlay */}
                            <div
                                className="absolute inset-0 opacity-[0.05] z-0"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M30 0l8.66 5v10L30 20l-8.66-5V5L30 0zm0 40l8.66 5v10L30 60l-8.66-5V45L30 40zM0 20l8.66 5v10L0 40l-8.66-5V25L0 20zm60 0l8.66 5v10L60 40l-8.66-5V25L60 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                }}
                            />
                            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-emerald-400/10 rounded-full blur-[40px] z-0" />
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-amber-400/10 rounded-full blur-[30px] z-0" />
                        </>
                    )}

                    {/* Content */}
                    <div className="relative z-10 p-4 pr-10">
                        {/* Label */}
                        <div className="flex items-center gap-1.5 mb-2">
                            <Trophy className={cn("w-3.5 h-3.5", isDaylight ? "text-amber-500" : "text-amber-400")} />
                            <span className={cn(
                                "text-[9px] font-bold uppercase tracking-[0.15em]",
                                isDaylight ? "text-amber-600" : "text-amber-400"
                            )}>
                                {t.votingBannerLabel}
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className={cn(
                            "text-[15px] font-black leading-tight mb-1",
                            isDaylight ? "text-emerald-900" : "text-white"
                        )}>
                            {t.votingBannerTitle}
                        </h2>

                        {/* Subtitle */}
                        <p className={cn(
                            "text-[11px] mb-3 leading-relaxed",
                            isDaylight ? "text-slate-500" : "text-white/70"
                        )}>
                            {t.votingBannerSubtitle}
                        </p>

                        {/* CTA Button */}
                        <a
                            href="https://award.globalsadaqah.com/profiles/327"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "inline-flex items-center gap-2 px-4 py-2 rounded-full active:scale-95 transition-all group",
                                isDaylight
                                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200"
                                    : "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)]"
                            )}
                            aria-label={t.votingBannerCta}
                        >
                            <Star className={cn(
                                "w-3.5 h-3.5",
                                isDaylight ? "text-white fill-white" : "text-emerald-900 fill-emerald-900"
                            )} />
                            <span className={cn(
                                "text-[12px] font-black",
                                isDaylight ? "text-white" : "text-emerald-900"
                            )}>
                                {t.votingBannerCta}
                            </span>
                        </a>
                    </div>

                    {/* Dismiss button */}
                    <button
                        onClick={handleDismiss}
                        aria-label="Dismiss voting banner"
                        className={cn(
                            "absolute top-3 right-3 z-20 w-6 h-6 rounded-full active:scale-90 transition-all flex items-center justify-center",
                            isDaylight
                                ? "bg-slate-100 hover:bg-slate-200 border border-slate-200"
                                : "bg-white/10 hover:bg-white/20"
                        )}
                    >
                        <X className={cn("w-3 h-3", isDaylight ? "text-slate-500" : "text-white/70")} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
