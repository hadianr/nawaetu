import { describe, it, expect, vi } from 'vitest';
import { trackMetric, WebVitalMetric } from './server-analytics';

describe('server-analytics', () => {
    it('should log metric to console', async () => {
        const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

        const metric: WebVitalMetric = {
            id: 'test-id',
            name: 'FCP',
            value: 100,
            startTime: 0,
            label: 'web-vital'
        };

        await trackMetric(metric);

        expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Web Vital: FCP', metric);

        consoleSpy.mockRestore();
    });
});
