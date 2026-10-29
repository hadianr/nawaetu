/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ClientEntryGate, { hasCompletedOnboarding, isPublicContentPath } from "@/components/ClientEntryGate";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const useSessionMock = vi.hoisted(() => vi.fn(() => ({ status: "unauthenticated" })));

const pathnameMock = vi.hoisted(() => vi.fn<() => string | null>(() => "/"));

vi.mock("next-auth/react", () => ({ useSession: useSessionMock }));
vi.mock("next/navigation", () => ({ usePathname: pathnameMock }));

vi.mock("@/components/OnboardingOverlay", () => ({
    default: () => <div>Onboarding</div>,
}));

describe("ClientEntryGate", () => {
    beforeEach(() => {
        window.localStorage.clear();
        useSessionMock.mockReturnValue({ status: "unauthenticated" });
        pathnameMock.mockReturnValue("/");
        vi.restoreAllMocks();
    });

    it.each(["true", "v2", "legacy-marker"]) ("recognizes %s as completed", (marker) => {
        expect(hasCompletedOnboarding(marker)).toBe(true);
    });

    it("treats a missing marker as incomplete", () => {
        expect(hasCompletedOnboarding(null)).toBe(false);
    });

    it("shows onboarding without mounting the application for a new guest", async () => {
        render(<ClientEntryGate><main>Home</main></ClientEntryGate>);

        expect(screen.queryByText("Home")).toBeNull();
        await waitFor(() => expect(screen.getByText("Onboarding")).toBeTruthy());
        expect(screen.queryByText("Home")).toBeNull();
    });

    it("does not show onboarding after completion", async () => {
        window.localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");

        render(<ClientEntryGate><main>Home</main></ClientEntryGate>);

        await waitFor(() => expect(screen.getByText("Home")).toBeTruthy());
        expect(screen.queryByText("Onboarding")).toBeNull();
    });

    it("does not block an authenticated returning user when the marker is missing", async () => {
        useSessionMock.mockReturnValue({ status: "authenticated" });

        render(<ClientEntryGate><main>Home</main></ClientEntryGate>);

        await waitFor(() => expect(screen.getByText("Home")).toBeTruthy());
        expect(screen.queryByText("Onboarding")).toBeNull();
    });

    it("does not block the application when storage is unavailable", async () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new DOMException("Denied", "SecurityError");
        });
        vi.spyOn(console, "warn").mockImplementation(() => undefined);

        render(<ClientEntryGate><main>Home</main></ClientEntryGate>);

        await waitFor(() => expect(screen.getByText("Home")).toBeTruthy());
        expect(screen.queryByText("Onboarding")).toBeNull();
    });

    it("renders public content immediately and layers onboarding on top for a new guest", async () => {
        pathnameMock.mockReturnValue("/quran/1");

        render(<ClientEntryGate><main>Surah</main></ClientEntryGate>);

        expect(screen.getByText("Surah")).toBeTruthy();
        await waitFor(() => expect(screen.getByText("Onboarding")).toBeTruthy());
        expect(screen.getByText("Surah")).toBeTruthy();
    });

    it.each([["/about", true], ["/quran/114", true], ["/sirah/quiz", true], ["/", false], ["/qibla", false], ["/quranx", false], [null, false]])(
        "isPublicContentPath(%s) is %s",
        (path, expected) => expect(isPublicContentPath(path as string | null)).toBe(expected),
    );
});
