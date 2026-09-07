/**
 * @vitest-environment jsdom
 */
import { act, render } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import { GuestSyncManager } from "@/components/auth/GuestSyncManager";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const mocks = vi.hoisted(() => ({
    useSession: vi.fn(),
    useLocale: vi.fn(),
    fetch: vi.fn(),
    sendGAEvent: vi.fn(),
    toast: {
        info: vi.fn(),
        success: vi.fn(),
        error: vi.fn(),
    },
    storageValues: new Map<string, unknown>(),
    storage: {
        getOptional: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
    },
}));

vi.mock("next-auth/react", () => ({ useSession: mocks.useSession }));
vi.mock("@/context/LocaleContext", () => ({ useLocale: mocks.useLocale }));
vi.mock("@/core/infrastructure/storage", () => ({
    getStorageService: () => mocks.storage,
}));
vi.mock("@/lib/analytics/analytics", () => ({ sendGAEvent: mocks.sendGAEvent }));
vi.mock("sonner", () => ({ toast: mocks.toast }));

function jsonResponse(body: unknown, status = 200): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
    } as Response;
}

async function runSync(): Promise<void> {
    render(<GuestSyncManager />);

    await act(async () => {
        vi.advanceTimersByTime(1200);
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
    });
}

describe("GuestSyncManager sync branches", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        mocks.storageValues.clear();
        mocks.storage.getOptional.mockImplementation((key: string) => mocks.storageValues.get(key) ?? null);
        mocks.storage.set.mockImplementation((key: string, value: unknown) => {
            mocks.storageValues.set(key, value);
        });
        mocks.useSession.mockReturnValue({
            status: "authenticated",
            data: { user: { id: "user-1" } },
        });
        mocks.useLocale.mockReturnValue({ t: {} });
        vi.stubGlobal("fetch", mocks.fetch);
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("hydrates an account that already has server progress", async () => {
        mocks.fetch.mockResolvedValueOnce(jsonResponse({
            profile: { name: "Aisyah", gender: "female" },
        }));

        await runSync();

        expect(mocks.fetch).toHaveBeenCalledTimes(1);
        expect(mocks.fetch).toHaveBeenCalledWith("/api/user/full-data");
        expect(mocks.storage.set).toHaveBeenCalledWith(STORAGE_KEYS.USER_NAME, "Aisyah");
        expect(mocks.storage.set).toHaveBeenCalledWith(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");
        expect(mocks.storage.set).toHaveBeenCalledWith(STORAGE_KEYS.LAST_SYNC_USER_ID, "user-1");
    });

    it("uploads local guest data only for an eligible new account", async () => {
        mocks.storageValues.set(STORAGE_KEYS.USER_NAME, "Aisyah");
        mocks.fetch
            .mockResolvedValueOnce(jsonResponse({ profile: { guestSyncEligible: true } }))
            .mockResolvedValueOnce(jsonResponse({ success: true }));

        await runSync();

        expect(mocks.fetch).toHaveBeenCalledTimes(2);
        expect(mocks.fetch).toHaveBeenNthCalledWith(1, "/api/user/full-data");
        expect(mocks.fetch).toHaveBeenNthCalledWith(
            2,
            "/api/user/sync-guest",
            expect.objectContaining({ method: "POST" }),
        );
        expect(mocks.storage.set).toHaveBeenCalledWith(STORAGE_KEYS.LAST_SYNC_USER_ID, "user-1");
    });

    it("preserves local guest data when the account is not eligible", async () => {
        mocks.storageValues.set(STORAGE_KEYS.USER_NAME, "Aisyah");
        mocks.fetch.mockResolvedValueOnce(jsonResponse({ profile: {} }));

        await runSync();

        expect(mocks.fetch).toHaveBeenCalledTimes(1);
        expect(mocks.storage.set).toHaveBeenCalledWith(STORAGE_KEYS.LAST_SYNC_USER_ID, "user-1");
        expect(mocks.storageValues.get(STORAGE_KEYS.USER_NAME)).toBe("Aisyah");
    });

    it("consumes eligibility when both server and local data are empty", async () => {
        mocks.fetch
            .mockResolvedValueOnce(jsonResponse({ profile: { guestSyncEligible: true } }))
            .mockResolvedValueOnce(jsonResponse({ success: true }));

        await runSync();

        expect(mocks.fetch).toHaveBeenNthCalledWith(
            2,
            "/api/user/sync-guest",
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({ consumeOnly: true }),
            }),
        );
        expect(mocks.storage.set).toHaveBeenCalledWith(STORAGE_KEYS.LAST_SYNC_USER_ID, "user-1");
    });
});
