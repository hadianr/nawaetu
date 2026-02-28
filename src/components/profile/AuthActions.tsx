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

import { Button } from "@/components/ui/button";
import { Settings, Share2, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";

interface AuthActionsProps {
    isDaylight: boolean;
    isAuthenticated: boolean;
    handleLogin: () => void;
    handleShareApp: () => void;
    showLogoutConfirm: boolean;
    setShowLogoutConfirm: (show: boolean) => void;
    handleLogout: () => void;
}

export function AuthActions({
    isDaylight,
    isAuthenticated,
    handleLogin,
    handleShareApp,
    showLogoutConfirm,
    setShowLogoutConfirm,
    handleLogout
}: AuthActionsProps) {
    const { t } = useLocale();

    return (
        <>
            {/* 4. Auth Call to Action (If Guest) */}
            {!isAuthenticated && (
                <div className={cn(
                    "mb-6 border rounded-xl p-4 text-center transition-all",
                    isDaylight ? "bg-emerald-50 border-emerald-100" : "bg-[rgb(var(--color-secondary))]/30 border-white/5"
                )}>
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 transition-all",
                        isDaylight ? "bg-emerald-100" : "bg-[rgb(var(--color-primary))]/20"
                    )}>
                        <Settings className={cn("w-5 h-5", isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light)) ]")} />
                    </div>
                    <h3 className={cn("text-sm font-bold mb-1", isDaylight ? "text-slate-900" : "text-white")}>{(t as any).profileAuthTitle}</h3>
                    <p className={cn("text-xs mb-4 leading-relaxed", isDaylight ? "text-slate-500" : "text-slate-400")}>{(t as any).profileAuthDesc}</p>
                    <Button
                        onClick={handleLogin}
                        className={cn(
                            "w-full font-bold h-10 flex items-center gap-2 shadow-lg transition-all",
                            isDaylight
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                                : "bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary))]/90"
                        )}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {(t as any).profileAuthButton}
                    </Button>
                </div>
            )}

            {/* 5. Menu Items */}
            <div className="space-y-1">
                <button onClick={handleShareApp} className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-colors group",
                    isDaylight ? "hover:bg-slate-50" : "hover:bg-white/5"
                )}>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            isDaylight ? "bg-emerald-50" : "bg-[rgb(var(--color-primary))]/10"
                        )}>
                            <Share2 className={cn("w-4 h-4 transition-colors", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light)) ] group-hover:text-[rgb(var(--color-primary))]")} />
                        </div>
                        <span className={cn("text-sm font-medium transition-colors", isDaylight ? "text-slate-600 group-hover:text-slate-900" : "text-slate-300 group-hover:text-white")}>{(t as any).profileShareApp}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                </button>

                {isAuthenticated && (
                    !showLogoutConfirm ? (
                        <button onClick={() => setShowLogoutConfirm(true)} className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl transition-colors group mt-2 border border-transparent",
                            isDaylight ? "hover:bg-red-50 hover:border-red-100" : "hover:bg-red-500/10 hover:border-red-500/20"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors" />
                                </div>
                                <span className={cn("text-sm font-medium transition-colors", isDaylight ? "text-red-600 group-hover:text-red-700" : "text-red-400 group-hover:text-red-300")}>{(t as any).profileLogout}</span>
                            </div>
                        </button>
                    ) : (
                        <div className={cn(
                            "mt-2 p-3 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200 border",
                            isDaylight ? "bg-red-50 border-red-100" : "bg-red-500/10 border-red-500/20"
                        )}>
                            <p className={cn(
                                "text-xs mb-3 text-center font-medium",
                                isDaylight ? "text-red-600" : "text-red-200"
                            )}>{(t as any).profileLogoutConfirm}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleLogout}
                                    className={cn(
                                        "flex-1 h-8 rounded-lg text-xs font-bold transition-all active:scale-[0.98] shadow-sm",
                                        isDaylight
                                            ? "bg-red-500/30 hover:bg-red-500/40 text-red-600 shadow-none"
                                            : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 shadow-none"
                                    )}
                                >
                                    {(t as any).profileLogoutConfirmYes}
                                </button>
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className={cn(
                                        "flex-1 h-8 rounded-lg text-xs font-medium transition-all active:scale-[0.98]",
                                        isDaylight
                                            ? "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-100"
                                            : "bg-white/5 hover:bg-white/10 text-slate-400"
                                    )}
                                >
                                    {(t as any).profileLogoutConfirmNo}
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>
        </>
    );
}
