// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UdzurSheet from "./UdzurSheet";
import { BASE_SETTINGS_EN } from "@/data/translations/base";
import { UdzurInputError, type UdzurPeriod } from "@/lib/udzur";
import type { UdzurState } from "@/hooks/useUdzur";

const { madzhab } = vi.hoisted(() => ({ madzhab: { value: null as string | null } }));

vi.mock("@/context/LocaleContext", () => ({ useLocale: () => ({ t: BASE_SETTINGS_EN, locale: "en" }) }));
vi.mock("@/core/infrastructure/storage", () => ({ getStorageService: () => ({ getOptional: () => madzhab.value }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), info: vi.fn() } }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));
vi.mock("@/components/ui/LottieMoment", () => ({
    default: ({ src, fallback }: { src: string; fallback?: React.ReactNode }) => <span data-testid="lottie" data-src={src}>{fallback}</span>,
}));

const active: UdzurPeriod = { id: "p1", kind: "haid", startedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(), endedAt: null };

function state(overrides: Partial<UdzurState> = {}): UdzurState {
    return {
        available: true, active: null, excusedToday: false, day: 0, excusedDates: new Set(), periods: [],
        isDateExcused: () => false, isPrayerExcused: () => false,
        start: vi.fn(() => active), end: vi.fn(() => ({ ...active, endedAt: new Date().toISOString() })),
        remove: vi.fn(), clearHistory: vi.fn(),
        ...overrides,
    };
}

describe("UdzurSheet", () => {
    beforeEach(() => { madzhab.value = null; });

    it("turns the mode on with the chosen type, and pauses alerts unless asked to keep them", () => {
        const udzur = state();
        const onOpenChange = vi.fn();
        const onStarted = vi.fn();
        render(<UdzurSheet udzur={udzur} open onOpenChange={onOpenChange} onStarted={onStarted} />);

        expect(screen.getByText(BASE_SETTINGS_EN.udzurIstihadahNote)).toBeTruthy();
        expect(screen.getByRole("link", { name: BASE_SETTINGS_EN.udzurLearnLink }).getAttribute("href")).toBe("/hadith?topic=women");

        fireEvent.click(screen.getByRole("radio", { name: BASE_SETTINGS_EN.udzurKindNifas }));
        fireEvent.click(screen.getByRole("button", { name: BASE_SETTINGS_EN.udzurStartButton }));

        expect(udzur.start).toHaveBeenCalledWith("nifas", expect.any(Date), { keepAlerts: false });
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(onStarted).toHaveBeenCalled();
    });

    it("explains a refused time in words, not a code", () => {
        const udzur = state({ start: vi.fn(() => { throw new UdzurInputError("too_far_back"); }) });
        render(<UdzurSheet udzur={udzur} open onOpenChange={vi.fn()} />);
        fireEvent.click(screen.getByRole("button", { name: BASE_SETTINGS_EN.udzurStartButton }));
        expect(screen.getByRole("alert").textContent).toBe(BASE_SETTINGS_EN.udzurErrorTooFarBack);
    });

    it("ends the mode and shows what comes next, worded for the madhhab", () => {
        madzhab.value = "hanafi";
        const udzur = state({ active, day: 4 });
        render(<UdzurSheet udzur={udzur} open onOpenChange={vi.fn()} />);
        fireEvent.click(screen.getByRole("button", { name: BASE_SETTINGS_EN.udzurEndConfirm }));

        expect(udzur.end).toHaveBeenCalledWith(expect.any(Date));
        expect(screen.getByText(BASE_SETTINGS_EN.udzurGhusl)).toBeTruthy();
        expect(screen.getByText(BASE_SETTINGS_EN.udzurCombineHanafi)).toBeTruthy();
        expect(screen.getByTestId("lottie").getAttribute("data-src")).toBe("/lottie/stars.lottie");
    });

    it("says scholars differ when no madhhab is set", () => {
        render(<UdzurSheet udzur={state({ active })} open onOpenChange={vi.fn()} />);
        fireEvent.click(screen.getByRole("button", { name: BASE_SETTINGS_EN.udzurEndConfirm }));
        expect(screen.getByText(BASE_SETTINGS_EN.udzurCombineUnset)).toBeTruthy();
    });

    it("lets a mode turned on by mistake be deleted", () => {
        const udzur = state({ active });
        render(<UdzurSheet udzur={udzur} open onOpenChange={vi.fn()} />);
        fireEvent.click(screen.getByRole("button", { name: BASE_SETTINGS_EN.udzurDelete }));
        expect(udzur.remove).toHaveBeenCalledWith("p1");
    });
});
