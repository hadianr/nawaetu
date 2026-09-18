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

import { Crown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import UserProfileDialog from "@/components/UserProfileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Session } from "next-auth";

interface ProfileCardProps {
    status: "authenticated" | "loading" | "unauthenticated";
    session: Session | null;
    hasCachedProfile: boolean;
    isMuhsinin: boolean;
    userAvatar: string | null;
    userName: string;
    userTitle: string;
    isAuthenticated: boolean;
    refreshProfile: () => void;
}

export default function ProfileCard({
    status,
    session,
    hasCachedProfile,
    isMuhsinin,
    userAvatar,
    userName,
    userTitle,
    isAuthenticated,
    refreshProfile,
}: ProfileCardProps) {
    if (status === "loading" && !hasCachedProfile) {
        return (
            <div className="w-full p-4 bg-[rgb(var(--color-surface-subtle))]/60 border border-[rgb(var(--color-border))]/20 rounded-2xl flex items-center gap-4 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-[rgb(var(--color-border))]/20" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-[rgb(var(--color-border))]/20 rounded" />
                    <div className="h-3 w-20 bg-[rgb(var(--color-border))]/20 rounded" />
                </div>
            </div>
        );
    }

    return (
        <UserProfileDialog onProfileUpdate={refreshProfile}>
            <div className="w-full p-4 bg-gradient-to-r from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary-dark))]/30 border border-[rgb(var(--color-primary))]/20 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-[rgb(var(--color-primary))]/40 transition-all group">
                <div className="relative">
                    <div className={cn(
                        "h-12 w-12 rounded-full border-2 flex items-center justify-center text-lg font-bold overflow-hidden p-0.5 transition-all",
                        "bg-[rgb(var(--color-primary-light))]/30 border-[rgb(var(--color-primary))]/30 text-[rgb(var(--color-primary-strong))]"
                    )}>
                        <Avatar className="w-full h-full rounded-full">
                            <AvatarImage src={userAvatar || session?.user?.image || ""} className="object-cover" />
                            <AvatarFallback className={cn(
                                "text-lg font-bold",
                                "bg-[rgb(var(--color-primary-light))]/30 text-[rgb(var(--color-primary-strong))]"
                            )}>
                                {(userName || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    {(isMuhsinin || session?.user?.isMuhsinin) && (
                        <div className={cn(
                            "absolute -top-1 -right-1 rounded-full p-0.5 border-2 z-10 shadow-lg transition-all",
                            "bg-[rgb(var(--color-primary))] border-[rgb(var(--color-surface))]"
                        )}>
                            <Crown className="w-2.5 h-2.5 text-[rgb(var(--color-primary-foreground))] fill-[rgb(var(--color-primary-foreground))]" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[rgb(var(--color-text-strong))] truncate group-hover:text-[rgb(var(--color-primary))] transition-colors">{userName}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[rgb(var(--color-primary-light))]/70">{userTitle}</span>
                        {!isAuthenticated && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))]/20 text-[rgb(var(--color-text-muted))]">
                                Guest
                            </span>
                        )}
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-primary))] transition-colors flex-shrink-0" />
            </div>
        </UserProfileDialog>
    );
}
