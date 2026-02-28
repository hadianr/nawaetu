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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";

interface ProfileHeaderProps {
    isAuthenticated: boolean;
    isMuhsinin: boolean;
    isDaylight: boolean;
    userImage: string;
    onClose: () => void;
}

export function ProfileHeader({
    isAuthenticated,
    isMuhsinin,
    isDaylight,
    userImage,
    onClose
}: ProfileHeaderProps) {
    const { t } = useLocale();

    return (
        <div className="relative flex-none">
            <div className={cn(
                "h-24 w-full absolute top-0 left-0",
                "bg-gradient-to-r from-[rgb(var(--color-primary))]/80 to-[rgb(var(--color-secondary))]/80"
            )}>
                {/* Base Gradient & Noise */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                {/* Subtle Islamic Geometric Pattern via SVG background */}
                <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    backgroundSize: '30px'
                }}></div>

                <div className="absolute inset-0 bg-[rgb(var(--color-primary))]/10 mix-blend-overlay"></div>
            </div>

            {/* Top Actions */}
            <div className="relative z-20 flex justify-between items-center p-4">
                {!isAuthenticated ? (
                    <div className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-[10px] items-center flex gap-1 text-white">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        {(t as any).profileGuestMode}
                    </div>
                ) : (
                    <div /> // Spacer
                )}

                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4 text-white" />
                </button>
            </div>

            {/* Profile Picture Area */}
            <div className="relative z-10 px-6 pt-0 flex items-end justify-between -mt-10">
                <div className="relative">
                    <div className={cn(
                        "w-20 h-20 rounded-full p-1 transition-all",
                        isDaylight ? "bg-white shadow-sm" : "bg-[#0F172A]",
                        isMuhsinin
                            ? isDaylight ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-white" : "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0F172A]"
                            : isDaylight ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-white" : "ring-2 ring-[rgb(var(--color-primary))] ring-offset-2 ring-offset-[#0F172A]"
                    )}>
                        <Avatar className="w-full h-full rounded-full border border-white/10">
                            <AvatarImage src={userImage} className="object-cover" />
                            <AvatarFallback>NA</AvatarFallback>
                        </Avatar>
                    </div>
                    {isMuhsinin && (
                        <div className="absolute -top-3 -right-3">
                            <span className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full shadow-lg text-white transition-all",
                                isDaylight
                                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                                    : "bg-gradient-to-br from-amber-300 to-orange-500"
                            )}>
                                <Crown className="w-4 h-4 fill-white" />
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
