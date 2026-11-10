// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import JourneyAboutDialog from "./JourneyAboutDialog";
import { BASE_SETTINGS_EN } from "@/data/translations/base";

vi.mock("@/context/LocaleContext", () => ({ useLocale: () => ({ t: BASE_SETTINGS_EN, locale: "en" }) }));
vi.mock("@/components/ui/LottieMoment", () => ({
    default: ({ src }: { src: string }) => <span data-testid="lottie" data-src={src} />,
}));

const open = (phase: "reset" | "build" | "sharpen", dayNumber: number, onOpenChange = vi.fn()) =>
    render(<JourneyAboutDialog open onOpenChange={onOpenChange} phase={phase} dayNumber={dayNumber} />);

describe("JourneyAboutDialog", () => {
    it("opens with a hero: the lanterns, the days left and the day of 100", () => {
        open("reset", 11);
        expect(screen.getByTestId("lottie").getAttribute("data-src")).toBe("/lottie/lights.lottie");
        expect(screen.getByText("90 days to go")).toBeTruthy();
        expect(screen.getByText("Day 11 of 100")).toBeTruthy();
        expect(screen.getByText("About 100 Days to Ramadan")).toBeTruthy();
    });

    it("leads with a friendly line, and keeps the not-an-obligation note as a footnote", () => {
        open("reset", 11);
        expect(screen.getByText(/Join as you can; nobody is behind/)).toBeTruthy();
        expect(screen.getByText(/not an obligation/)).toBeTruthy();
        expect(screen.getByText(/five prayers and any fasts you owe stay number one/)).toBeTruthy();
    });

    it("shows where you are inside the current phase and opens it by default", () => {
        open("reset", 11);
        const current = screen.getByRole("listitem", { current: "step" });
        expect(current.textContent).toContain("Phase 1 · Set Your Intention");
        expect(current.textContent).toContain("Day 11 of 30 in this phase");
        expect(current.querySelector("[role=progressbar]")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Source: Quran 2:184" })).toBeTruthy();
    });

    it("keeps the other phases closed until tapped", () => {
        open("reset", 11);
        const build = screen.getByRole("button", { name: /Phase 2 · Build Habits/ });
        expect(build.getAttribute("aria-expanded")).toBe("false");
        expect(screen.queryByText(/Goal: keep one small deed going every day/)).toBeNull();
        fireEvent.click(build);
        expect(build.getAttribute("aria-expanded")).toBe("true");
        expect(screen.getByText(/Goal: keep one small deed going every day/)).toBeTruthy();
    });

    it("marks finished phases with a check", () => {
        open("sharpen", 80);
        expect(screen.getAllByLabelText("Phase done")).toHaveLength(2);
    });

    it("closes from the call to action", () => {
        const onOpenChange = vi.fn();
        open("reset", 11, onOpenChange);
        fireEvent.click(screen.getByRole("button", { name: "Let's go" }));
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});
