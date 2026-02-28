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

import { motion } from "framer-motion";
import { Users, Globe2, HeartHandshake } from "lucide-react";

export default function GlobalStatsWidget() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full relative overflow-hidden rounded-2xl border border-[rgb(var(--color-primary))]/20 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 via-black/20 to-transparent p-4 mb-4"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--color-primary))]/5 rounded-full blur-[40px] pointer-events-none" />

            <div className="flex items-center gap-2 mb-4">
                <Globe2 className="w-5 h-5 text-[rgb(var(--color-primary-light))]" />
                <h2 className="font-bold text-sm text-white">Global Impact</h2>
                <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">Live</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/5 border border-white/5">
                    <HeartHandshake className="w-5 h-5 text-rose-400 mb-1" />
                    <span className="text-lg font-black text-white">12.4K</span>
                    <span className="text-[9px] text-white/50 leading-tight mt-0.5">Niat Today</span>
                </div>

                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-xl mb-1">🕌</span>
                    <span className="text-lg font-black text-white">150K+</span>
                    <span className="text-[9px] text-white/50 leading-tight mt-0.5">Prayers</span>
                </div>

                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/5 border border-white/5">
                    <Users className="w-5 h-5 text-blue-400 mb-1" />
                    <span className="text-lg font-black text-white">15+</span>
                    <span className="text-[9px] text-white/50 leading-tight mt-0.5">Countries</span>
                </div>
            </div>

            <div className="mt-3 text-center">
                <p className="text-[10px] text-[rgb(var(--color-primary-light))]/80 italic">
                    "Uniting the Ummah, one intention at a time."
                </p>
            </div>
        </motion.div>
    );
}
