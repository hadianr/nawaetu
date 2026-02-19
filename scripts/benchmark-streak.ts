
import { performance } from 'perf_hooks';

// Mock data structure
interface Intention {
    niatDate: string;
}

// Existing implementation logic
function calculateStreakOld(userIntentions: Intention[], currentDate: string): number {
    if (userIntentions.length === 0) {
        return 1;
    }

    let streak = 0;
    // Normalize dates to midnight for comparison
    const targetDate = new Date(currentDate);
    targetDate.setHours(0, 0, 0, 0);

    // Convert all intention dates to YYYY-MM-DD timestamps
    const intentionDates = userIntentions.map(i => {
        const d = new Date(i.niatDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    });

    // We start checking from the current intention backwards
    let checkDate = new Date(targetDate);

    // Safety loop limit
    while (streak < 3650) {
        if (intentionDates.includes(checkDate.getTime())) {
            streak++;
            // Go to previous day
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

// Optimized implementation logic
function calculateStreakNew(userIntentions: Intention[], currentDate: string): number {
    if (userIntentions.length === 0) {
        return 1;
    }

    let streak = 0;
    // Normalize dates to midnight for comparison
    const targetDate = new Date(currentDate);
    targetDate.setHours(0, 0, 0, 0);

    // OPTIMIZATION: Use Set for O(1) lookup
    const intentionDates = new Set(userIntentions.map(i => {
        const d = new Date(i.niatDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }));

    // We start checking from the current intention backwards
    let checkDate = new Date(targetDate);

    // Safety loop limit
    while (streak < 3650) {
        if (intentionDates.has(checkDate.getTime())) {
            streak++;
            // Go to previous day
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

// Generate test data
function generateData(days: number): { intentions: Intention[], currentDate: string } {
    const intentions: Intention[] = [];
    const endDate = new Date('2023-12-31');
    const currentDateStr = endDate.toISOString().split('T')[0];

    // Generate 'days' of consecutive intentions ending on endDate
    for (let i = 0; i < days; i++) {
        const d = new Date(endDate);
        d.setDate(d.getDate() - i);
        intentions.push({ niatDate: d.toISOString().split('T')[0] });
    }

    // Shuffle the array to simulate random DB return order (though usually ordered)
    // DB query has "orderBy(sql`${intentions.niatDate} DESC`)" so usually ordered.
    // But map() preserves order.
    // Let's keep it ordered as per DB query simulation, though Set doesn't care.
    // The current implementation iterates 'intentionDates' for .includes(), which is O(N).
    // The order in the array doesn't matter for .includes() performance (unless match found early, but here we search for specific timestamps).

    return { intentions, currentDate: currentDateStr };
}

// Run benchmark
function runBenchmark() {
    const iterations = 1000;
    const streakLength = 2000; // Simulate a long streak

    console.log(`Generating data with streak length: ${streakLength}...`);
    const { intentions, currentDate } = generateData(streakLength);

    console.log(`Running benchmark with ${iterations} iterations...`);

    // Warmup
    calculateStreakOld(intentions, currentDate);
    calculateStreakNew(intentions, currentDate);

    // Measure Old
    const startOld = performance.now();
    let resultOld = 0;
    for (let i = 0; i < iterations; i++) {
        resultOld = calculateStreakOld(intentions, currentDate);
    }
    const endOld = performance.now();
    const timeOld = endOld - startOld;

    // Measure New
    const startNew = performance.now();
    let resultNew = 0;
    for (let i = 0; i < iterations; i++) {
        resultNew = calculateStreakNew(intentions, currentDate);
    }
    const endNew = performance.now();
    const timeNew = endNew - startNew;

    console.log('--- Results ---');
    console.log(`Old Implementation Time: ${timeOld.toFixed(2)} ms`);
    console.log(`New Implementation Time: ${timeNew.toFixed(2)} ms`);
    console.log(`Speedup: ${(timeOld / timeNew).toFixed(2)}x`);

    if (resultOld !== resultNew) {
        console.error(`MISMATCH! Old: ${resultOld}, New: ${resultNew}`);
    } else {
        console.log(`Verification: Both returned streak of ${resultOld}`);
    }
}

runBenchmark();
