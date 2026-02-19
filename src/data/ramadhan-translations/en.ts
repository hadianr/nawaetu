export const RAMADHAN_EN = {
    // Common
    ramadhanLabel: "Ramadhan",
    ramadhanDay: "Day ",
    ramadhanDay1: "Day 1",
    ramadhanDay30: "Day 30",
    ramadhanCompleted: "completed",
    ramadhanPeriod1: "🌟 First 10 Days — Full of Mercy",
    ramadhanPeriod2: "🙏 Second 10 Days — Full of Forgiveness",
    ramadhanPeriod3: "✨ Last 10 Days — Freedom from Hellfire",

    // Hero Card
    heroRamadhanLabel: "Ramadhan",
    heroDay: "Day ",
    heroDay1: "Day 1",
    heroDay30: "Day 30",
    heroCompleted: "completed",
    heroPeriod1: "🌟 First 10 Days — Full of Mercy",
    heroPeriod2: "🙏 Second 10 Days — Full of Forgiveness",
    heroPeriod3: "✨ Last 10 Days — Freedom from Hellfire",

    // Schedule Card
    scheduleTodayTitle: "Today's Schedule",
    scheduleImsakIn: "Imsak in",
    scheduleFajrIn: "Fajr in",
    scheduleIftarIn: "Iftar in",
    scheduleMaghribIn: "Maghrib in",
    scheduleAlreadyIftar: "Alhamdulillah, already broken fast 🌙",
    scheduleImsak: "Imsak",
    scheduleFajr: "Fajr",
    scheduleMaghrib: "Maghrib",
    scheduleMaghribIftar: "Maghrib (Iftar)",
    scheduleIsha: "Isha",
    scheduleSuhoorDua: "Suhoor Prayer",
    scheduleIftarDua: "Iftar Prayer",
    scheduleCalendar: "Full Calendar",

    // Taraweh Tracker
    tarawehTitle: "Tonight's Tarawih",
    tarawehStreakNights: "Night streak",
    tarawehTotalNights: "Total nights",
    taraweh8Rakaat: "8 Rakaat",
    taraweh20Rakaat: "20 Rakaat",
    tarawehNotYet: "Not Yet",

    // Khataman Progress
    khatamanTitle: "Quran Completion",
    khatamanOf30Juz: "/ 30 Juz",
    khatamanOnTrack: "✓ On track",
    khatamanCatchUp: "⚡ Catch up!",
    khatamanCompleted: "completed",
    khatamanCurrentJuz: "Current Juz",
    khatamanEstimateFinish: "📅 Estimated completion: day {day} of Ramadhan",
    khatamanAlhamdulillah: "🎉 Alhamdulillah, Completed!",

    // Lailatul Qadr Card
    lailatulQadrTitle: "Lailatul Qadr",
    lailatulQadrTonightPossibility: "⭐ Tonight might be Lailatul Qadr!",
    lailatulQadrActiveTonight: "🌟 Tonight is night {night}!",
    lailatulQadrAllPassed: "May our worship be accepted by Allah SWT 🤲",
    lailatulQadrTonightMessage: "Increase your prayers, dhikr, and worship tonight!",
    lailatulQadrVerse: "\"Better than 1000 months\" \u2014 QS. Al-Qadr: 3",
    lailatulQadrNightsLeft: "nights left",
    lailatulQadrBeforeRamadhan: "Last 10 Nights begin on Ramadhan day 21",
    lailatulQadrCurrentlyIn: "Currently Night {night}",
    lailatulQadrSublabel: "More Devoted Prayer & Dua",
    lailatulQadrNotStarted: "Last 10 nights haven't started yet",
    lailatulQadrIn: "Night {night} in",
    lailatulQadrHours: "hours",
    lailatulQadrSectionLabel: "Last 10 Nights of Ramadhan",
    lailatulQadrSearchLabel: "Seek Lailatul Qadr on odd nights",
    lailatulQadrOddNights: "Odd (stronger)",
    lailatulQadrEvenNights: "Even",
    lailatulQadrDalil: "Evidence",
    lailatulQadrDoa: "Dua",

    // Amalan List
    amalanTitle: "Ramadhan Deeds",
    amalanTapHint: "Tap to view intention & evidence",
    amalanTipsLabel: "💡 Deed Tips",

    // Guide Card
    guideTitle: "Ramadhan Fasting Guide",
    guideSubtitle: "Islamic jurisprudence and common questions about fasting",
    guideButtonFiqh: "Fasting Rules",
    guideButtonFiqhDesc: "Obligatory, Recommended, Permissible, Disliked, Forbidden",
    guideButtonFAQ: "Fasting FAQ",
    guideButtonFAQDesc: "Frequently asked questions",

    // Fiqh Modal
    fiqhModalTitle: "Fasting Rules",
    fiqhModalSubtitle: "Five categories of Islamic jurisprudence in Ramadhan fasting",
    fiqhModalEmpty: "No data for this category",

    // FAQ Modal
    faqModalTitle: "Fasting FAQ",
    faqModalSubtitle: "Frequently asked questions about fasting",
    faqDalilLabel: "Evidence",
    faqDisclaimerTitle: "⚠️ Important Note",
    faqDisclaimer: "For complex fiqh issues or special conditions, please consult with a trusted scholar or imam in your area.",

    // Calendar Modal
    calendarViewMonth: "View Monthly Schedule",
    calendarTitle: "Ramadhan Imsakiyah Schedule 1447H",
    calendarYourLocation: "Your Location",
    calendarLoading: "Loading schedule...",
    calendarRetry: "Try Again",
    calendarHeaderRamadhan: "Ramadhan",
    calendarHeaderDate: "Date",
    calendarHeaderImsak: "Imsak",
    calendarHeaderFajr: "Fajr",
    calendarHeaderIftar: "Iftar",
    calendarNoData: "No data available for this period.",

    // Niat Card
    niatModalTitle: "Intention",
    niatViewFull: "View full intention",
    niatArabic: "نَوَيْتُ",
    niatLatin: "Transliteration",
    niatTranslation: "Meaning",
    niatSource: "Source",

    // Dalil Badge
    dalilModalTitle: "Evidence",
    dalilViewFull: "View full evidence",
    dalilTranslation: "Translation",

    // Common Buttons
    buttonOk: "OK",
    buttonClose: "Close",
    buttonSave: "Save",
    buttonCancel: "Cancel",

    // Prayer Status
    prayerCompleted: "Completed",
    prayerPending: "Pending",
    prayerMissed: "Missed",
} as const;

export type RamadhanTranslationKeys = keyof typeof RAMADHAN_EN;
