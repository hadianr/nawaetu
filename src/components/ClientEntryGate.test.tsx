/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ClientEntryGate from "@/components/ClientEntryGate";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

vi.mock("@/components/OnboardingOverlay", () => ({
    default: () => <div>Onboarding</div>,
}));

describe("ClientEntryGate", () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.restoreAllMocks();
    });

    it("keeps the application visible while resolving onboarding", async () => {
        render(<ClientEntryGate><main>Home</main></ClientEntryGate>);

        expect(screen.getByText("Home")).toBeTruthy();
        await waitFor(() => expect(screen.getByText("Onboarding")).toBeTruthy());
    });

    it("does not show onboarding after completion", () => {
        window.localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");

        render(<ClientEntryGate><main>Home</main></ClientEntryGate>);

        expect(screen.getByText("Home")).toBeTruthy();
        expect(screen.queryByText("Onboarding")).toBeNull();
    });

    it("does not block the application when storage is unavailable", () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new DOMException("Denied", "SecurityError");
        });
        vi.spyOn(console, "warn").mockImplementation(() => undefined);

        render(<ClientEntryGate><main>Home</main></ClientEntryGate>);

        expect(screen.getByText("Home")).toBeTruthy();
        expect(screen.queryByText("Onboarding")).toBeNull();
    });
});
