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

import { useState } from "react";
import { BookOpen, HelpCircle } from "lucide-react";
import { AppIcon } from "@/components/ui/AppIcon";
import RulingsModal from "./RulingsModal";
import FAQModal from "./FAQModal";
import { useLocale } from "@/context/LocaleContext";

export default function RamadhanGuideCard() {
    const [rulingsModalOpen, setRulingsModalOpen] = useState(false);
    const [faqModalOpen, setFaqModalOpen] = useState(false);
    const { t } = useLocale();

    return (
        <>
            <div className="relative overflow-hidden rounded-3xl border border-[rgb(var(--color-border))] bg-gradient-to-br from-[rgb(var(--color-surface-subtle))] via-[rgb(var(--color-surface))] to-transparent backdrop-blur-lg shadow-[var(--shadow-card)]">
                {/* Header */}
                <div className="px-3 pt-3 pb-2 sm:px-4 sm:pt-4">
                    <div className="flex items-center gap-2 mb-1">
                        <AppIcon name="library" size="md" tone="primary" />
                        <h3 className="font-bold text-[rgb(var(--color-text-strong))] text-sm sm:text-base">
                            {t.guideTitle || "Panduan Puasa Ramadhan"}
                        </h3>
                    </div>
                    <p className="text-xs text-[rgb(var(--color-text-muted))]">
                        {t.guideSubtitle || "Hukum fiqih dan pertanyaan umum seputar puasa"}
                    </p>
                </div>

                {/* Button Grid */}
                <div className="grid grid-cols-2 gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
                    {/* Hukum Puasa Button */}
                    <button
                        onClick={() => setRulingsModalOpen(true)}
                        className="group relative overflow-hidden rounded-2xl border border-[rgb(var(--color-primary))]/25 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary-dark))]/5 p-4 text-left transition-all hover:scale-[1.02] hover:border-[rgb(var(--color-primary-light))]/40 hover:shadow-[var(--shadow-card)] active:scale-[0.98]"
                    >
                        <div className="relative z-10">
                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--color-primary-light))]/20 to-[rgb(var(--color-primary-dark))]/20 backdrop-blur-sm">
                                <BookOpen className="h-5 w-5 text-[rgb(var(--color-primary-light))]" />
                            </div>
                            <h4 className="mb-1 font-semibold text-[rgb(var(--color-text-strong))] text-sm">
                                {t.guideButtonRuling || "Hukum Puasa"}
                            </h4>
                            <p className="text-xs text-[rgb(var(--color-text-muted))] leading-relaxed">
                                {t.guideButtonRulingDesc || "Wajib, Sunnah, Mubah, Makruh, Haram"}
                            </p>
                        </div>
                        {/* Hover glow */}
                        <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{
                            background: "radial-gradient(circle at 50% 50%, rgb(var(--color-primary) / 0.1) 0%, transparent 70%)"
                        }} />
                    </button>

                    {/* FAQ Button */}
                    <button
                        onClick={() => setFaqModalOpen(true)}
                        className="group relative overflow-hidden rounded-2xl border border-[rgb(var(--color-info))]/25 bg-gradient-to-br from-[rgb(var(--color-info))]/10 to-[rgb(var(--color-info))]/5 p-4 text-left transition-all hover:scale-[1.02] hover:border-[rgb(var(--color-info))]/40 hover:shadow-[var(--shadow-card)] active:scale-[0.98]"
                    >
                        <div className="relative z-10">
                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--color-info))]/20 to-[rgb(var(--color-info))]/10 backdrop-blur-sm">
                                <HelpCircle className="h-5 w-5 text-[rgb(var(--color-info))]" />
                            </div>
                            <h4 className="mb-1 font-semibold text-[rgb(var(--color-text-strong))] text-sm">
                                {t.guideButtonFAQ || "FAQ Puasa"}
                            </h4>
                            <p className="text-xs text-[rgb(var(--color-text-muted))] leading-relaxed">
                                {t.guideButtonFAQDesc || "Pertanyaan yang sering ditanyakan"}
                            </p>
                        </div>
                        {/* Hover glow */}
                        <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{
                            background: "radial-gradient(circle at 50% 50%, rgb(var(--color-info) / 0.1) 0%, transparent 70%)"
                        }} />
                    </button>
                </div>
            </div>

            {/* Modals */}
            <RulingsModal open={rulingsModalOpen} onOpenChange={setRulingsModalOpen} />
            <FAQModal open={faqModalOpen} onOpenChange={setFaqModalOpen} />
        </>
    );
}
