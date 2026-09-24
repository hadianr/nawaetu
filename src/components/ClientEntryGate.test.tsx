/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ClientEntryGate, { hasCompletedOnboarding } from "@/components/ClientEntryGate";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const useSessionMock = vi.hoisted(() => vi.fn(() => ({ status: "unauthenticated" })));

vi.mock("next-auth/react", () => ({ useSession: useSessionMock }));

vi.mock("@/components/OnboardingOverlay", () => ({
    default: () => <div>Onboarding</div>,
}));

describe("ClientEntryGate", () => {
    beforeEach(() => {
        window.localStorage.clear();
        useSessionMock.mockReturnValue({ status: "unauthenticated" });
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
});
