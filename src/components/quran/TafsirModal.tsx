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

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, X } from "lucide-react";
import { type TafsirContent } from "@/lib/tafsir-api";
import { formatFootnotes } from "@/lib/quran-utils";
import { useLocale } from "@/context/LocaleContext";

interface TafsirModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    locale: string;
    content: { verseKey: string; tafsir: TafsirContent } | null;
}

export default function TafsirModal({ open, onOpenChange, locale, content }: TafsirModalProps) {
    const { t } = useLocale();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="w-[98vw] max-w-lg sm:max-w-xl max-h-[80vh] sm:max-h-[85vh] rounded-2xl sm:rounded-3xl border border-[rgb(var(--color-primary))]/20 bg-gradient-to-br from-slate-900/50 to-slate-950/40 backdrop-blur-3xl shadow-2xl shadow-black/60 p-0 overflow-hidden">
                {/* Hidden DialogTitle for accessibility */}
                <DialogTitle className="sr-only">
                    {t.quranFullExplanation || 'Full Explanation'}
                </DialogTitle>

                {/* Header */}
                <div className="relative bg-gradient-to-r from-slate-900 to-slate-800/50 border-b border-[rgb(var(--color-primary))]/20 px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary))]/40 to-[rgb(var(--color-primary))]/15 border border-[rgb(var(--color-primary))]/50 shadow-lg shadow-[rgb(var(--color-primary))]/20">
                                <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-[rgb(var(--color-primary))]" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                                    {t.quranTafsir || 'Tafsir'}
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                                    {t.quranFullExplanation || 'Full Explanation'}
                                </p>
                            </div>
                        </div>

                        {/* Custom Close Button */}
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="max-h-[calc(80vh-100px)] sm:max-h-[calc(85vh-120px)]">
                    {content && (
                        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 text-slate-200">
                            <div
                                className="text-sm sm:text-base [&>p]:mb-4 sm:[&>p]:mb-5 [&>p]:leading-relaxed sm:[&>p]:leading-loose [&>p]:text-slate-300 [&>p:first-child]:text-base sm:[&>p:first-child]:text-lg [&>p:first-child]:font-medium [&>p:first-child]:text-white/95 [&>h3]:text-base sm:[&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-5 sm:[&>h3]:mt-6 [&>h3]:mb-2 sm:[&>h3]:mb-3 [&>ul]:my-3 sm:[&>ul]:my-4 [&>ul]:ml-1 sm:[&>ul]:ml-2 [&>ul]:space-y-2 sm:[&>ul]:space-y-3 [&>ul]:pl-1 sm:[&>ul]:pl-2 [&>ol]:my-3 sm:[&>ol]:my-4 [&>ol]:ml-1 sm:[&>ol]:ml-2 [&>ol]:space-y-2 sm:[&>ol]:space-y-3 [&>ol]:pl-1 sm:[&>ol]:pl-2 [&>ol]:list-decimal [&>ol]:list-outside [&>ul]:list-disc [&>ul]:list-outside [&>li]:leading-relaxed sm:[&>li]:leading-loose [&>li]:pl-2 sm:[&>li]:pl-3 [&>li]:py-1 sm:[&>li]:py-2 [&>li]:px-2 sm:[&>li]:px-3 [&>li]:rounded-md [&>li]:bg-white/4 [&>li]:border [&>li]:border-white/10 [&>li>strong]:text-[rgb(var(--color-primary))]/95 [&>li>strong]:font-semibold [&>ol>li]:marker:text-[rgb(var(--color-primary))] [&>ol>li]:marker:font-bold [&>ul>li]:marker:text-[rgb(var(--color-primary))] [&_sup]:text-[rgb(var(--color-primary))]/85 [&_sup]:font-semibold [&>ol>li>ol]:my-2 sm:[&>ol>li>ol]:my-3 [&>ol>li>ol]:ml-2 sm:[&>ol>li>ol]:ml-3 [&>ol>li>ol]:space-y-1 sm:[&>ol>li>ol]:space-y-2 [&>ol>li>ol]:pl-0 [&>ol>li>ol]:list-lower-alpha [&>ol>li>ol]:list-outside [&>ol>li>ol>li]:bg-white/3 [&>ol>li>ol>li]:border-white/5 [&>ol>li>ol>li]:py-1 sm:[&>ol>li>ol>li]:py-1.5 [&>ol>li>ol>li]:px-2 sm:[&>ol>li>ol>li]:px-2.5 [&>ol>li>ol>li]:pl-1.5 sm:[&>ol>li>ol>li]:pl-2 [&>ol>li>ol>li]:rounded-sm [&>ol>li>ol>li]:marker:text-white/50 [&>ol>li>ol>li]:marker:font-semibold"
                                dangerouslySetInnerHTML={{ __html: formatFootnotes(content.tafsir.long) }}
                            />
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
