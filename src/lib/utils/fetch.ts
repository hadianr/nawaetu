type FetchInit = RequestInit & { next?: unknown };

type FetchWithTimeoutOptions = {
    timeoutMs?: number;
};

export async function fetchWithTimeout(
    input: RequestInfo | URL,
    init: FetchInit = {},
    options: FetchWithTimeoutOptions = {}
) {
    const { timeoutMs = 8000 } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const signal = init.signal && "any" in AbortSignal
        ? (AbortSignal as typeof AbortSignal & { any: (signals: AbortSignal[]) => AbortSignal }).any([init.signal, controller.signal])
        : controller.signal;

    try {
        return await fetch(input, { ...init, signal });
    } finally {
        clearTimeout(timeoutId);
    }
}
