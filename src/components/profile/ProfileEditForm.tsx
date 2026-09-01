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

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";

interface ProfileEditFormProps {
    isDaylight: boolean;
    editName: string;
    setEditName: (name: string) => void;
    editGender: "male" | "female" | null;
    setEditGender: (gender: "male" | "female") => void;
    handleSaveProfile: () => void;
    isUpdating: boolean;
    setIsEditing: (isEditing: boolean) => void;
}

export function ProfileEditForm({
    isDaylight,
    editName,
    setEditName,
    editGender,
    setEditGender,
    handleSaveProfile,
    isUpdating,
    setIsEditing
}: ProfileEditFormProps) {
    const { t } = useLocale();

    return (
        <div className="space-y-4 mb-2 pr-2">
            <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-slate-500">{(t as any).profileNameLabel}</Label>
                <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={cn(
                        "h-10 transition-all",
                        isDaylight
                            ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                            : "bg-white/5 border-white/10 text-white focus:border-[rgb(var(--color-primary))]/50"
                    )}
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-slate-500">{(t as any).profileGenderLabel}</Label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setEditGender('male')}
                        className={cn(
                            "flex items-center justify-center gap-2 h-10 rounded-xl border transition-all text-xs font-medium",
                            editGender === 'male'
                                ? isDaylight
                                    ? "bg-emerald-500 text-white border-emerald-500"
                                    : "bg-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary))] text-white"
                                : isDaylight
                                    ? "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-600"
                                    : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-400"
                        )}
                    >
                        <span>👨</span> {(t as any).onboardingMaleLabel}
                    </button>
                    <button
                        onClick={() => setEditGender('female')}
                        className={cn(
                            "flex items-center justify-center gap-2 h-10 rounded-xl border transition-all text-xs font-medium",
                            editGender === 'female'
                                ? isDaylight
                                    ? "bg-emerald-500 text-white border-emerald-500"
                                    : "bg-[rgb(var(--color-secondary))]/30 border-[rgb(var(--color-secondary))] text-white"
                                : isDaylight
                                    ? "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-600"
                                    : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-400"
                        )}
                    >
                        <span>👩</span> {(t as any).onboardingFemaleLabel}
                    </button>
                </div>
            </div>

            <div className={cn(
                "flex gap-2 pt-2 sticky bottom-0 pb-2 transition-all",
                isDaylight ? "bg-white" : "bg-[#0F172A]"
            )}>
                <Button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className={cn(
                        "flex-1 h-9 font-bold transition-all shadow-lg active:scale-[0.98]",
                        isDaylight
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10"
                            : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 text-white"
                    )}
                >
                    {isUpdating ? (t as any).locationUpdating : (t as any).bookmarksSave}
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className={cn(
                        "h-9 text-xs transition-colors",
                        isDaylight ? "text-slate-400 hover:text-slate-600 hover:bg-slate-50" : "text-slate-400 hover:text-white"
                    )}
                >
                    {(t as any).tasbihBack}
                </Button>
            </div>
        </div>
    );
}
