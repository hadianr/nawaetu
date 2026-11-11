/**
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const mocks = vi.hoisted(() => ({
    values: new Map<string, unknown>(),
    toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
}));

vi.mock("next-auth/react", () => ({
    useSession: () => ({ status: "authenticated", data: { user: { id: "user-1", name: "Aisyah" } } }),
}));
vi.mock("sonner", () => ({ toast: mocks.toast }));
vi.mock("@/hooks/useDataSync", () => ({ useDataSync: () => ({ syncData: vi.fn() }) }));
vi.mock("@/components/ui/AppIcon", () => ({ AppIcon: () => null }));
vi.mock("@/context/LocaleContext", () => ({
    useLocale: () => ({
        t: {
            syncUnsyncedNotice: "since {date} not synced",
            syncUnsyncedUrgent: "{days} days left since {date}",
        },
    }),
}));
vi.mock("@/core/infrastructure/storage", () => {
    const service = {
        getOptional: (key: string) => mocks.values.get(key) ?? null,
        set: (key: string, value: unknown) => { mocks.values.set(key, value); },
        remove: (key: string) => { mocks.values.delete(key); },
    };
    return { getStorageService: () => service };
});

import DataSyncer from "./DataSyncer";

const DAY = 86_400_000;

describe("DataSyncer unsynced warnings", () => {
    beforeEach(() => {
        mocks.values.clear();
        Object.values(mocks.toast).forEach((fn) => fn.mockClear());
        mocks.values.set("nawaetu_login_welcome_user-1", "true");
    });

    it("stays quiet when changes are recent", () => {
        mocks.values.set(STORAGE_KEYS.UNSYNCED_SINCE, Date.now() - 2 * DAY);
        render(<DataSyncer />);
        expect(mocks.toast.info).not.toHaveBeenCalled();
        expect(mocks.toast.warning).not.toHaveBeenCalled();
    });

    it("tells the user after a week, and only once that day", () => {
        mocks.values.set(STORAGE_KEYS.UNSYNCED_SINCE, Date.now() - 8 * DAY);
        const { unmount } = render(<DataSyncer />);
        expect(mocks.toast.info).toHaveBeenCalledTimes(1);
        unmount();
        render(<DataSyncer />);
        expect(mocks.toast.info).toHaveBeenCalledTimes(1);
    });

    it("warns with the days left close to the limit", () => {
        mocks.values.set(STORAGE_KEYS.UNSYNCED_SINCE, Date.now() - 25 * DAY);
        render(<DataSyncer />);
        expect(mocks.toast.warning).toHaveBeenCalledWith(expect.stringContaining("5 days left"), expect.anything());
    });
});
