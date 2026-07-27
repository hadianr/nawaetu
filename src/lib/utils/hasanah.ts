/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Centralized Hasanah Calculation Utility
 */

export function calculateHasanahReward(baseHasanah: number, isBackdated: boolean = false): number {
    return isBackdated ? Math.floor(baseHasanah * 0.5) : baseHasanah;
}

export function formatHasanahRange(
    baseReward: number,
    options?: { hasanahReward: number }[],
    isBackdated: boolean = false
): string {
    if (options && options.length > 0) {
        const rewards = options.map(o => calculateHasanahReward(o.hasanahReward, isBackdated));
        const min = Math.min(...rewards);
        const max = Math.max(...rewards);
        return min === max ? `+${min}` : `+${min}-${max}`;
    }
    const amount = calculateHasanahReward(baseReward, isBackdated);
    return `+${amount}`;
}
