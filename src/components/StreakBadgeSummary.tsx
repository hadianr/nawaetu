"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";
import { Flame } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { useStreak } from "@/hooks/useStreak";
import { cn } from "@/lib/utils";
import { trackStreakEvent } from "@/lib/analytics/analytics";
import { useStreakCelebration } from "@/hooks/useStreakCelebration";

const StreakBadgeDetails = dynamic(() => import("@/components/StreakBadge"), {
  ssr: false,
});

interface CanonicalProgression {
  userId?: string;
}

const storage = getStorageService();

export default function StreakBadgeSummary() {
  const { t } = useLocale();
  const { data: session, status } = useSession();
  const { display } = useStreak();
  const [detailsOpen, setDetailsOpen] = useState(false);
  useStreakCelebration(() => setDetailsOpen(true));
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const isLoggedIn = status === "authenticated";
  const currentStreak = mounted ? display.streak : 0;
  const isActiveToday = mounted && display.isActiveToday;
  const cachedProgression = isLoggedIn
    ? storage.getOptional<CanonicalProgression>(STORAGE_KEYS.CANONICAL_PROGRESSION)
    : null;
  const hasCanonicalProgression = Boolean(
    cachedProgression?.userId && session?.user?.id && cachedProgression.userId === session.user.id,
  );


  return (
    <>
      <button
        type="button"
        onClick={() => {
          trackStreakEvent("surface_opened", {
            userMode: isLoggedIn ? "logged_in" : "guest",
            syncState: hasCanonicalProgression ? "canonical" : "local",
            streakDays: currentStreak,
          });
          setDetailsOpen(true);
        }}
        className={cn(
          "flex min-h-11 min-w-[60px] items-center justify-center gap-1.5 rounded-full border px-3 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
          isActiveToday
            ? "border-[rgb(var(--color-primary))]/40 bg-[rgb(var(--color-primary))]/15 text-[rgb(var(--color-primary-light))]"
            : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/60 text-[rgb(var(--color-text-muted))]",
        )}
        aria-label={t.streakOpenDetails.replace("{count}", String(currentStreak))}
      >
        <Flame className={cn("h-5 w-5", isActiveToday && "fill-current")} aria-hidden="true" />
        <span className="text-sm font-black tabular-nums">{currentStreak}</span>
      </button>

      {detailsOpen && (
        <StreakBadgeDetails
          modalOnly
          celebrate={false}
          open
          onOpenChange={setDetailsOpen}
        />
      )}
    </>
  );
}
