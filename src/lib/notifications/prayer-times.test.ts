import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } }));

const fetchMock = vi.fn();
const day = (date: string, fajr: string) => ({ date: { gregorian: { date } }, timings: { Fajr: `${fajr} (WIB)`, Dhuhr: "11:41 (WIB)" } });
const calendar = (...entries: ReturnType<typeof day>[]) => ({ ok: true, json: async () => ({ code: 200, data: entries }) }) as Response;
const dayAnswer = (fajr: string) => ({ ok: true, json: async () => ({ data: { timings: { Fajr: fajr } } }) }) as Response;
const urls = () => fetchMock.mock.calls.map((call) => String(call[0]));

// Each test starts with empty caches.
async function load() {
    vi.resetModules();
    return import("./prayer-times");
}

describe("getPrayerTimings", () => {
    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
    });

    it("asks once for a whole month, and answers every later minute and day from it", async () => {
        const { getPrayerTimings } = await load();
        fetchMock.mockResolvedValue(calendar(day("12-11-2026", "04:06"), day("13-11-2026", "04:07")));

        expect((await getPrayerTimings(-6.2, 106.8, "12-11-2026", "20"))?.Fajr).toBe("04:06 (WIB)");
        expect((await getPrayerTimings(-6.2, 106.8, "12-11-2026", "20"))?.Fajr).toBe("04:06 (WIB)"); // the next minute
        expect((await getPrayerTimings(-6.2, 106.8, "13-11-2026", "20"))?.Fajr).toBe("04:07 (WIB)"); // the next day

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(urls()[0]).toContain("/calendar/2026/11?");
    });

    it("uses the cell's centre, so every subscriber in the cell shares one request", async () => {
        const { getPrayerTimings } = await load();
        fetchMock.mockResolvedValue(calendar(day("12-11-2026", "04:06")));

        await getPrayerTimings(-6.2049, 106.8412, "12-11-2026", "20");
        await getPrayerTimings(-6.1801, 106.7899, "12-11-2026", "20"); // another subscriber, same 0.1 degree cell

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(urls()[0]).toContain("latitude=-6.2&longitude=106.8");
    });

    it("sends the Kemenag tune only for method 20, and asks Next to cache the month", async () => {
        const { getPrayerTimings } = await load();
        fetchMock.mockResolvedValue(calendar(day("12-11-2026", "04:06")));

        await getPrayerTimings(-6.2, 106.8, "12-11-2026", "20");
        await getPrayerTimings(51.5, -0.1, "12-11-2026", "3");

        expect(urls()[0]).toContain("tune=2,2,0,4,4,0,0,2,0");
        expect(urls()[1]).not.toContain("tune=");
        expect(fetchMock.mock.calls[0][1]).toMatchObject({ next: { revalidate: 86_400 } });
    });

    it("makes one request for each place and each month, not one per call", async () => {
        const { getPrayerTimings } = await load();
        fetchMock.mockImplementation(async () => calendar(day("12-11-2026", "04:06"), day("01-12-2026", "04:10")));

        await getPrayerTimings(-6.2, 106.8, "12-11-2026", "20");
        await getPrayerTimings(-7.3, 112.7, "12-11-2026", "20"); // another cell
        await getPrayerTimings(-6.2, 106.8, "01-12-2026", "20"); // the next month

        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("lets two groups that start at the same moment share one request", async () => {
        const { getPrayerTimings } = await load();
        fetchMock.mockImplementation(async () => calendar(day("12-11-2026", "04:06")));

        await Promise.all([
            getPrayerTimings(-6.2, 106.8, "12-11-2026", "20"),
            getPrayerTimings(-6.21, 106.79, "12-11-2026", "20"),
        ]);

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("falls back to the single-day answer when the calendar is unavailable or malformed", async () => {
        const { getPrayerTimings } = await load();
        fetchMock.mockImplementation(async (url: string) =>
            String(url).includes("/calendar/") ? ({ ok: false, status: 500 } as Response) : dayAnswer("04:06"));

        expect((await getPrayerTimings(-6.2, 106.8, "12-11-2026", "20"))?.Fajr).toBe("04:06");
        expect(urls().some((url) => url.includes("/timings/12-11-2026?latitude=-6.2&longitude=106.8"))).toBe(true);

        fetchMock.mockImplementation(async (url: string) =>
            String(url).includes("/calendar/") ? ({ ok: true, json: async () => ({ data: "nope" }) }) as Response : dayAnswer("04:07"));
        expect((await getPrayerTimings(-7.3, 112.7, "12-11-2026", "20"))?.Fajr).toBe("04:07");
    });

    it("falls back when the month answered but does not hold that day", async () => {
        const { getPrayerTimings } = await load();
        fetchMock.mockImplementation(async (url: string) =>
            String(url).includes("/calendar/") ? calendar(day("01-11-2026", "04:00")) : dayAnswer("04:06"));
        expect((await getPrayerTimings(-6.2, 106.8, "12-11-2026", "20"))?.Fajr).toBe("04:06");
    });

    it("does not remember a failure: the next minute asks again", async () => {
        const { getPrayerTimings } = await load();
        fetchMock.mockRejectedValue(new TypeError("offline"));
        expect(await getPrayerTimings(-6.2, 106.8, "12-11-2026", "20")).toBeNull();

        fetchMock.mockReset();
        fetchMock.mockResolvedValue(calendar(day("12-11-2026", "04:06")));
        expect((await getPrayerTimings(-6.2, 106.8, "12-11-2026", "20"))?.Fajr).toBe("04:06 (WIB)");
    });

    it("does not call the network for a date it cannot read", async () => {
        const { getPrayerTimings } = await load();
        fetchMock.mockResolvedValue(dayAnswer("04:06"));
        await getPrayerTimings(-6.2, 106.8, "garbage", "20");
        expect(urls().every((url) => url.includes("/timings/"))).toBe(true); // straight to the day fallback, never a calendar
    });
});
