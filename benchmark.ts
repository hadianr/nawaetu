import { measurePerformance } from "vitest";

async function mockDbWait() {
    return new Promise(resolve => setTimeout(resolve, 10)); // 10ms network/db latency
}

async function runSequential(items: number[]) {
    const start = Date.now();
    for (const item of items) {
        await mockDbWait();
    }
    return Date.now() - start;
}

async function runParallel(items: number[]) {
    const start = Date.now();
    const promises = items.map(() => mockDbWait());
    await Promise.all(promises);
    return Date.now() - start;
}

async function main() {
    const items = Array.from({ length: 50 }).map((_, i) => i);

    console.log("Measuring Sequential (N+1)...");
    const seqTime = await runSequential(items);
    console.log(`Sequential time: ${seqTime}ms`);

    console.log("Measuring Parallel...");
    const parTime = await runParallel(items);
    console.log(`Parallel time: ${parTime}ms`);

    console.log(`Improvement: ${(seqTime / parTime).toFixed(2)}x faster`);
}

main().catch(console.error);
