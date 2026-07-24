/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import PrayerTimeCard from "../PrayerTimeCard";

vi.mock("next-auth/react", () => ({
    useSession: () => ({ data: { user: { gender: "male" } } }),
}));

vi.mock("@/context/LocaleContext", () => ({
    useLocale: () => ({
        t: {
            prayerImsak: "Imsak",
            prayerFajr: "Subuh",
            prayerDhuhr: "Dzuhur",
            prayerJumuah: "Jumat",
            prayerAsr: "Ashar",
            prayerMaghrib: "Maghrib",
            prayerIsha: "Isya",
        },
    }),
}));

vi.mock("@/core/infrastructure/storage", () => ({
    getStorageService: () => ({
        getOptional: () => "male",
    }),
}));

describe("PrayerTimeCard", () => {
    const mockPrayerTimes = {
        Imsak: "04:20",
        Fajr: "04:30",
        Dhuhr: "12:00",
        Asr: "15:15",
        Maghrib: "18:05",
        Isha: "19:15",
    };

    it("displays Jumat for male user on Friday", () => {
        render(
            <PrayerTimeCard
                hijriDate="15 Safar 1447H"
                gregorianDate="2026-07-24" // 2026-07-24 is Friday
                prayerTimes={mockPrayerTimes}
            />
        );

        expect(screen.getByText("Jumat")).toBeInTheDocument();
        expect(screen.queryByText("Dzuhur")).not.toBeInTheDocument();
    });

    it("displays Dzuhur on non-Friday date", () => {
        render(
            <PrayerTimeCard
                hijriDate="16 Safar 1447H"
                gregorianDate="2026-07-23" // 2026-07-23 is Thursday
                prayerTimes={mockPrayerTimes}
            />
        );

        expect(screen.getByText("Dzuhur")).toBeInTheDocument();
        expect(screen.queryByText("Jumat")).not.toBeInTheDocument();
    });
});
