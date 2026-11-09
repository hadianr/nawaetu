import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AppIcon } from "@/components/ui/AppIcon";
import LottieMoment from "@/components/ui/LottieMoment";
import { getTranslationText, useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STREAK_ACHIEVEMENT_EVENT, type StreakAchievementEventDetail } from "@/core/repositories/streak.repository";
import { trackStreakEvent } from "@/lib/analytics/analytics";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

/** Shows the streak toast when the streak grows. Mount it once per screen (`enabled` lets a nested copy opt out). */
export function useStreakCelebration(onView: () => void, enabled = true) {
  const { t } = useLocale();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const onViewRef = useRef(onView);

  useEffect(() => {
    onViewRef.current = onView;
  });

  useEffect(() => {
    if (!enabled) return;

    const celebrate = (event: Event) => {
      const { streak, milestone } = (event as CustomEvent<StreakAchievementEventDetail>).detail;
      const localizedMilestone = milestone ? getTranslationText(t, `streakMilestone${milestone.days}`) : null;
      const cached = status === "authenticated"
        ? getStorageService().getOptional<{ userId?: string }>(STORAGE_KEYS.CANONICAL_PROGRESSION)
        : null;

      toast.success(
        localizedMilestone
          ? t.streakCelebrationMilestone.replace("{milestone}", localizedMilestone)
          : t.streakCelebrationExtended.replace("{count}", String(streak.currentStreak)),
        {
          description: milestone
            ? t.streakCelebrationReward.replace("{hasanah}", String(milestone.xp))
            : t.streakCelebrationKeepGoing,
          icon: milestone
            ? <AppIcon name={milestone.iconKey ?? "sparkles"} size="sm" tone="primary" />
            : (
              <LottieMoment
                src="/lottie/flame.lottie"
                className="size-7"
                fallback={<AppIcon name="sparkles" size="sm" tone="primary" />}
              />
            ),
          action: { label: t.streakCelebrationView, onClick: () => onViewRef.current() },
        },
      );
      trackStreakEvent(milestone ? "milestone_reached" : "streak_extended", {
        userMode: status === "authenticated" ? "logged_in" : "guest",
        syncState: cached?.userId && cached.userId === userId ? "canonical" : "local",
        streakDays: streak.currentStreak,
      });
    };

    window.addEventListener(STREAK_ACHIEVEMENT_EVENT, celebrate);
    return () => window.removeEventListener(STREAK_ACHIEVEMENT_EVENT, celebrate);
  }, [enabled, status, userId, t]);
}
