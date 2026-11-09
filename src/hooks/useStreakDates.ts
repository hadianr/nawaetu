import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { getStorageService } from "@/core/infrastructure/storage";
import { useStreak } from "@/hooks/useStreak";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

interface CanonicalProgression {
  userId?: string;
  streak?: { days?: Array<{ localDate: string; status?: string }> };
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

/** The single answer to "which days counted toward the streak" (and which were frozen). */
export function useStreakDates() {
  const { data: session, status } = useSession();
  const { streak } = useStreak();
  const cached = status === "authenticated"
    ? getStorageService().getOptional<CanonicalProgression>(STORAGE_KEYS.CANONICAL_PROGRESSION)
    : null;
  const canonicalDays = cached && session?.user?.id && cached.userId === session.user.id
    ? cached.streak?.days
    : undefined;

  const activeDates = useMemo(() => {
    if (canonicalDays) {
      return new Set(canonicalDays.filter(day => day.status !== "frozen").map(day => day.localDate.slice(0, 10)));
    }
    return consecutiveDates(streak.lastActiveDate, streak.currentStreak);
  }, [canonicalDays, streak.currentStreak, streak.lastActiveDate]);

  const protectedDates = useMemo(() => {
    if (canonicalDays) {
      return new Set(canonicalDays.filter(day => day.status === "frozen").map(day => day.localDate.slice(0, 10)));
    }
    return new Set(streak.protectedDates);
  }, [canonicalDays, streak.protectedDates]);

  return { activeDates, protectedDates };
}
