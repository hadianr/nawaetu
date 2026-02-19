"use client";

import { useState } from "react";
import { BookOpen, HelpCircle } from "lucide-react";
import FiqhModal from "./FiqhModal";
import FAQModal from "./FAQModal";
import { useLocale } from "@/context/LocaleContext";

export default function RamadhanGuideCard() {
    const [fiqhModalOpen, setFiqhModalOpen] = useState(false);
    const [faqModalOpen, setFaqModalOpen] = useState(false);
    const { t } = useLocale();

    return (
        <>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent backdrop-blur-lg shadow-xl">
                {/* Header */}
                <div className="px-3 pt-3 pb-2 sm:px-4 sm:pt-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📚</span>
                        <h3 className="font-bold text-white text-sm sm:text-base">
                            {t.guideTitle || "Panduan Puasa Ramadhan"}
                        </h3>
                    </div>
                    <p className="text-xs text-white/50">
                        {t.guideSubtitle || "Hukum fiqih dan pertanyaan umum seputar puasa"}
                    </p>
                </div>

                {/* Button Grid */}
                <div className="grid grid-cols-2 gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
                    {/* Hukum Puasa Button */}
                    <button
                        onClick={() => setFiqhModalOpen(true)}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4 text-left transition-all hover:scale-[1.02] hover:border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98]"
                    >
                        <div className="relative z-10">
                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 backdrop-blur-sm">
                                <BookOpen className="h-5 w-5 text-emerald-300" />
                            </div>
                            <h4 className="mb-1 font-semibold text-white text-sm">
                                {t.guideButtonFiqh || "Hukum Puasa"}
                            </h4>
                            <p className="text-xs text-white/60 leading-relaxed">
                                {t.guideButtonFiqhDesc || "Wajib, Sunnah, Mubah, Makruh, Haram"}
                            </p>
                        </div>
                        {/* Hover glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-emerald-600/0 opacity-0 transition-opacity group-hover:opacity-100" style={{
                            background: "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)"
                        }} />
                    </button>

                    {/* FAQ Button */}
                    <button
                        onClick={() => setFaqModalOpen(true)}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 text-left transition-all hover:scale-[1.02] hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98]"
                    >
                        <div className="relative z-10">
                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400/20 to-blue-600/20 backdrop-blur-sm">
                                <HelpCircle className="h-5 w-5 text-blue-300" />
                            </div>
                            <h4 className="mb-1 font-semibold text-white text-sm">
                                {t.guideButtonFAQ || "FAQ Puasa"}
                            </h4>
                            <p className="text-xs text-white/60 leading-relaxed">
                                {t.guideButtonFAQDesc || "Pertanyaan yang sering ditanyakan"}
                            </p>
                        </div>
                        {/* Hover glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-600/0 opacity-0 transition-opacity group-hover:opacity-100" style={{
                            background: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)"
                        }} />
                    </button>
                </div>
            </div>

            {/* Modals */}
            <FiqhModal open={fiqhModalOpen} onOpenChange={setFiqhModalOpen} />
            <FAQModal open={faqModalOpen} onOpenChange={setFaqModalOpen} />
        </>
    );
}
