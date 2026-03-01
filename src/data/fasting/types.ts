/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * Shared types for the Ramadan Fasting Tracker module.
 * These are PURE client-side types; DB types live in schema.ts.
 */

export type FastingStatus =
    | "fasting"       // ✅ Puasa penuh
    | "not_fasting"   // ❌ Tidak puasa (sengaja/tanpa uzur)
    | "sick"          // 🤒 Sakit
    | "traveling"     // ✈️ Safar
    | "menstruation"  // 🌸 Haid
    | "postpartum"    // 🌺 Nifas
    | "pregnant"      // 🤰 Hamil
    | "breastfeeding" // 🤱 Menyusui
    | "elderly";      // 👴 Lansia/sakit permanen

export type FastingConsequence = "none" | "qadha" | "fidyah" | "choice";

export type Madzhab = "syafii" | "hanafi" | "maliki" | "hanbali";

/** One day's fasting record */
export interface FastingDayLog {
    status: FastingStatus;
    consequence: FastingConsequence;
    madzhab?: Madzhab;
    note?: string;
    qadhaDone?: boolean; // true = qadha/fidyah already fulfilled
}

/** key: "01" … "30" (hijriDay padded to 2 digits) */
export type FastingYearLog = Record<string, FastingDayLog>;

/** key: hijriYear as string, e.g. "1447" */
export type AllFastingLogs = Record<string, FastingYearLog>;

/** Computed stats for a given year */
export interface FastingYearStats {
    totalFasting: number;
    totalMissed: number;        // not_fasting without excuse
    totalQadha: number;         // days requiring qadha
    totalFidyah: number;        // days requiring fidyah
    totalChoice: number;        // days where choice applies (hamil/menyusui — some madzhab)
    pendingQadha: number;       // qadha not yet done
    pendingFidyah: number;      // fidyah not yet done
    totalLogged: number;        // days user has filled in
}

/** Helper to build a storage key for a specific day */
export function makeDayKey(hijriDay: number): string {
    return String(hijriDay).padStart(2, "0");
}

/** Helper to build a year-level storage key */
export function makeYearKey(hijriYear: number): string {
    return String(hijriYear);
}
