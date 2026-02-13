export interface WebVitalMetric {
    id: string;
    name: string;
    startTime: number;
    value: number;
    label: 'web-vital' | 'custom';
}

export interface AnalyticsProvider {
    trackMetric(metric: WebVitalMetric): Promise<void>;
}

class ConsoleAnalyticsProvider implements AnalyticsProvider {
    async trackMetric(metric: WebVitalMetric): Promise<void> {
        console.info(`[Analytics] Web Vital: ${metric.name}`, metric);
    }
}

// Factory to get the configured provider
export function getAnalyticsProvider(): AnalyticsProvider {
    // In future, return different provider based on config
    return new ConsoleAnalyticsProvider();
}

/**
 * Tracks a web vital metric using the configured analytics provider.
 */
export async function trackMetric(metric: WebVitalMetric): Promise<void> {
    const provider = getAnalyticsProvider();
    await provider.trackMetric(metric);
}
