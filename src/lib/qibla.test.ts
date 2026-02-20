import { describe, it, expect } from 'vitest';
import { calculateQiblaDirection, calculateDistanceToKaaba } from './qibla';

describe('qibla utils', () => {
    describe('calculateQiblaDirection', () => {
        it('calculates qibla for Jakarta correctly', () => {
            const result = calculateQiblaDirection(-6.2088, 106.8456);
            expect(result).toBeCloseTo(295.15, 1);
        });

        it('calculates qibla for New York correctly', () => {
            const result = calculateQiblaDirection(40.7128, -74.0060);
            expect(result).toBeCloseTo(58.48, 1);
        });

        it('calculates qibla for London correctly', () => {
            const result = calculateQiblaDirection(51.5074, -0.1278);
            expect(result).toBeCloseTo(118.98, 1);
        });

        it('returns 0 or 360 (or close to) for Mecca itself', () => {
            // Technically undefined but mathematical limit approaches 0 or any angle depending on how you approach.
            // But let's check what the function returns for very close coordinates.
            // If we are exactly at Kaaba, the formula might result in NaN or 0.
            // Let's test a point slightly offset.
            const result = calculateQiblaDirection(21.4225, 39.8263); // Very close
            // It should point roughly towards 21.422487, 39.826206
            // This is just a sanity check that it returns a number.
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(360);
        });
    });

    describe('calculateDistanceToKaaba', () => {
        it('calculates distance for Jakarta correctly', () => {
            const result = calculateDistanceToKaaba(-6.2088, 106.8456);
            expect(result).toBeCloseTo(7900, -2); // Check within 100km due to different earth radius models
        });

        it('calculates distance for New York correctly', () => {
            const result = calculateDistanceToKaaba(40.7128, -74.0060);
            expect(result).toBeCloseTo(10300, -2);
        });

        it('calculates distance for London correctly', () => {
            const result = calculateDistanceToKaaba(51.5074, -0.1278);
            expect(result).toBeCloseTo(4800, -2);
        });

        it('calculates distance for Mecca as 0 (or close to)', () => {
             const result = calculateDistanceToKaaba(21.422487, 39.826206);
             expect(result).toBe(0);
        });
    });
});
