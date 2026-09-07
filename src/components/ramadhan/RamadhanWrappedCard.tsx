"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import * as htmlToImage from "html-to-image";
import { Download, Share2, Check, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { useTranslations } from "@/context/LocaleContext";
import type { TranslationTree } from "@/context/LocaleContext";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";

interface RamadhanStats {
    hijriYear: number;
    fastingCount: number;
    bestFastingStreak: number;
    totalQuranSeconds: number;
    totalHasanah: number;
    totalAyat: number;
    totalTasbih: number;
    totalSunnahAll: number;
    fardhuMasjidDays: number;
    fardhuRumahDays: number;
    fardhuKeduanyaDays: number;
    tarawehCount: number;
    qiyamulLailCount: number;
    masjidCount: number;
    rumahCount: number;
    topLocation: "masjid" | "rumah" | "balanced";
    rakaat8Count: number;
    rakaat20Count: number;
    topChoice: "8" | "20" | "balanced";
}

interface FastingLogEntry {
    status?: string;
}

function formatDuration(seconds: number): string {
    if (!seconds) return "0 Mnt";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}j ${m}m`;
    return `${m} Mnt`;
}

function MiniBar({ left, right, leftLabel, rightLabel, leftColor, rightColor }: {
    left: number; right: number;
    leftLabel: string; rightLabel: string;
    leftColor: string; rightColor: string;
}) {
    const total = left + right;
    const leftPct = total ? Math.round((left / total) * 100) : 50;
    const rightPct = 100 - leftPct;
    return (
        <div className="w-full">
            <div className="flex justify-between text-[9px] text-white/40 mb-1 font-medium">
                <span>{leftLabel} <span className="text-white/60">{left}</span></span>
                <span className="text-white/60">{right}</span><span>{rightLabel}</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden gap-px">
                <div className={`${leftColor} transition-all duration-500`} style={{ width: `${leftPct}%` }} />
                <div className={`${rightColor} transition-all duration-500`} style={{ width: `${rightPct}%` }} />
            </div>
            <div className="flex justify-between text-[8px] text-white/30 mt-0.5">
                <span>{leftPct}%</span>
                <span>{rightPct}%</span>
            </div>
        </div>
    );
}

export default function RamadhanWrappedCard() {
    const t = useTranslations() as TranslationTree;
    const { data: prayerData } = usePrayerTimesContext();
    const [stats, setStats] = useState<RamadhanStats | null>(null);
    const [insight, setInsight] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);
    const [userName, setUserName] = useState("Sobat Nawaetu");
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const matchedYearStr = prayerData?.hijriDate?.match(/(\d{4})H/)?.[1];
    const activeHijriYear = matchedYearStr ? parseInt(matchedYearStr, 10) : new Date().getFullYear() + 579;

    useEffect(() => {
        async function fetchStats() {
            try {
                const storage = getStorageService();
                const sName = storage.getOptional<string>(STORAGE_KEYS.USER_NAME);
                if (sName) setUserName(sName as string);

                const res = await fetch(`/api/ramadhan/summary?hijriYear=${activeHijriYear}`);
                const apiData = await res.json();

                const savedFastingLog = storage.getOptional<string>(STORAGE_KEYS.RAMADHAN_FASTING_LOG);
                let localFastingCount = 0;
                const safeHijriYear = apiData?.hijriYear || activeHijriYear;
                if (savedFastingLog) {
                    try {
                        const parsed = JSON.parse(savedFastingLog) as Record<string, Record<string, FastingLogEntry>>;
                        const yr = parsed[safeHijriYear] || parsed[safeHijriYear.toString()] || {};
                        localFastingCount = Object.values(yr).filter(v => v.status === "fasting").length;
                    } catch { /* ignore */ }
                }

                const finalFastingCount = Math.max(apiData?.fastingCount || 0, localFastingCount);
                const finalStats: RamadhanStats = {
                    ...apiData,
                    hijriYear: safeHijriYear,
                    fastingCount: finalFastingCount,
                    bestFastingStreak: apiData?.bestFastingStreak || 0,
                    tarawehCount: apiData?.tarawehCount || 0,
                    qiyamulLailCount: apiData?.qiyamulLailCount || 0,
                    masjidCount: apiData?.masjidCount || 0,
                    rumahCount: apiData?.rumahCount || 0,
                    totalTasbih: apiData?.totalTasbih || 0,
                    totalSunnahAll: apiData?.totalSunnahAll || 0,
                    fardhuMasjidDays: apiData?.fardhuMasjidDays || 0,
                    fardhuRumahDays: apiData?.fardhuRumahDays || 0,
                    fardhuKeduanyaDays: apiData?.fardhuKeduanyaDays || 0,
                    topLocation: apiData?.topLocation || "balanced",
                    rakaat8Count: apiData?.rakaat8Count || 0,
                    rakaat20Count: apiData?.rakaat20Count || 0,
                    topChoice: apiData?.topChoice || "balanced",
                };
                setStats(finalStats);

                // --- AI Insight Caching Logic ---
                const insightCacheKey = STORAGE_KEYS.RAMADHAN_INSIGHT_CACHE;
                const fullCache = storage.getOptional<Record<string, string>>(insightCacheKey) || {};
                const cachedInsight = fullCache[safeHijriYear] || fullCache[safeHijriYear.toString()];

                if (cachedInsight) {
                    setInsight(cachedInsight);
                    setInsightLoading(false);
                } else {
                    // Fetch AI insight in background
                    setInsightLoading(true);
                    try {
                        const lang = storage.getOptional<string>("nawaetu_language") || "id";
                        const insightRes = await fetch("/api/ramadhan/insight", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ stats: finalStats, lang, userName: sName || "Sobat Nawaetu" }),
                        });
                        const insightData = await insightRes.json();
                        const newInsight = insightData.insight || null;
                        if (newInsight) {
                            setInsight(newInsight);
                            // Save to cache
                            const updatedCache = { ...fullCache, [safeHijriYear]: newInsight };
                            storage.set(insightCacheKey, updatedCache);
                        }
                    } catch { /* will show fallback */ }
                    setInsightLoading(false);
                }

            } catch (err) {
                console.error("Failed to load wrapped stats", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [activeHijriYear]);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setGenerating(true);
        try {
            await new Promise(r => setTimeout(r, 150));
            const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 1, pixelRatio: 3, cacheBust: true });
            const link = document.createElement("a");
            link.download = `nawaetu-ramadhan-${stats?.hijriYear || ""}.png`;
            link.href = dataUrl;
            link.click();
            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 3000);
        } catch (err) {
            console.error("Failed to generate image", err);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center p-6 border border-white/10 rounded-2xl bg-black/40 backdrop-blur-sm">
                <Loader2 className="w-5 h-5 mr-3 animate-spin text-[rgb(var(--color-primary))]" />
                <span className="text-sm text-white/50 animate-pulse">{t.wrappedLoading || "Menghimpun Amal Ramadhan..."}</span>
            </div>
        );
    }

    if (!stats) return null;

    // ─── The downloadable 9:16 card ────────────────────────────────────────
    const WrappedCardContent = (
        <div
            ref={cardRef}
            className="relative overflow-hidden rounded-[28px] flex flex-col w-full"
            style={{
                aspectRatio: "9/16",
                background: "linear-gradient(160deg, #0a0e1a 0%, #0d1530 40%, #060810 100%)",
                padding: "6%",
            }}
        >
            {/* Decorative blobs */}
            <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full opacity-20" style={{ background: "rgb(var(--color-primary))", filter: "blur(70px)" }} />
            <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full opacity-10" style={{ background: "#f59e0b", filter: "blur(70px)" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-5" style={{ background: "rgb(var(--color-primary-light))", filter: "blur(60px)" }} />

            {/* ── Header ── */}
            <div className="z-10 text-center mb-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.35em] mb-1" style={{ color: "rgba(var(--color-primary-light),0.7)" }}>
                    ✦ {t.wrappedTitleLabel || "Nawaetu Wrapped"} ✦
                </p>
                <h2 className="text-[22px] font-serif font-bold text-white leading-tight">
                    {t.wrappedTitle?.replace("{year}", stats.hijriYear?.toString() || "") || `Rapor Ramadhan ${stats.hijriYear}H`}
                </h2>
                <p className="text-xs text-white/50 mt-0.5">{t.wrappedGreeting?.replace("{name}", userName) || `Alhamdulillah, ${userName}`}</p>
            </div>

            {/* ── Divider ── */}
            <div className="z-10 h-px w-full mb-3" style={{ background: "linear-gradient(to right, transparent, rgba(var(--color-primary),0.4), transparent)" }} />

            {/* ── Core Stats Row ── */}
            <div className="z-10 grid grid-cols-3 gap-2 mb-3">
                {/* Puasa */}
                <div className="flex flex-col items-center justify-center rounded-2xl py-3 border" style={{ background: "rgba(251,191,36,0.08)", borderColor: "rgba(251,191,36,0.2)" }}>
                    <span className="text-base mb-0.5">🌙</span>
                    <span className="text-xl font-black text-white leading-none">{stats.fastingCount}</span>
                    <span className="text-[8px] text-amber-400/70 uppercase tracking-wider mt-0.5">{t.wrappedFasting || "Puasa"}</span>
                </div>
                {/* Tarawih */}
                <div className="flex flex-col items-center justify-center rounded-2xl py-3 border" style={{ background: "rgba(var(--color-primary),0.08)", borderColor: "rgba(var(--color-primary),0.25)" }}>
                    <span className="text-base mb-0.5">✨</span>
                    <span className="text-xl font-black text-white leading-none">{stats.tarawehCount}</span>
                    <span className="text-[8px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(var(--color-primary-light),0.7)" }}>{t.wrappedTaraweh || "Tarawih"}</span>
                </div>
                {/* Tilawah */}
                <div className="flex flex-col items-center justify-center rounded-2xl py-3 border" style={{ background: "rgba(52,211,153,0.08)", borderColor: "rgba(52,211,153,0.2)" }}>
                    <span className="text-base mb-0.5">📖</span>
                    <span className="text-lg font-black text-white leading-none">{formatDuration(stats.totalQuranSeconds)}</span>
                    <span className="text-[8px] text-emerald-400/70 uppercase tracking-wider mt-0.5">{t.wrappedQuran || "Tilawah"}</span>
                </div>
            </div>

            {/* ── Analytics Section ── */}
            <div className="z-10 flex flex-col gap-2 mb-3">
                {/* Row 1: Qiyamul Lail + Dzikir + Sholat Sunnah */}
                <div className="grid grid-cols-3 gap-1.5">
                    {/* Qiyamul Lail */}
                    <div className="rounded-xl p-2 border flex flex-col items-center justify-center" style={{ background: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.2)" }}>
                        <span className="text-base mb-0.5">🤲</span>
                        <div className="text-white font-black text-sm leading-none">{stats.qiyamulLailCount}</div>
                        <div className="text-[7px] text-indigo-400/70 uppercase tracking-wider mt-0.5 text-center">Qiyamul Lail</div>
                    </div>
                    {/* Dzikir */}
                    <div className="rounded-xl p-2 border flex flex-col items-center justify-center" style={{ background: "rgba(168,85,247,0.08)", borderColor: "rgba(168,85,247,0.2)" }}>
                        <span className="text-base mb-0.5">📿</span>
                        <div className="text-white font-black text-sm leading-none">
                            {stats.totalTasbih > 999
                                ? `${Math.floor(stats.totalTasbih / 1000)}k`
                                : stats.totalTasbih}
                        </div>
                        <div className="text-[7px] text-purple-400/70 uppercase tracking-wider mt-0.5 text-center">Dzikir</div>
                    </div>
                    {/* Sholat Sunnah */}
                    <div className="rounded-xl p-2 border flex flex-col items-center justify-center" style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.2)" }}>
                        <span className="text-base mb-0.5">☀️</span>
                        <div className="text-white font-black text-sm leading-none">{stats.totalSunnahAll}</div>
                        <div className="text-[7px] text-green-400/70 uppercase tracking-wider mt-0.5 text-center">Sholat Sunnah</div>
                    </div>
                </div>

                {/* Lokasi Sholat Wajib bar */}
                {(stats.fardhuMasjidDays + stats.fardhuRumahDays + stats.fardhuKeduanyaDays) > 0 && (
                    <div className="rounded-xl p-3 border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-xs">🕌</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">Lokasi Sholat Wajib</span>
                        </div>
                        <MiniBar
                            left={stats.fardhuMasjidDays}
                            right={stats.fardhuRumahDays}
                            leftLabel="🕌 Masjid"
                            rightLabel="Rumah 🏠"
                            leftColor="bg-[rgba(var(--color-primary),0.7)]"
                            rightColor="bg-amber-500/60"
                        />
                    </div>
                )}

                {/* Lokasi Sholat Tarawih bar */}
                {(stats.masjidCount + stats.rumahCount) > 0 && (
                    <div className="rounded-xl p-3 border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-xs">📍</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">Lokasi Sholat Tarawih</span>
                        </div>
                        <MiniBar
                            left={stats.masjidCount} right={stats.rumahCount}
                            leftLabel="🕌 Masjid" rightLabel="Rumah 🏠"
                            leftColor="bg-[rgba(var(--color-primary),0.7)]"
                            rightColor="bg-amber-500/60"
                        />
                    </div>
                )}
            </div>

            {/* ── AI Insight Box ── */}
            <div className="z-10 flex-1 rounded-2xl p-3 border flex flex-col justify-center" style={{ background: "rgba(var(--color-primary),0.06)", borderColor: "rgba(var(--color-primary),0.2)" }}>
                <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3 h-3" style={{ color: "rgb(var(--color-primary-light))" }} />
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "rgba(var(--color-primary-light),0.7)" }}>
                        {t.wrappedAIInsight || "AI Insight"}
                    </span>
                </div>
                {insightLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-white/30 shrink-0" />
                        <span className="text-[10px] text-white/30 italic animate-pulse">{t.wrappedAILoading || "Merangkum perjalananmu..."}</span>
                    </div>
                ) : (
                    <p className="text-[10px] leading-relaxed text-white/70 italic">
                        {insight || "MasyaAllah, setiap langkah ibadahmu di bulan suci ini adalah cahaya yang menerangi jalan menuju ridha Allah. Semoga amal-amal kebaikanmu diterima dan menjadi bekal di akhirat kelak. Taqabbalallahu minna wa minkum."}
                    </p>
                )}
            </div>

            {/* ── Divider ── */}
            <div className="z-10 h-px w-full mt-3" style={{ background: "linear-gradient(to right, transparent, rgba(var(--color-primary),0.4), transparent)" }} />

            {/* ── Footer ── */}
            <div className="z-10 mt-2 text-center flex items-center justify-center gap-1.5">
                <img src="/icons/icon-192x192.png" className="w-3 h-3 opacity-40 contrast-200 grayscale" alt="Nawaetu" />
                <span className="text-[8px] text-white/25 font-bold uppercase tracking-widest">nawaetu.com</span>
            </div>
        </div>
    );

    // ─── Trigger widget ─────────────────────────────────────────────────────
    const triggerWidget = (
        <button
            onClick={() => setIsOpen(true)}
            className="w-full flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-left transition-all hover:bg-white/8 hover:-translate-y-0.5 active:scale-[0.98] group"
        >
            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl text-2xl" style={{ background: "rgba(var(--color-primary),0.15)" }}>
                🏆
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{t.wrappedTriggerTitle || "Rapor Ramadhanmu"}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{t.wrappedTriggerSubtitle || "Puasa, Tarawih, Tilawah & AI Insight"}</p>
            </div>
            <div className="shrink-0 flex items-center gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: "rgba(var(--color-primary),0.15)", color: "rgb(var(--color-primary-light))" }}>
                    {t.wrappedTriggerCta || "Lihat"}
                </span>
            </div>
        </button>
    );

    // ─── Fullscreen modal ───────────────────────────────────────────────────
    const wrappedModal = (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md overflow-y-auto grid place-items-center p-4 pb-12 pt-16">
            <button
                onClick={() => setIsOpen(false)}
                className="fixed top-4 right-4 z-[100] p-3 rounded-full hover:bg-white/20 bg-black/40 text-white transition-colors border border-white/10 backdrop-blur-md"
            >
                <X className="w-5 h-5" />
            </button>
            <div className="w-full max-w-[360px] mx-auto flex flex-col gap-3 relative">
                {WrappedCardContent}

                {/* Actions */}
                <div className="flex gap-2 w-full">
                    <Button
                        onClick={handleDownload}
                        disabled={generating || downloaded}
                        className={cn(
                            "flex-1 rounded-2xl h-12 transition-all",
                            downloaded
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 shadow-none cursor-default"
                                : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white shadow-lg shadow-[rgb(var(--color-primary))]/20"
                        )}
                    >
                        {generating ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.wrappedRendering || "Nge-Render..."}</>
                        ) : downloaded ? (
                            <><Check className="w-4 h-4 mr-2" /> {t.wrappedSaved || "Tersimpan"}</>
                        ) : (
                            <><Download className="w-4 h-4 mr-2" /> {t.wrappedDownload || "Unduh Rapor"}</>
                        )}
                    </Button>

                    {typeof navigator !== "undefined" && navigator.share && (
                        <Button
                            variant="outline"
                            className="flex-shrink-0 w-12 h-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
                            onClick={async () => {
                                if (!cardRef.current) return;
                                setGenerating(true);
                                try {
                                    const blob = await htmlToImage.toBlob(cardRef.current, { pixelRatio: 3, cacheBust: true });
                                    if (!blob) return;
                                    const file = new File([blob], "ramadhan-wrapped.png", { type: "image/png" });
                                    await navigator.share({
                                        title: `Rapor Ramadhan ${stats?.hijriYear || ""}H`,
                                        text: "Alhamdulillah, ini rapor Ramadhanku tahun ini via Nawaetu App!",
                                        files: [file],
                                    });
                                } catch (err) {
                                    console.error("Share failed", err);
                                } finally {
                                    setGenerating(false);
                                }
                            }}
                        >
                            <Share2 className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {triggerWidget}
            {isOpen && typeof document !== "undefined" && createPortal(wrappedModal, document.body)}
        </>
    );
}
