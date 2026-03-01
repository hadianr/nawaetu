/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Fasting Tracker translations — English
 */

export const fastingTrackerEN = {
    // ── Widget Title ─────────────────────────────────────────────────────────
    fastingTitle: "Fasting Tracker",
    fastingSubtitle: "Record your fasting each day",

    // ── Calendar ─────────────────────────────────────────────────────────────
    fastingCalendarTitle: "Ramadan Calendar",
    fastingCalendarDay: "Day",
    fastingCalendarUnfilled: "Not yet recorded",
    fastingCalendarYearNav: "Year",
    fastingCalendarLegend: "Legend",
    fastingCalendarToday: "Today",

    // ── Fasting Status Labels ─────────────────────────────────────────────────
    fastingStatusFasting: "Fasting",
    fastingStatusNotFasting: "Did Not Fast",
    fastingStatusSick: "Sick",
    fastingStatusTraveling: "Traveling (Safar)",
    fastingStatusMenstruation: "Menstruation (Haid)",
    fastingStatusPostpartum: "Postpartum (Nifas)",
    fastingStatusPregnant: "Pregnant",
    fastingStatusBreastfeeding: "Breastfeeding",
    fastingStatusElderly: "Elderly / Chronic Illness",

    // ── Consequence Labels ────────────────────────────────────────────────────
    fastingConsequenceNone: "No Obligation",
    fastingConsequenceQadha: "Must Make Up (Qadha)",
    fastingConsequenceFidyah: "Must Pay Fidyah",
    fastingConsequenceChoice: "Choice: Qadha or Fidyah",
    fastingConsequenceChoiceNote: "Ruling differs by madzhab — please select yours",

    // ── Day Modal ─────────────────────────────────────────────────────────────
    fastingDayModalTitle: "Day {day} — Ramadan {year}H",
    fastingDayModalStatusLabel: "Fasting Status",
    fastingDayModalNoteLabel: "Notes (optional)",
    fastingDayModalNotePlaceholder: "e.g. travelled from Jakarta to Surabaya...",
    fastingDayModalSave: "Save",
    fastingDayModalCancel: "Cancel",
    fastingDayModalRuling: "Ruling",
    fastingDayModalDalilLabel: "Evidence",

    // ── Madzhab Selector ─────────────────────────────────────────────────────
    fastingMadzhabTitle: "School of Thought (Madzhab)",
    fastingMadzhabSubtitle: "The ruling for pregnant/breastfeeding differs by madzhab",
    fastingMadzhabSuggested: "Common in Southeast Asia",
    fastingMadzhabSelectLabel: "Select your madzhab",
    fastingMadzhabDefault: "Set as my default",
    fastingMadzhabSyafii: "Shafi'i",
    fastingMadzhabHanafi: "Hanafi",
    fastingMadzhabMaliki: "Maliki",
    fastingMadzhabHanbali: "Hanbali",

    // ── Stats Card ────────────────────────────────────────────────────────────
    fastingStatsTitle: "Fasting Summary",
    fastingStatsYear: "Year {year}H",
    fastingStatsTotalFasting: "Days Fasted",
    fastingStatsLogged: "Days Logged",
    fastingStatsPendingQadha: "Pending Qadha",
    fastingStatsPendingFidyah: "Pending Fidyah",
    fastingStatsAllClear: "✅ All obligations fulfilled!",
    fastingStatsViewDetail: "View Qadha Details →",

    // ── Qadha Tracker ─────────────────────────────────────────────────────────
    fastingQadhaTitle: "Qadha Tracker",
    fastingQadhaSubtitle: "Track your fasting debts (hutang puasa)",
    fastingQadhaEmpty: "No pending qadha. Alhamdulillah! 🎉",
    fastingQadhaMarkDone: "Done ✓",
    fastingQadhaMarkDoneToast: "Alhamdulillah! Qadha recorded as fulfilled.",
    fastingQadhaPendingBadge: "{n} days remaining",
    fastingQadhaConsequenceQadha: "Qadha",
    fastingQadhaConsequenceFidyah: "Fidyah",
    fastingQadhaConsequenceChoice: "Qadha / Fidyah",
    fastingQadhaDay: "Day {day} of Ramadan {year}H",
    fastingQadhaReason: "Reason",

    // ── General ──────────────────────────────────────────────────────────────
    fastingFiqhDisclaimer: "Rulings shown are based on scholarly consensus (ijma') and notable ikhtilaf from the four major madzhabs. For complex personal situations, please consult a trusted scholar.",
    fastingToastSaved: "Recorded! Jazakallah khair 🌙",
    fastingFemaleOnlyNote: "This status applies to women only",
    fastingNoDataForYear: "No fasting records for {year}H yet",
} as const;

export type FastingTrackerTranslationKeys = keyof typeof fastingTrackerEN;
