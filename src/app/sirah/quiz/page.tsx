"use client";

/**
 * Nawaetu - Sirah Nabawiyah Interactive Quiz & Gamification
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Award, CheckCircle2, XCircle, Sparkles, BookOpen, Home } from "lucide-react";
import { getRandomSirahQuestions, type SirahQuizItem } from "@/data/sirah/quiz-questions";
import { useTheme } from "@/context/ThemeContext";
import { addHasanah } from "@/lib/habits/leveling";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SirahQuizPage() {
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    const [questions, setQuestions] = useState<SirahQuizItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [hasClaimedToday, setHasClaimedToday] = useState(false);

    useEffect(() => {
        setQuestions(getRandomSirahQuestions(5));
        if (typeof window !== "undefined") {
            const todayStr = new Date().toISOString().split("T")[0];
            const lastClaimed = localStorage.getItem("nawaetu_sirah_quiz_last_claimed");
            if (lastClaimed === todayStr) {
                setHasClaimedToday(true);
            }
        }
    }, []);

    const currentQ = questions[currentIndex];

    const handleSelectOption = (index: number) => {
        if (selectedOption !== null || !currentQ) return;
        setSelectedOption(index);
        setShowExplanation(true);
        setUserAnswers((prev) => ({ ...prev, [currentIndex]: index }));

        if (index === currentQ.correctIndex) {
            setScore((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        setSelectedOption(null);
        setShowExplanation(false);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setIsFinished(true);
            const pointsEarned = score * 10;
            const todayStr = new Date().toISOString().split("T")[0];
            const lastClaimed = typeof window !== "undefined" ? localStorage.getItem("nawaetu_sirah_quiz_last_claimed") : null;

            if (lastClaimed !== todayStr && pointsEarned > 0) {
                if (typeof window !== "undefined") {
                    localStorage.setItem("nawaetu_sirah_quiz_last_claimed", todayStr);
                    addHasanah(pointsEarned);
                    window.dispatchEvent(new CustomEvent("hasanah_updated"));
                }
                setHasClaimedToday(true);
                toast.success(`MasyaAllah! +${pointsEarned} Poin Hasanah telah ditambahkan ke akumulasi ibadah Anda! ✨`);
            } else {
                toast.info(`Kuis Selesai! Skor Anda: ${score}/5 (${pointsEarned} Poin)`);
            }
        }
    };

    const incorrectQuestions = questions.filter((q, idx) => userAnswers[idx] !== q.correctIndex);    return (
        <div className={cn(
            "min-h-screen pb-24 pt-4 px-4 sm:px-6 max-w-2xl mx-auto space-y-6 transition-colors",
            isDaylight ? "text-slate-900" : "text-white"
        )}>
            {/* Header / Back Link */}
            <div className={cn(
                "flex items-center justify-between border-b pb-4",
                isDaylight ? "border-slate-200" : "border-emerald-500/10"
            )}>
                <Link
                    href="/sirah"
                    className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity",
                        isDaylight ? "text-emerald-700" : "text-emerald-400"
                    )}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Sirah Hub</span>
                </Link>

                <div className={cn(
                    "flex items-center gap-1 text-xs font-bold",
                    isDaylight ? "text-amber-700" : "text-amber-500"
                )}>
                    <Award className="w-4 h-4" />
                    <span>Kuis Sirah Nabawiyah</span>
                </div>
            </div>

            {hasClaimedToday && !isFinished ? (
                /* Already Completed Today Screen */
                <div
                    className={cn(
                        "p-8 rounded-3xl border text-center space-y-6 shadow-sm transition-all",
                        isDaylight ? "bg-white border-slate-200" : "bg-white/[0.03] border-white/10"
                    )}
                >
                    <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl",
                        isDaylight ? "bg-emerald-100" : "bg-emerald-500/15"
                    )}>
                        ✅
                    </div>

                    <div className="space-y-2">
                        <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                            isDaylight 
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                        )}>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Kuis Hari Ini Sudah Selesai Dikerjakan</span>
                        </div>
                        <h2 className={cn("text-xl sm:text-2xl font-extrabold pt-2", isDaylight ? "text-slate-900" : "text-white")}>
                            Alhamdulillah! 🌙
                        </h2>
                        <p className={cn("text-xs leading-relaxed max-w-md mx-auto", isDaylight ? "text-slate-600" : "text-slate-400")}>
                            Anda telah menyelesaikan kuis Sirah Nabawiyah untuk hari ini dan Poin Hasanah Anda telah berhasil diakumulasikan. Kuis harian berikutnya akan terbuka kembali esok hari.
                        </p>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-3">
                        <Link
                            href="/sirah"
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>Baca Sirah Nabawiyah</span>
                        </Link>
                        <Link
                            href="/"
                            className={cn(
                                "px-5 py-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5",
                                isDaylight 
                                    ? "border-slate-300 text-slate-700 hover:bg-slate-50" 
                                    : "border-emerald-500/20 text-white hover:bg-emerald-500/10"
                            )}
                        >
                            <Home className="w-4 h-4" />
                            <span>Beranda</span>
                        </Link>
                    </div>
                </div>
            ) : !isFinished ? (
                /* Question Card */
                <div
                    className={cn(
                        "p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm transition-all",
                        isDaylight ? "bg-white border-slate-200" : "bg-white/[0.03] border-white/10"
                    )}
                >
                    <div className={cn("flex items-center justify-between text-xs font-bold", isDaylight ? "text-slate-500" : "text-slate-400")}>
                        <span>SOAL {currentIndex + 1} DARI {questions.length}</span>
                        <span className={isDaylight ? "text-emerald-700" : "text-emerald-400"}>Skor: {score} Benar (+{score * 10} Poin)</span>
                    </div>

                    <h2 className={cn("text-base sm:text-lg font-extrabold leading-snug", isDaylight ? "text-slate-900" : "text-white")}>
                        {currentQ?.question}
                    </h2>

                    {/* Options List */}
                    <div className="space-y-3">
                        {currentQ?.options.map((opt, idx) => {
                            let optionStateStyle = isDaylight
                                ? "bg-slate-50 border-slate-200 hover:border-emerald-400 text-slate-800"
                                : "bg-white/5 border-white/10 hover:border-emerald-500/40 text-slate-200";

                            if (selectedOption !== null) {
                                if (idx === currentQ.correctIndex) {
                                    optionStateStyle = isDaylight
                                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold"
                                        : "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                                } else if (idx === selectedOption) {
                                    optionStateStyle = isDaylight
                                        ? "bg-rose-50 border-rose-500 text-rose-800 font-bold"
                                        : "bg-rose-500/20 border-rose-500 text-rose-400 font-bold";
                                } else {
                                    optionStateStyle = isDaylight
                                        ? "bg-slate-50/50 border-slate-100 text-slate-400 opacity-60"
                                        : "bg-white/5 border-white/5 text-slate-500 opacity-60";
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(idx)}
                                    disabled={selectedOption !== null}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default",
                                        optionStateStyle
                                    )}
                                >
                                    <span>{opt}</span>
                                    {selectedOption !== null && idx === currentQ.correctIndex && (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                    )}
                                    {selectedOption !== null && idx === selectedOption && idx !== currentQ.correctIndex && (
                                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation Banner */}
                    {showExplanation && (
                        <div className={cn(
                            "p-4 rounded-2xl border space-y-1 text-xs animate-in fade-in duration-200",
                            isDaylight 
                                ? "bg-emerald-50/60 border-emerald-200" 
                                : "bg-emerald-500/10 border-emerald-500/20"
                        )}>
                            <p className={cn("font-bold", isDaylight ? "text-emerald-800" : "text-emerald-400")}>💡 Penjelasan Singkat:</p>
                            <p className={isDaylight ? "text-slate-700" : "text-slate-300"}>
                                {currentQ?.explanation}
                            </p>
                        </div>
                    )}

                    {/* Next Question Button */}
                    {selectedOption !== null && (
                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={handleNext}
                                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20"
                            >
                                {currentIndex < questions.length - 1 ? "Soal Berikutnya ➔" : "Lihat Hasil & Rekomendasi ✨"}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* Quiz Finished Result Screen */
                <div
                    className={cn(
                        "p-6 sm:p-8 rounded-3xl border text-center space-y-6 shadow-sm transition-all",
                        isDaylight ? "bg-white border-slate-200" : "bg-white/[0.03] border-white/10"
                    )}
                >
                    <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl",
                        isDaylight ? "bg-emerald-100 text-emerald-800" : "bg-emerald-500/15 text-emerald-500"
                    )}>
                        🏆
                    </div>

                    <div className="space-y-1">
                        <h2 className={cn("text-2xl font-extrabold", isDaylight ? "text-slate-900" : "text-white")}>Kuis Selesai!</h2>
                        <p className={cn("text-xs", isDaylight ? "text-slate-600" : "text-slate-400")}>
                            Anda menjawab benar <strong className={cn("font-bold", isDaylight ? "text-emerald-700" : "text-emerald-400")}>{score}</strong> dari {questions.length} soal.
                        </p>
                    </div>

                    <div className={cn(
                        "p-4 rounded-2xl border inline-flex flex-col items-center gap-1 text-xs font-bold w-full",
                        isDaylight 
                            ? "bg-emerald-50/60 border-emerald-200 text-emerald-800" 
                            : "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400"
                    )}>
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>+{score * 10} Poin Hasanah ({score * 10}/50 Poin)</span>
                        </div>
                        <span className={cn("text-[10px] opacity-75 font-medium", isDaylight ? "text-slate-600" : "text-slate-300")}>
                            {hasClaimedToday ? "Hadiah Harian Telah Diklaim • Bebas Berlatih Kapan Saja" : "Klaim Harian Berhasil Dikreditkan!"}
                        </span>
                    </div>

                    {/* Trigger Read Back Recommendations */}
                    {incorrectQuestions.length > 0 && (
                        <div className="space-y-3 text-left pt-2">
                            <div className={cn("flex items-center gap-2 text-xs font-bold", isDaylight ? "text-amber-800" : "text-amber-500")}>
                                <span>📖 Rekomendasi Pelajari Ulang (Trigger Baca):</span>
                            </div>

                            <div className="space-y-3">
                                {incorrectQuestions.map((q) => (
                                    <div
                                        key={q.id}
                                        className={cn(
                                            "p-4 rounded-2xl border space-y-2 text-xs",
                                            isDaylight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                                        )}
                                    >
                                        <p className={cn("font-bold", isDaylight ? "text-slate-800" : "text-slate-200")}>
                                            ❌ {q.question}
                                        </p>
                                        <p className={cn("font-semibold", isDaylight ? "text-emerald-700" : "text-emerald-400")}>
                                            ✓ Jawaban Benar: {q.options[q.correctIndex]}
                                        </p>
                                        <p className={isDaylight ? "text-slate-600" : "text-slate-400"}>
                                            {q.explanation}
                                        </p>
                                        <div className="pt-1">
                                            <Link
                                                href={`/sirah/${q.targetChapterSlug}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all shadow-xs"
                                            >
                                                <span>📖 Pendalami di Bab: {q.targetChapterTitle} ➔</span>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex items-center justify-center gap-3">
                        <Link
                            href="/sirah"
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>Kembali ke Sirah Hub</span>
                        </Link>
                        <Link
                            href="/"
                            className={cn(
                                "px-5 py-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5",
                                isDaylight 
                                    ? "border-slate-300 text-slate-700 hover:bg-slate-50" 
                                    : "border-emerald-500/20 text-white hover:bg-emerald-500/10"
                            )}
                        >
                            <Home className="w-4 h-4" />
                            <span>Beranda</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
