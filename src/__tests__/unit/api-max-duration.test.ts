import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// Every API route sets maxDuration (seconds). Without it the platform default is 300 s, so a stalled
// database connection holds an invocation for five minutes. Short by default, longer only where
// the route really waits on something else.
const API_DIR = join(process.cwd(), "src/app/api");
const DEFAULT_SECONDS = 30;
const LONG_SECONDS = 60;
const LONG_ROUTES = [
    "notifications/prayer-alert",
    "notifications/streak-reminder",
    "notifications/test",
    "notifications/test-push",
    "ramadhan/insight",
    "payment/create",
    "payment/sync",
    "payment/webhook",
    "user/sync",
];

function routeFiles(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) return routeFiles(path);
        return entry.name === "route.ts" ? [path] : [];
    });
}

const routes = routeFiles(API_DIR).map(file => ({
    name: relative(API_DIR, file).replace(/\/route\.ts$/, ""),
    source: readFileSync(file, "utf8"),
}));

const declared = (source: string) => source.match(/^export const maxDuration = (\d+);$/m)?.[1];

describe("maxDuration", () => {
    it("finds the API routes", () => {
        expect(routes.length).toBeGreaterThan(30);
    });

    it("is set on every API route to a literal number, which Next.js requires", () => {
        const missing = routes.filter(route => declared(route.source) === undefined).map(route => route.name);
        expect(missing).toEqual([]);
    });

    it("is 60 s only for the routes that wait on other services, and 30 s everywhere else", () => {
        for (const route of routes) {
            const expected = LONG_ROUTES.includes(route.name) ? LONG_SECONDS : DEFAULT_SECONDS;
            expect(Number(declared(route.source)), route.name).toBe(expected);
        }
    });

    it("lists no route that no longer exists", () => {
        const names = routes.map(route => route.name);
        expect(LONG_ROUTES.filter(name => !names.includes(name))).toEqual([]);
    });

    it("also bounds the AI mentor segment, whose server action calls the language models", () => {
        const layout = readFileSync(join(process.cwd(), "src/app/mentor-ai/layout.tsx"), "utf8");
        expect(Number(declared(layout))).toBe(LONG_SECONDS);
        // Route segment config is not allowed in a client component.
        expect(layout).not.toMatch(/^["']use client["']/m);
    });
});
