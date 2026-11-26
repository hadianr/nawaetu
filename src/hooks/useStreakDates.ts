import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { getStorageService } from "@/core/infrastructure/storage";
import { useStreak } from "@/hooks/useStreak";
import { useUdzur } from "@/hooks/useUdzur";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

interface CanonicalProgression {
  userId?: string;
  streak?: { days?: Array<{ localDate: string; status?: string }> };
}

/** The last `count` streak days up to `lastDate`, skipping excused (udzur) days, which bridge without counting. */
function consecutiveDates(lastDate: string, count: number, excused: ReadonlySet<string>): Set<string> {
  const result = new Set<string>();
  const cursor = new Date(`${lastDate}T00:00:00Z`);
  if (Number.isNaN(cursor.getTime())) return result;

  // Bounded: a streak day per step, plus at most the excused days in between.
  for (let guard = 0; result.size < count && guard < count + excused.size + 1; guard++) {
    const date = cursor.toISOString().slice(0, 10);
    if (!excused.has(date) || guard === 0) result.add(date);
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return result;
}

/** The single answer to "which days counted toward the streak" (and which were frozen). */
export function useStreakDates() {
  const { data: session, status } = useSession();
  const { streak } = useStreak();
  const { excusedDates } = useUdzur();
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
    return consecutiveDates(streak.lastActiveDate, streak.currentStreak, excusedDates);
  }, [canonicalDays, streak.currentStreak, streak.lastActiveDate, excusedDates]);

  const protectedDates = useMemo(() => {
    if (canonicalDays) {
      return new Set(canonicalDays.filter(day => day.status === "frozen").map(day => day.localDate.slice(0, 10)));
    }
    return new Set(streak.protectedDates);
  }, [canonicalDays, streak.protectedDates]);

  return { activeDates, protectedDates, excusedDates };
}
