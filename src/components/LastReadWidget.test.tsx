import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import LastReadWidget from "@/components/LastReadWidget";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const storageMock = {
    getOptional: vi.fn(),
    set: vi.fn(),
    remove: vi.fn()
};

vi.mock("@/core/infrastructure/storage", () => ({
    getStorageService: () => storageMock
}));

const fetchWithTimeoutMock = vi.fn();
vi.mock("@/lib/utils/fetch", () => ({
    fetchWithTimeout: (...args: unknown[]) => fetchWithTimeoutMock(...args)
}));

vi.mock("@/context/LocaleContext", () => ({
    useLocale: () => ({
        t: {
            homeLastReadStartTitle: "Start",
            homeLastReadStartSubtitle: "Subtitle",
            homeLastReadLabel: "Last Read"
        }
    })
}));

vi.mock("next/link", () => ({
    default: ({ children }: { children: React.ReactNode }) => children
}));

const makeResponse = (data: unknown, ok = true) =>
    new Response(JSON.stringify(data), { status: ok ? 200 : 500 });

describe("LastReadWidget cache", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        const lastRead = {
            surahId: 1,
            surahName: "Al-Fatihah",
            verseId: 1,
            timestamp: Date.now()
        };
        storageMock.getOptional.mockImplementation((key: string) => {
            if (key === STORAGE_KEYS.QURAN_LAST_READ) {
                return JSON.stringify(lastRead);
            }
            if (key === "verse_1_1") {
                return JSON.stringify({
                    data: { arabic: "old", translation: "old" },
                    ts: Date.now() - 8 * 24 * 60 * 60 * 1000,
                    v: 1
                });
            }
            return null;
        });
    });

    it("refetches verse content when cached entry is expired", async () => {
        fetchWithTimeoutMock.mockResolvedValueOnce(
            makeResponse({ verse: { text_uthmani: "new", translations: [{ text: "new" }] } })
        );

        render(<LastReadWidget />);

        await waitFor(() => {
            expect(fetchWithTimeoutMock).toHaveBeenCalledTimes(1);
        });

        expect(storageMock.remove).toHaveBeenCalledWith("verse_1_1");
        expect(storageMock.set).toHaveBeenCalledWith(
            "verse_1_1",
            expect.any(String)
        );
    });
});
