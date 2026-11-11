/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OnboardingOverlay from "@/components/OnboardingOverlay";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { getStorageService } from "@/core/infrastructure/storage";
import { otherEN as en } from "@/data/translations/en/other";

MotionGlobalConfig.skipAnimations = true;

const sendGAEvent = vi.hoisted(() => vi.fn());
// framer-motion reads the media query once per page, so the preference is mocked per test here.
const reducedMotion = vi.hoisted(() => vi.fn(() => false));

vi.mock("framer-motion", async importOriginal => ({
    ...(await importOriginal<typeof import("framer-motion")>()),
    useReducedMotion: reducedMotion,
}));

vi.mock("next-auth/react", () => ({ useSession: () => ({ status: "unauthenticated" }) }));
vi.mock("@/hooks/useProfile", () => ({ useProfile: () => ({ updateProfile: vi.fn() }) }));
vi.mock("@/context/LocaleContext", async () => {
    const { otherEN } = await import("@/data/translations/en/other");
    return { useLocale: () => ({ t: otherEN, locale: "en" }) };
});
vi.mock("@/lib/analytics/analytics", () => ({ sendGAEvent }));
const theme = vi.hoisted(() => ({ current: "default", setTheme: vi.fn() }));
vi.mock("@/context/ThemeContext", () => ({
    useTheme: () => ({ currentTheme: theme.current, setTheme: theme.setTheme, theme: { colors: { primary: "16 185 129" } } }),
}));
vi.mock("@/components/PatternOverlay", () => ({
    default: () => <div data-testid="pattern" />,
}));
vi.mock("@/components/ui/LottieMoment", () => ({
    default: ({ src }: { src: string }) => <div data-testid="lottie" data-src={src} />,
}));

const next = () => fireEvent.click(screen.getByRole("button", { name: en.onboardingNext }));

describe("OnboardingOverlay", () => {
    beforeEach(() => {
        window.localStorage.clear();
        sendGAEvent.mockClear();
        theme.current = "default";
        theme.setTheme.mockReset().mockImplementation((id: string) => { theme.current = id; });
        reducedMotion.mockReturnValue(false);
    });

    it("walks the three intro slides, each with its own animation, then asks for the name", async () => {
        render(<OnboardingOverlay />);
        expect(screen.getByText(en.onboardingCardPrayerTitle)).toBeTruthy();
        expect(screen.getByTestId("lottie").dataset.src).toBe("/lottie/mosque.lottie");
        expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("1");

        next();
        expect(await screen.findByText(en.onboardingCardQuranTitle)).toBeTruthy();
        expect(screen.getByTestId("lottie").dataset.src).toBe("/lottie/quran.lottie");

        next();
        expect(await screen.findByText(en.onboardingCardIntentionTitle)).toBeTruthy();
        expect(screen.getByTestId("lottie").dataset.src).toBe("/lottie/flame.lottie");

        next();
        expect(await screen.findByText(en.onboardingNameTitle)).toBeTruthy();
        expect(screen.getByTestId("lottie").dataset.src).toBe("/lottie/wave.lottie");
        expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("4");
    });

    it("skips to setup, greets by name, requires a gender, and saves before the welcome", async () => {
        const onComplete = vi.fn();
        render(<OnboardingOverlay onComplete={onComplete} />);

        fireEvent.click(screen.getByRole("button", { name: en.onboardingSkip }));
        fireEvent.change(await screen.findByLabelText(en.onboardingNamePlaceholder), { target: { value: " Aisha " } });
        expect(screen.getByText("Assalamu’alaikum, Aisha")).toBeTruthy();

        next();
        await screen.findByText(en.onboardingGenderTitle);
        expect((screen.getByRole("button", { name: en.onboardingNext }) as HTMLButtonElement).disabled).toBe(true);
        fireEvent.click(screen.getByRole("button", { name: en.onboardingFemaleLabel }));
        next();

        fireEvent.click(await screen.findByRole("button", { name: en.onboardingLocationSkip }));

        const welcome = await screen.findByText("Bismillah, Aisha. Let’s begin.");
        expect(window.localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)).toBe("v2");
        expect(window.localStorage.getItem(STORAGE_KEYS.USER_NAME)).toContain("Aisha");
        expect(sendGAEvent).toHaveBeenCalledWith("onboarding_completed", { version: "v2-motion", theme: "blossom" });
        expect(onComplete).not.toHaveBeenCalled();

        fireEvent.click(welcome);
        await waitFor(() => expect(onComplete).toHaveBeenCalled());
    });

    it("goes straight to the app without the welcome when motion is reduced", async () => {
        reducedMotion.mockReturnValue(true);
        const onComplete = vi.fn();
        render(<OnboardingOverlay onComplete={onComplete} />);

        fireEvent.click(screen.getByRole("button", { name: en.onboardingSkip }));
        await screen.findByText(en.onboardingNameTitle);
        next();
        fireEvent.click(await screen.findByRole("button", { name: en.onboardingMaleLabel }));
        next();
        fireEvent.click(await screen.findByRole("button", { name: en.onboardingLocationSkip }));

        await waitFor(() => expect(onComplete).toHaveBeenCalled());
        expect(screen.queryByText(/Bismillah/)).toBeNull();
    });

    it("starts on Midnight, then suggests a theme for the chosen gender", async () => {
        render(<OnboardingOverlay />);
        expect(theme.setTheme).toHaveBeenCalledWith("midnight");

        fireEvent.click(screen.getByRole("button", { name: en.onboardingSkip }));
        await screen.findByText(en.onboardingNameTitle);
        next();

        fireEvent.click(await screen.findByRole("button", { name: en.onboardingFemaleLabel }));
        expect(theme.setTheme).toHaveBeenLastCalledWith("blossom");
        expect(screen.getByTestId("lottie").dataset.src).toBe("/lottie/blossom.lottie");

        fireEvent.click(screen.getByRole("button", { name: en.onboardingMaleLabel }));
        expect(theme.setTheme).toHaveBeenLastCalledWith("midnight");
        expect(screen.getByTestId("lottie").dataset.src).toBe("/lottie/lights.lottie");
    });

    it("never overrides a theme the user already saved", async () => {
        getStorageService().set(STORAGE_KEYS.SETTINGS_THEME, "sunset");
        render(<OnboardingOverlay />);
        fireEvent.click(screen.getByRole("button", { name: en.onboardingSkip }));
        await screen.findByText(en.onboardingNameTitle);
        next();
        fireEvent.click(await screen.findByRole("button", { name: en.onboardingFemaleLabel }));
        expect(theme.setTheme).not.toHaveBeenCalled();
    });

    it("draws the active theme's pattern above the backdrop on every screen", async () => {
        render(<OnboardingOverlay />);
        expect(await screen.findByTestId("pattern")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: en.onboardingSkip }));
        await screen.findByText(en.onboardingNameTitle);
        expect(screen.getByTestId("pattern")).toBeTruthy();
    });

    it("still suggests a theme when the only saved theme is the default one", async () => {
        getStorageService().set(STORAGE_KEYS.SETTINGS_THEME, "default");
        render(<OnboardingOverlay />);
        expect(theme.setTheme).toHaveBeenCalledWith("midnight");
    });
});
