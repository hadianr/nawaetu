// Helper to get current time context for AI

export interface TimeContext {
    currentTime: string; // HH:MM format
    currentPeriod: string; // "pagi", "siang", "sore", "malam", "subuh"
    nextPrayer: string; // Next prayer name
    timeUntilNextPrayer: string; // Human readable time
}

/**
 * Get current time context for AI
 */
export function getCurrentTimeContext(): TimeContext {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Determine period of day
    let currentPeriod: string;
    if (hours >= 3 && hours < 6) {
        currentPeriod = "subuh";
    } else if (hours >= 6 && hours < 12) {
        currentPeriod = "pagi";
    } else if (hours >= 12 && hours < 15) {
        currentPeriod = "siang";
    } else if (hours >= 15 && hours < 18) {
        currentPeriod = "sore";
    } else {
        currentPeriod = "malam";
    }

    // Approximate prayer times (these would ideally come from actual prayer API)
    // Using Jakarta times as example
    const prayerTimes = {
        Subuh: { hour: 4, minute: 30 },
        Dhuha: { hour: 6, minute: 30 }, // After sunrise
        Dzuhur: { hour: 12, minute: 0 },
        Ashar: { hour: 15, minute: 15 },
        Maghrib: { hour: 18, minute: 0 },
        Isya: { hour: 19, minute: 15 },
        Tahajud: { hour: 3, minute: 0 }
    };

    // Find next prayer
    const currentMinutes = hours * 60 + minutes;
    let nextPrayer = "Subuh";
    let nextPrayerMinutes = 24 * 60 + prayerTimes.Subuh.hour * 60 + prayerTimes.Subuh.minute;

    for (const [prayer, time] of Object.entries(prayerTimes)) {
        const prayerMinutes = time.hour * 60 + time.minute;
        if (prayerMinutes > currentMinutes) {
            if (prayerMinutes < nextPrayerMinutes) {
                nextPrayer = prayer;
                nextPrayerMinutes = prayerMinutes;
            }
        }
    }

    // Calculate time until next prayer
    const minutesUntil = nextPrayerMinutes > currentMinutes
        ? nextPrayerMinutes - currentMinutes
        : (24 * 60) - currentMinutes + nextPrayerMinutes;

    const hoursUntil = Math.floor(minutesUntil / 60);
    const minsUntil = minutesUntil % 60;

    let timeUntilNextPrayer: string;
    if (hoursUntil > 0) {
        timeUntilNextPrayer = `${hoursUntil} jam ${minsUntil} menit lagi`;
    } else {
        timeUntilNextPrayer = `${minsUntil} menit lagi`;
    }

    return {
        currentTime,
        currentPeriod,
        nextPrayer,
        timeUntilNextPrayer
    };
}

/**
 * Get greeting suggestion based on time
 */
export function getTimeSensitiveGreeting(name: string, timeContext: TimeContext): string {
    const { currentPeriod, nextPrayer } = timeContext;

    if (currentPeriod === "subuh") {
        return `Assalamualaikum ${name}! 🌅 Masya Allah, sudah bangun pagi nih. Semangat shalatnya!`;
    } else if (currentPeriod === "pagi") {
        return `Pagi yang berkah ${name}! ☀️ Sempat sholat Dhuha hari ini?`;
    } else if (currentPeriod === "siang") {
        return `Siang kak ${name}! 🌤️ Jangan lupa sholat Dzuhur ya~`;
    } else if (currentPeriod === "sore") {
        return `Sore kak ${name}! 🌇 Sebentar lagi Maghrib nih, ada yang mau ditanyain?`;
    } else {
        return `Malam kak ${name}! 🌙 Gimana ibadahnya hari ini?`;
    }
}
