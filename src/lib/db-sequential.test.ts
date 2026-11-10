import { describe, expect, it } from "vitest";
import { inSequence } from "@/lib/db-sequential";

// A lazy query like a drizzle builder: it only starts when awaited.
function lazyQuery<T>(value: T, tracker: { inFlight: number; maxInFlight: number; started: string[] }, name: string, fail = false) {
    return {
        then<R1, R2>(resolve: (value: T) => R1, reject: (reason: unknown) => R2) {
            tracker.started.push(name);
            tracker.inFlight += 1;
            tracker.maxInFlight = Math.max(tracker.maxInFlight, tracker.inFlight);
            return new Promise<T>((done, failed) => setTimeout(() => {
                tracker.inFlight -= 1;
                if (fail) failed(new Error(`${name} failed`));
                else done(value);
            }, 5)).then(resolve, reject);
        },
    } as PromiseLike<T>;
}

const newTracker = () => ({ inFlight: 0, maxInFlight: 0, started: [] as string[] });

describe("inSequence", () => {
    it("never has two queries in flight, while Promise.all would overlap them", async () => {
        const sequential = newTracker();
        await inSequence([1, 2, 3, 4, 5].map(n => lazyQuery(n, sequential, `q${n}`)));
        expect(sequential.maxInFlight).toBe(1);

        const parallel = newTracker();
        await Promise.all([1, 2, 3, 4, 5].map(n => lazyQuery(n, parallel, `q${n}`)));
        expect(parallel.maxInFlight).toBe(5);
    });

    it("returns results in order, keeping each query's own type", async () => {
        const tracker = newTracker();
        const [text, count, list] = await inSequence([
            lazyQuery("a", tracker, "text"),
            lazyQuery(2, tracker, "count"),
            lazyQuery([true], tracker, "list"),
        ]);
        expect(text.toUpperCase()).toBe("A");
        expect(count + 1).toBe(3);
        expect(list[0]).toBe(true);
        expect(tracker.started).toEqual(["text", "count", "list"]);
    });

    it("stops at the first failure and does not start the rest", async () => {
        const tracker = newTracker();
        await expect(inSequence([
            lazyQuery(1, tracker, "first"),
            lazyQuery(2, tracker, "second", true),
            lazyQuery(3, tracker, "third"),
        ])).rejects.toThrow("second failed");
        expect(tracker.started).toEqual(["first", "second"]);
    });

    it("handles an empty list", async () => {
        expect(await inSequence([])).toEqual([]);
    });
});
