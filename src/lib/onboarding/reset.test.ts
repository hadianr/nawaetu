import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetOnboardingForDevelopment } from "./reset";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

describe("resetOnboardingForDevelopment", () => {
    beforeEach(() => vi.stubEnv("NODE_ENV", "development"));

    it("removes only the onboarding marker", () => {
        const removeItem = vi.fn();
        expect(resetOnboardingForDevelopment({ removeItem })).toBe(true);
        expect(removeItem).toHaveBeenCalledOnce();
        expect(removeItem).toHaveBeenCalledWith(STORAGE_KEYS.ONBOARDING_COMPLETED);
    });

    it("is disabled outside development", () => {
        vi.stubEnv("NODE_ENV", "production");
        expect(resetOnboardingForDevelopment({ removeItem: vi.fn() })).toBe(false);
    });
});
