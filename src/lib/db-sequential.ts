type Results<T extends readonly PromiseLike<unknown>[]> = { -readonly [K in keyof T]: Awaited<T[K]> };

/**
 * Like `Promise.all`, but runs the queries one at a time, in order.
 *
 * Why: our database client has a single pooled connection, and several queries in flight at once
 * on it can wedge it permanently (every database route then hangs until the server restarts).
 *
 * Pass drizzle query builders. They are lazy: a query only starts when it is awaited, which is what
 * keeps them from overlapping here. Do not pass promises that are already running, such as `fetch()`.
 */
export async function inSequence<const T extends readonly PromiseLike<unknown>[]>(queries: T): Promise<Results<T>> {
    const results: unknown[] = [];
    for (const query of queries) results.push(await query);
    return results as Results<T>;
}
