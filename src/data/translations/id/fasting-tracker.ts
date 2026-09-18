/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Fasting Tracker translations — Bahasa Indonesia
 */

export const fastingTrackerID = {
    // ── Widget Title ─────────────────────────────────────────────────────────
    fastingTitle: "Tracking Puasa",
    fastingSubtitle: "Catat puasamu setiap hari",

    // ── Calendar ─────────────────────────────────────────────────────────────
    fastingCalendarTitle: "Kalender Ramadan",
    fastingCalendarDay: "Hari",
    fastingCalendarUnfilled: "Belum diisi",
    fastingCalendarYearNav: "Tahun",
    fastingCalendarLegend: "Keterangan",
    fastingCalendarToday: "Hari Ini",

    // ── Fasting Status Labels ─────────────────────────────────────────────────
    fastingStatusFasting: "Puasa",
    fastingStatusNotFasting: "Tidak Puasa",
    fastingStatusSick: "Sakit",
    fastingStatusTraveling: "Safar (Perjalanan)",
    fastingStatusMenstruation: "Haid",
    fastingStatusPostpartum: "Nifas",
    fastingStatusPregnant: "Hamil",
    fastingStatusBreastfeeding: "Menyusui",
    fastingStatusElderly: "Lansia / Sakit Permanen",

    // ── Consequence Labels ────────────────────────────────────────────────────
    fastingConsequenceNone: "Tidak Ada Kewajiban",
    fastingConsequenceQadha: "Wajib Qadha",
    fastingConsequenceFidyah: "Wajib Fidyah",
    fastingConsequenceChoice: "Pilihan: Qadha atau Fidyah",
    fastingConsequenceChoiceNote: "Hukum berbeda tiap madzhab — silakan pilih madzhab Anda",

    // ── Day Modal ─────────────────────────────────────────────────────────────
    fastingDayModalTitle: "Hari ke-{day} — Ramadan {year}H",
    fastingDayModalStatusLabel: "Status Puasa",
    fastingDayModalNoteLabel: "Catatan (opsional)",
    fastingDayModalNotePlaceholder: "misal: sedang dalam perjalanan dari Jakarta ke Surabaya...",
    fastingDayModalSave: "Simpan",
    fastingDayModalCancel: "Batal",
    fastingDayModalRuling: "Hukum",
    fastingDayModalDalilLabel: "Dalil",

    // ── Madzhab Selector ─────────────────────────────────────────────────────
    fastingMadzhabTitle: "Madzhab",
    fastingMadzhabSubtitle: "Hukum bagi ibu hamil/menyusui berbeda tiap madzhab",
    fastingMadzhabSuggested: "Umum di Asia Tenggara",
    fastingMadzhabSelectLabel: "Pilih madzhab Anda",
    fastingMadzhabDefault: "Jadikan default saya",
    fastingMadzhabSyafii: "Syafi'i",
    fastingMadzhabHanafi: "Hanafi",
    fastingMadzhabMaliki: "Maliki",
    fastingMadzhabHanbali: "Hanbali",

    // ── Stats Card ────────────────────────────────────────────────────────────
    fastingStatsTitle: "Rekapitulasi Puasa",
    fastingStatsYear: "Tahun {year}H",
    fastingStatsTotalFasting: "Hari Puasa",
    fastingStatsLogged: "Hari Tercatat",
    fastingStatsPendingQadha: "Qadha Tersisa",
    fastingStatsPendingFidyah: "Fidyah Tersisa",
    fastingStatsAllClear: "Semua kewajiban terpenuhi!",
    fastingStatsViewDetail: "Lihat Detail Qadha",

    // ── Qadha Tracker ─────────────────────────────────────────────────────────
    fastingQadhaTitle: "Tracker Hutang Puasa",
    fastingQadhaSubtitle: "Pantau hutang puasa (qadha) Anda",
    fastingQadhaEmpty: "Tidak ada qadha tersisa. Alhamdulillah!",
    fastingQadhaMarkDone: "Sudah",
    fastingQadhaMarkDoneToast: "Alhamdulillah! Qadha tercatat sudah ditunaikan.",
    fastingQadhaPendingBadge: "{n} hari tersisa",
    fastingQadhaConsequenceQadha: "Qadha",
    fastingQadhaConsequenceFidyah: "Fidyah",
    fastingQadhaConsequenceChoice: "Qadha / Fidyah",
    fastingQadhaDay: "Hari ke-{day} Ramadan {year}H",
    fastingQadhaReason: "Sebab",

    // ── General ──────────────────────────────────────────────────────────────
    fastingFiqhDisclaimer: "Hukum yang ditampilkan berdasarkan ijma' ulama dan pendapat-pendapat terkemuka dari empat madzhab utama. Untuk kondisi personal yang kompleks, konsultasikan dengan ulama terpercaya.",
    fastingToastSaved: "Tersimpan! Jazakallah khair",
    fastingFemaleOnlyNote: "Status ini khusus untuk wanita",
    fastingNoDataForYear: "Belum ada catatan puasa untuk tahun {year}H",
} as const;
