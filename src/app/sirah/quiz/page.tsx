"use client";

/**
 * Nawaetu - Sirah Nabawiyah Interactive Quiz & Gamification
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Award, CheckCircle2, XCircle, Sparkles, BookOpen, Home } from "lucide-react";
import { getRandomSirahQuestions, type SirahQuizItem } from "@/data/sirah/quiz-questions";
import { addHasanah } from "@/lib/habits/leveling";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AppIcon } from "@/components/ui/AppIcon";

export default function SirahQuizPage() {

    const [questions, setQuestions] = useState<SirahQuizItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [hasClaimedToday, setHasClaimedToday] = useState(false);

    useEffect(() => {
        queueMicrotask(() => setQuestions(getRandomSirahQuestions(5)));
        if (typeof window !== "undefined") {
            const todayStr = new Date().toISOString().split("T")[0];
            const lastClaimed = localStorage.getItem("nawaetu_sirah_quiz_last_claimed");
            if (lastClaimed === todayStr) {
                queueMicrotask(() => setHasClaimedToday(true));
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
            "sirah-quiz-page min-h-screen pb-24 pt-4 px-4 sm:px-6 max-w-2xl mx-auto space-y-6 transition-colors",
            "text-[rgb(var(--color-text))]"
        )}>
            {/* Header / Back Link */}
            <div className={cn(
                "flex items-center justify-between border-b pb-4",
                "border-[rgb(var(--color-border))]"
            )}>
                <Link
                    href="/sirah"
                    className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity",
                        "text-[rgb(var(--color-primary-strong))]"
                    )}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Sirah Hub</span>
                </Link>

                <div className={cn(
                    "flex items-center gap-1 text-xs font-bold",
                    "text-[rgb(var(--color-warning))]"
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
                        "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]"
                    )}
                >
                    <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl",
                        "bg-[rgb(var(--color-primary))]/10"
                    )}>
                        <AppIcon name="shield-check" size="xl" tone="success" />
                    </div>

                    <div className="space-y-2">
                        <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                            "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))] border-[rgb(var(--color-primary))]/25"
                        )}>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Kuis Hari Ini Sudah Selesai Dikerjakan</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold pt-2 text-[rgb(var(--color-text-strong))]">
                            <span className="inline-flex items-center gap-2"><AppIcon name="moon" size="sm" tone="primary" /> Alhamdulillah!</span>
                        </h2>
                        <p className="text-xs leading-relaxed max-w-md mx-auto text-[rgb(var(--color-text-muted))]">
                            Anda telah menyelesaikan kuis Sirah Nabawiyah untuk hari ini dan Poin Hasanah Anda telah berhasil diakumulasikan. Kuis harian berikutnya akan terbuka kembali esok hari.
                        </p>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-3">
                        <Link
                            href="/sirah"
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-[rgb(var(--color-primary-foreground))] text-xs font-bold transition-all shadow-[var(--shadow-card)] flex items-center gap-1.5 cursor-pointer bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))]"
                            )}
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>Baca Sirah Nabawiyah</span>
                        </Link>
                        <Link
                            href="/"
                            className={cn(
                                "px-5 py-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer",
                                "border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface-subtle))] hover:border-[rgb(var(--color-primary))]/30"
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
                        "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]"
                    )}
                >
                    <div className="flex items-center justify-between text-xs font-bold text-[rgb(var(--color-text-muted))]">
                        <span>SOAL {currentIndex + 1} DARI {questions.length}</span>
                        <span className="text-[rgb(var(--color-primary-strong))]">Skor: {score} Benar (+{score * 10} Poin)</span>
                    </div>

                    <h2 className="text-base sm:text-lg font-extrabold leading-snug text-[rgb(var(--color-text-strong))]">
                        {currentQ?.question}
                    </h2>

                    {/* Options List */}
                    <div className="space-y-3">
                        {currentQ?.options.map((opt, idx) => {
                            let optionStateStyle = "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))]/40 text-[rgb(var(--color-text))]";

                            if (selectedOption !== null) {
                                if (idx === currentQ.correctIndex) {
                                    optionStateStyle = "bg-[rgb(var(--color-success))]/10 border-[rgb(var(--color-success))] text-[rgb(var(--color-success))] font-bold";
                                } else if (idx === selectedOption) {
                                    optionStateStyle = "bg-[rgb(var(--color-danger))]/10 border-[rgb(var(--color-danger))] text-[rgb(var(--color-danger))] font-bold";
                                } else {
                                    optionStateStyle = "bg-[rgb(var(--color-surface-subtle))]/50 border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] opacity-60";
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
                                        <CheckCircle2 className="w-5 h-5 shrink-0 text-[rgb(var(--color-success))]" />
                                    )}
                                    {selectedOption !== null && idx === selectedOption && idx !== currentQ.correctIndex && (
                                        <XCircle className="w-5 h-5 text-[rgb(var(--color-danger))] shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation Banner */}
                    {showExplanation && (
                        <div className={cn(
                            "p-4 rounded-2xl border space-y-1 text-xs animate-in fade-in duration-200",
                            "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/25"
                        )}>
                            <p className="font-bold text-[rgb(var(--color-primary-strong))] flex items-center gap-1.5"><AppIcon name="help" size="sm" tone="primary" /> Penjelasan Singkat:</p>
                            <p className="text-[rgb(var(--color-text-muted))]">
                                {currentQ?.explanation}
                            </p>
                        </div>
                    )}

                    {/* Next Question Button */}
                    {selectedOption !== null && (
                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={handleNext}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[rgb(var(--color-primary-foreground))] font-bold text-xs transition-all shadow-[var(--shadow-card)] cursor-pointer bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))]"
                                )}
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
                        "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]"
                    )}
                >
                    <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl",
                        "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))]"
                    )}>
                        <AppIcon name="trophy" size="xl" tone="primary" />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl font-extrabold text-[rgb(var(--color-text-strong))]">Kuis Selesai!</h2>
                        <p className="text-xs text-[rgb(var(--color-text-muted))]">
                            Anda menjawab benar <strong className="font-bold text-[rgb(var(--color-primary-strong))]">{score}</strong> dari {questions.length} soal.
                        </p>
                    </div>

                    <div className={cn(
                        "p-4 rounded-2xl border inline-flex flex-col items-center gap-1 text-xs font-bold w-full",
                        "bg-gradient-to-r from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/5 border-[rgb(var(--color-primary))]/25 text-[rgb(var(--color-primary-strong))]"
                    )}>
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[rgb(var(--color-warning))]" />
                            <span>+{score * 10} Poin Hasanah ({score * 10}/50 Poin)</span>
                        </div>
                        <span className="text-[10px] opacity-75 font-medium text-[rgb(var(--color-text-muted))]">
                            {hasClaimedToday ? "Hadiah Harian Telah Diklaim. Bebas Berlatih Kapan Saja" : "Klaim Harian Berhasil Dikreditkan!"}
                        </span>
                    </div>

                    {/* Trigger Read Back Recommendations */}
                    {incorrectQuestions.length > 0 && (
                        <div className="space-y-3 text-left pt-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-[rgb(var(--color-warning))]">
                                <span className="flex items-center gap-1.5"><AppIcon name="book" size="sm" tone="warning" /> Rekomendasi Pelajari Ulang (Trigger Baca):</span>
                            </div>

                            <div className="space-y-3">
                                {incorrectQuestions.map((q) => (
                                    <div
                                        key={q.id}
                                        className={cn(
                                            "p-4 rounded-2xl border space-y-2 text-xs",
                                            "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]"
                                        )}
                                    >
                                        <p className="font-bold text-[rgb(var(--color-text))]">
                                            <span className="inline-flex items-center gap-1.5"><AppIcon name="warning" size="sm" tone="danger" /> {q.question}</span>
                                        </p>
                                        <p className="font-semibold text-[rgb(var(--color-success))]">
                                            <span className="inline-flex items-center gap-1.5"><AppIcon name="shield-check" size="sm" tone="success" /> Jawaban Benar: {q.options[q.correctIndex]}</span>
                                        </p>
                                        <p className="text-[rgb(var(--color-text-muted))]">
                                            {q.explanation}
                                        </p>
                                        <div className="pt-1">
                                            <Link
                                                href={`/sirah/${q.targetChapterSlug}`}
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[rgb(var(--color-primary-foreground))] font-bold text-[11px] transition-all shadow-[var(--shadow-card)] cursor-pointer bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))]"
                                                )}
                                            >
                                                <span className="flex items-center gap-1.5"><AppIcon name="book" size="sm" tone="default" /> Pendalami di Bab: {q.targetChapterTitle} <AppIcon name="target" size="xs" tone="default" /></span>
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
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-[rgb(var(--color-primary-foreground))] text-xs font-bold transition-all shadow-[var(--shadow-card)] flex items-center gap-1.5 cursor-pointer bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))]"
                            )}
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>Kembali ke Sirah Hub</span>
                        </Link>
                        <Link
                            href="/"
                            className={cn(
                                "px-5 py-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer",
                                "border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface-subtle))] hover:border-[rgb(var(--color-primary))]/30"
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
