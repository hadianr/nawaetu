"use client";

export const LEVEL_THRESHOLDS = [
    0,      // Level 1 starts at 0 XP
    100,    // Level 2
    300,    // Level 3
    600,    // Level 4
    1000,   // Level 5 (Unlock: Pencari Rahmat)
    1500,   // Level 6
    2100,   // Level 7
    2800,   // Level 8
    3600,   // Level 9
    4500,   // Level 10 (Unlock: Pejuang Subuh)
    // ... continues scaling
];

export interface PlayerStats {
    xp: number;
    level: number;
    nextLevelXp: number;
    progress: number; // 0-100 percentage
}

export function getPlayerStats(): PlayerStats {
    if (typeof window === "undefined") {
        return { xp: 0, level: 1, nextLevelXp: 100, progress: 0 };
    }

    let currentXP = parseInt(localStorage.getItem("user_xp") || "0");
    if (isNaN(currentXP)) currentXP = 0;

    // Calculate Level
    let level = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (currentXP >= LEVEL_THRESHOLDS[i]) {
            level = i + 1;
        } else {
            break;
        }
    }

    const currentLevelBase = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextLevelBase = LEVEL_THRESHOLDS[level] || (currentLevelBase + 1000);

    const xpInLevel = currentXP - currentLevelBase;
    const xpNeeded = nextLevelBase - currentLevelBase;

    // Progress %
    const progress = Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));

    return {
        xp: currentXP,
        level,
        nextLevelXp: nextLevelBase,
        progress
    };
}

export function addXP(amount: number) {
    if (typeof window === "undefined") return;

    let currentXP = parseInt(localStorage.getItem("user_xp") || "0");
    if (isNaN(currentXP)) currentXP = 0;

    const newXP = currentXP + amount;

    localStorage.setItem("user_xp", newXP.toString());

    // Dispatch events to update UI
    window.dispatchEvent(new Event("xp_updated"));
    window.dispatchEvent(new Event("storage"));
}
