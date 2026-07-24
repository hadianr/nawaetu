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

import { MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CommunityCardProps {
    t: any;
    isDaylight: boolean;
    setShowFeedbackModal: (open: boolean) => void;
}

export default function CommunityCard({ t, isDaylight, setShowFeedbackModal }: CommunityCardProps) {
    return (
        <div className={cn(
            "border rounded-2xl p-4 flex items-center justify-between transition-all",
            isDaylight
                ? "bg-slate-50 border-slate-200/50 shadow-sm"
                : "bg-white/[0.02] border-white/10"
        )}>
            <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                    <MessageSquarePlus className={cn(
                        "w-4 h-4",
                        isDaylight ? "text-slate-600" : "text-[rgb(var(--color-primary-light))]"
                    )} />
                    <span className={cn(
                        "text-sm font-bold",
                        isDaylight ? "text-slate-900" : "text-white"
                    )}>{t.feedbackCardTitle}</span>
                </div>
                <p className={cn(
                    "text-[10px] leading-relaxed",
                    isDaylight ? "text-slate-500" : "text-white/40"
                )}>
                    {t.feedbackCardDesc}
                </p>
            </div>
            <Button
                onClick={() => setShowFeedbackModal(true)}
                size="sm"
                className={cn(
                    "font-bold h-8 px-3.5 text-xs rounded-xl shadow-lg transition-all active:scale-[0.98] shrink-0",
                    isDaylight
                        ? "bg-slate-900 hover:bg-slate-800 text-white"
                        : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white shadow-[rgb(var(--color-primary))]/20"
                )}
            >
                {t.feedbackButtonCompact}
            </Button>
        </div>
    );
}
