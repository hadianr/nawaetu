"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarDays, Flame, LockKeyhole, Share2, Snowflake, Target, Trophy } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { useStreak } from "@/hooks/useStreak";
import { usePlayerStats } from "@/lib/habits/leveling";
import { mapStreakAchievementToShareData } from "@/lib/share/share-mappers";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import {
  STREAK_ACHIEVEMENT_EVENT,
  type StreakAchievementEventDetail,
} from "@/core/repositories/streak.repository";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trackStreakEvent } from "@/lib/analytics/analytics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const StoryShareModal = dynamic(
  () => import("@/components/StoryShareModal").then((module) => module.StoryShareModal),
  { ssr: false },
);

interface StreakBadgeProps {
  showLabel?: boolean;
  modalOnly?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CanonicalProgression {
  userId?: string;
  hasanah?: number;
  level?: number;
  streak?: {
    currentDays?: number;
    longestDays?: number;
    lastStreakDate?: string | null;
    days?: Array<{ localDate: string; status?: string }>;
  };
}

function consecutiveDates(lastDate: string, count: number): Set<string> {
  const result = new Set<string>();
  const end = new Date(`${lastDate}T00:00:00Z`);
  if (Number.isNaN(end.getTime())) return result;

  for (let offset = 0; offset < count; offset++) {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - offset);
    result.add(date.toISOString().slice(0, 10));
  }
  return result;
}

export default function StreakBadge({ showLabel = false, modalOnly = false, open, onOpenChange }: StreakBadgeProps) {
  const { locale, t } = useLocale();
  const { currentTheme } = useTheme();
  const { data: session, status } = useSession();
  const { streak, display, milestones } = useStreak();
  const player = usePlayerStats();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lossTrackedRef = useRef(false);
  const qualificationTrackedRef = useRef<string | null>(null);
  const freezeTrackedRef = useRef(0);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open !== undefined) setDetailsOpen(open);
  }, [open]);
  useEffect(() => {
    const celebrate = (event: Event) => {
      const { streak: achievement, milestone } = (event as CustomEvent<StreakAchievementEventDetail>).detail;
      const localizedMilestone = milestone ? t[`streakMilestone${milestone.days}`] : null;

      toast.success(
        localizedMilestone
          ? t.streakCelebrationMilestone.replace("{milestone}", localizedMilestone)
          : t.streakCelebrationExtended.replace("{count}", String(achievement.currentStreak)),
        {
          description: milestone
            ? t.streakCelebrationReward.replace("{hasanah}", String(milestone.xp))
            : t.streakCelebrationKeepGoing,
          icon: milestone?.icon ?? "🔥",
          action: {
            label: t.streakCelebrationView,
            onClick: () => setDetailsOpen(true),
          },
        },
      );
      trackStreakEvent(milestone ? "milestone_reached" : "streak_extended", {
        userMode: status === "authenticated" ? "logged_in" : "guest",
        syncState: status === "authenticated" ? "canonical" : "local",
        streakDays: achievement.currentStreak,
      });
    };

    window.addEventListener(STREAK_ACHIEVEMENT_EVENT, celebrate);
    return () => window.removeEventListener(STREAK_ACHIEVEMENT_EVENT, celebrate);
  }, [status, t]);
  const isDaylight = mounted && currentTheme === "daylight";
  const isLoggedIn = status === "authenticated";
  const cachedProgression = isLoggedIn
    ? getStorageService().getOptional<CanonicalProgression>(STORAGE_KEYS.CANONICAL_PROGRESSION)
    : null;
  const canonical = cachedProgression && session?.user?.id && cachedProgression.userId === session.user.id
    ? cachedProgression
    : null;
  const currentStreak = mounted ? display.streak : 0;
  const isActiveToday = mounted && display.isActiveToday;
  const isLost = mounted && display.isLost;
  const nextMilestone = milestones.find((milestone) => milestone.days > currentStreak);
  const milestoneProgress = nextMilestone
    ? Math.min(100, Math.round((currentStreak / nextMilestone.days) * 100))
    : 100;

  const activeDates = useMemo(() => {
    if (canonical?.streak?.days) {
      return new Set(
        canonical.streak.days
          .filter((day) => day.status !== "frozen")
          .map((day) => day.localDate.slice(0, 10)),
      );
    }
    return consecutiveDates(streak.lastActiveDate, streak.currentStreak);
  }, [canonical?.streak?.days, streak.currentStreak, streak.lastActiveDate]);
  const protectedDates = useMemo(() => {
    if (canonical?.streak?.days) {
      return new Set(
        canonical.streak.days
          .filter((day) => day.status === "frozen")
          .map((day) => day.localDate.slice(0, 10)),
      );
    }
    return new Set(streak.protectedDates);
  }, [canonical?.streak?.days, streak.protectedDates]);
  const week = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const key = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
      return {
        key,
        label: new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(date),
        active: activeDates.has(key),
        protected: protectedDates.has(key),
        today: index === 6,
      };
    });
  }, [activeDates, locale, protectedDates]);

  const shareStreak = currentStreak;
  const shareLongest = streak.longestStreak;
  const reachedMilestone = [...milestones].reverse().find((milestone) => milestone.days <= shareStreak);
  const milestoneLabel = (days?: number) => days ? t[`streakMilestone${days}`] : undefined;
  const canShare = shareStreak > 0;
  const shareItem = mapStreakAchievementToShareData({
    currentStreak: shareStreak,
    longestStreak: shareLongest,
    hasanahEarned: reachedMilestone?.days === shareStreak ? reachedMilestone?.xp : undefined,
    level: canonical?.level ?? player.level,
    milestoneLabel: reachedMilestone?.days === shareStreak ? milestoneLabel(reachedMilestone?.days) : undefined,
    displayName: session?.user?.name || undefined,
  }, locale);

  const statusText = isActiveToday
    ? t.streakCompletedToday
    : currentStreak > 0
      ? t.streakAtRisk
      : isLost
        ? t.streakLostRestart
        : t.streakStart;

  useEffect(() => {
    if (mounted && isLost && !lossTrackedRef.current) {
      lossTrackedRef.current = true;
      trackStreakEvent("streak_lost", {
        userMode: isLoggedIn ? "logged_in" : "guest",
        syncState: canonical ? "canonical" : "local",
        streakDays: currentStreak,
      });
    }
    if (!isLost) lossTrackedRef.current = false;
  }, [canonical, currentStreak, isLoggedIn, isLost, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const mode = isLoggedIn ? "logged_in" : "guest";
    const syncState = canonical ? "canonical" : "local";
    const today = new Date().toISOString().slice(0, 10);
    const qualificationKey = `${mode}:${today}`;
    if (isActiveToday && currentStreak > 0 && qualificationTrackedRef.current !== qualificationKey) {
      qualificationTrackedRef.current = qualificationKey;
      trackStreakEvent("qualified", { userMode: mode, syncState, streakDays: currentStreak });
    }
    if (protectedDates.size > freezeTrackedRef.current) {
      freezeTrackedRef.current = protectedDates.size;
      trackStreakEvent("freeze_used", { userMode: mode, syncState, streakDays: currentStreak });
    }
  }, [canonical, currentStreak, isActiveToday, isLoggedIn, mounted, protectedDates]);

  return (
    <>
      {!modalOnly && <button
        type="button"
        onClick={() => {
          trackStreakEvent("surface_opened", {
            userMode: isLoggedIn ? "logged_in" : "guest",
            syncState: canonical ? "canonical" : "local",
            streakDays: currentStreak,
          });
          setDetailsOpen(true);
        }}
        className={cn(
          "flex min-h-11 items-center gap-1.5 rounded-full border px-3 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
          isActiveToday
            ? "border-[rgb(var(--color-primary))]/40 bg-[rgb(var(--color-primary))]/15 text-[rgb(var(--color-primary-light))]"
            : isDaylight ? "border-slate-200 bg-[rgb(var(--color-surface))] text-slate-500" : "border-white/10 bg-[rgb(var(--color-surface))]/60 text-white/70",
        )}
        aria-label={t.streakOpenDetails.replace("{count}", String(currentStreak))}
      >
        <Flame className={cn("h-5 w-5", isActiveToday && "fill-current")} aria-hidden="true" />
        <span className="text-sm font-black tabular-nums">{currentStreak}</span>
        {showLabel && <span className="hidden text-xs sm:inline">{t.streakDayCount}</span>}
      </button>}

      <Dialog open={open ?? detailsOpen} onOpenChange={(nextOpen) => {
        setDetailsOpen(nextOpen);
        onOpenChange?.(nextOpen);
      }}>
        <DialogContent className={cn(
          "max-w-sm overflow-hidden border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-surface))] p-0 motion-reduce:animate-none motion-reduce:transition-none",
          isDaylight ? "text-slate-900" : "text-white",
        )} closeLabel={t.streakClose}>
          <div className="bg-gradient-to-br from-[rgb(var(--color-primary-dark))] via-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] px-6 py-7 text-center text-white">
            <Flame className="mx-auto h-14 w-14 fill-current text-[rgb(var(--color-primary-light))] motion-reduce:animate-none" aria-hidden="true" />
            <p className="mt-2 text-5xl font-black tabular-nums">{currentStreak}</p>
            <p className="text-sm font-bold">{t.streakDayCount}</p>
          </div>

          <div className="space-y-5 p-5">
            <DialogHeader>
              <DialogTitle>{t.streakTitle}</DialogTitle>
              <DialogDescription className={isDaylight ? "text-slate-600" : "text-white/65"}>{statusText}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-7 gap-2" aria-label={t.streakLastSevenDays}>
              {week.map((day) => (
                <div key={day.key} className="space-y-1 text-center">
                  <span className={cn("text-[10px] font-semibold", isDaylight ? "text-slate-500" : "text-white/55")}>{day.label}</span>
                  <span className={cn(
                    "flex aspect-square items-center justify-center rounded-full border text-xs",
                    day.protected
                      ? "border-sky-400/60 bg-sky-500/15 text-sky-400"
                      : day.active
                      ? "border-[rgb(var(--color-primary-light))] bg-[rgb(var(--color-primary))] text-white"
                      : day.today
                        ? "border-[rgb(var(--color-accent))]"
                        : isDaylight ? "border-slate-200 text-slate-400" : "border-white/15 text-white/40",
                  )}>
                    {day.protected
                      ? <Snowflake className="h-3.5 w-3.5" aria-label={t.streakProtectedDay} />
                      : day.active ? <Flame className="h-3.5 w-3.5 fill-current text-[rgb(var(--color-primary-dark))]" aria-label={t.streakCompleted} /> : "·"}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-primary))]/5 p-3">
                <Trophy className="mb-1 h-4 w-4 text-[rgb(var(--color-accent))]" aria-hidden="true" />
                <p className="font-black">{canonical?.streak?.longestDays ?? streak.longestStreak}</p>
                <p className={cn("text-xs", isDaylight ? "text-slate-500" : "text-white/55")}>{t.streakLongestLabel}</p>
              </div>
              <div className="rounded-xl border border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-primary))]/5 p-3">
                <Target className="mb-1 h-4 w-4 text-[rgb(var(--color-primary-light))]" aria-hidden="true" />
                <p className="font-black">{nextMilestone?.days ?? currentStreak}</p>
                <p className={cn("text-xs", isDaylight ? "text-slate-500" : "text-white/55")}>{t.streakNextMilestoneLabel}</p>
              </div>
            </div>

            {nextMilestone && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>{milestoneLabel(nextMilestone.days)}</span>
                  <span>{currentStreak}/{nextMilestone.days}</span>
                </div>
                <div className={cn("h-2 overflow-hidden rounded-full", isDaylight ? "bg-slate-100" : "bg-white/10")} role="progressbar" aria-valuenow={milestoneProgress} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-[rgb(var(--color-primary))]" style={{ width: `${milestoneProgress}%` }} />
                </div>
              </div>
            )}

            <div className={cn("flex items-center gap-2 rounded-xl border border-[rgb(var(--color-primary))]/15 bg-[rgb(var(--color-primary))]/5 p-3 text-xs", isDaylight ? "text-slate-600" : "text-white/60")}>
              {isLoggedIn ? <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" /> : <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />}
              <span>{isLoggedIn
                ? canonical
                  ? t.streakSynced
                  : t.streakAwaitingConfirmation
                : t.streakSavedLocally}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs" aria-label={t.streakFreezeInventory}>
              <span className={cn("flex items-center gap-1.5", isDaylight ? "text-slate-600" : "text-white/60")}>
                <Snowflake className="h-4 w-4 text-sky-400" aria-hidden="true" />
                {t.streakHariJeda}
              </span>
              <span className="font-bold tabular-nums">{streak.freezesAvailable}/1</span>
            </div>

            <button
              type="button"
              disabled={!canShare}
              onClick={() => {
                trackStreakEvent("share_started", {
                  userMode: isLoggedIn ? "logged_in" : "guest",
                  syncState: canonical ? "canonical" : "local",
                  streakDays: shareStreak,
                });
                setDetailsOpen(false);
                onOpenChange?.(false);
                setShareOpen(true);
              }}
              className={cn(
                "flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 font-bold backdrop-blur-xl transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                isDaylight
                  ? "border-emerald-200/80 bg-emerald-100/70 text-emerald-900 shadow-sm hover:bg-emerald-100"
                  : "border-transparent bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary-dark))]",
              )}
            >
              <Share2 className={cn("h-4 w-4", isDaylight ? "text-emerald-700" : "text-current")} aria-hidden="true" />
              {t.streakShareAchievement}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {shareOpen && (
        <StoryShareModal
          item={shareItem}
          onClose={() => {
            setShareOpen(false);
            setDetailsOpen(true);
            onOpenChange?.(true);
          }}
          isDaylight={isDaylight}
        />
      )}
    </>
  );
}
