import { describe, it, expect, vi, beforeEach } from "vitest";
import { getVerseTafsir } from "@/lib/tafsir-api";
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

const makeResponse = (data: unknown, ok = true) =>
    new Response(JSON.stringify(data), { status: ok ? 200 : 500 });

describe("getVerseTafsir", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns cached tafsir when entry is fresh and version matches", async () => {
        const cached = {
            data: { short: "cached", long: "cached long" },
            ts: Date.now(),
            v: 1
        };
        storageMock.getOptional.mockReturnValueOnce(JSON.stringify(cached));

        const result = await getVerseTafsir(1, 1, "id");

        expect(result).toEqual(cached.data);
        expect(fetchWithTimeoutMock).not.toHaveBeenCalled();
    });

    it("fetches and caches when cached entry is expired", async () => {
        const cached = {
            data: { short: "old", long: "old" },
            ts: Date.now() - 8 * 24 * 60 * 60 * 1000,
            v: 1
        };
        storageMock.getOptional.mockReturnValueOnce(JSON.stringify(cached));
        fetchWithTimeoutMock.mockResolvedValueOnce(
            makeResponse({ data: { tafsir: { id: { short: "new", long: "new long" } } } })
        );

        const result = await getVerseTafsir(2, 5, "id");

        expect(result).toEqual({ short: "new", long: "new long" });
        expect(fetchWithTimeoutMock).toHaveBeenCalledTimes(1);
        expect(storageMock.set).toHaveBeenCalledWith(
            expect.stringContaining("quran_tafsir_id_2:5"),
            expect.any(String)
        );
    });

    it("fetches when cached entry version mismatches", async () => {
        const cached = {
            data: { short: "old", long: "old" },
            ts: Date.now(),
            v: 0
        };
        storageMock.getOptional.mockReturnValueOnce(JSON.stringify(cached));
        fetchWithTimeoutMock.mockResolvedValueOnce(
            makeResponse({ data: { tafsir: { id: { short: "fresh", long: "fresh long" } } } })
        );

        const result = await getVerseTafsir(3, 7, "id");

        expect(result).toEqual({ short: "fresh", long: "fresh long" });
        expect(fetchWithTimeoutMock).toHaveBeenCalledTimes(1);
    });
});
