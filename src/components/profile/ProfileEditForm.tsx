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
import { useLocale, type TranslationTree } from "@/context/LocaleContext";
import { AppIcon } from "@/components/ui/AppIcon";

interface ProfileEditFormProps {
    editName: string;
    setEditName: (name: string) => void;
    editGender: "male" | "female" | null;
    setEditGender: (gender: "male" | "female") => void;
    handleSaveProfile: () => void;
    isUpdating: boolean;
    setIsEditing: (isEditing: boolean) => void;
}

export function ProfileEditForm({
    editName,
    setEditName,
    editGender,
    setEditGender,
    handleSaveProfile,
    isUpdating,
    setIsEditing
}: ProfileEditFormProps) {
    const { t } = useLocale();
    const translations = t as TranslationTree;

    return (
        <div className="space-y-4 mb-2 pr-2">
            <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-[rgb(var(--color-text-muted))]">{translations.profileNameLabel}</Label>
                <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={cn(
                        "h-10 transition-all",
                        "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] focus:border-[rgb(var(--color-primary))]/50 focus:ring-[rgb(var(--color-primary))]/20"
                    )}
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-[rgb(var(--color-text-muted))]">{translations.profileGenderLabel}</Label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setEditGender('male')}
                        className={cn(
                            "flex items-center justify-center gap-2 h-10 rounded-xl border transition-all text-xs font-medium",
                            editGender === 'male'
                                ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] border-[rgb(var(--color-primary))]"
                                : "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-text-muted))]"
                        )}
                    >
                        <AppIcon name="hands" size="sm" tone="info" /> {translations.onboardingMaleLabel}
                    </button>
                    <button
                        onClick={() => setEditGender('female')}
                        className={cn(
                            "flex items-center justify-center gap-2 h-10 rounded-xl border transition-all text-xs font-medium",
                            editGender === 'female'
                                ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] border-[rgb(var(--color-primary))]"
                                : "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-text-muted))]"
                        )}
                    >
                        <AppIcon name="heart-handshake" size="sm" tone="primary" /> {translations.onboardingFemaleLabel}
                    </button>
                </div>
            </div>

            <div className={cn(
                "flex gap-2 pt-2 sticky bottom-0 pb-2 transition-all",
                "bg-[rgb(var(--color-surface))]"
            )}>
                <Button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className={cn(
                        "flex-1 h-9 font-bold transition-all shadow-lg active:scale-[0.98]",
                        "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary-foreground))] shadow-[var(--shadow-card)]"
                    )}
                >
                    {isUpdating ? translations.locationUpdating : translations.bookmarksSave}
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className={cn(
                        "h-9 text-xs transition-colors",
                        "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-primary))]/10"
                    )}
                >
                    {translations.tasbihBack}
                </Button>
            </div>
        </div>
    );
}
