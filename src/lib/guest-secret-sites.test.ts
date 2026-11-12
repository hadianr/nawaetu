import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// A call to a guest journal route that forgets the secret header is refused (403) as soon as the account is bound to a
// device, and the user's journal appears empty. Checking the sources keeps a new call site from being missed.
function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return name === "api" ? [] : sourceFiles(path);
        return /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) ? [path] : [];
    });
}

describe("guest journal call sites", () => {
    it("every client call to a guest journal route sends the device's secret", () => {
        const callers = sourceFiles(join(process.cwd(), "src"))
            .filter((file) => !file.endsWith("guest-secret-client.ts"))
            .filter((file) => /fetch(WithTimeout)?\([^)]*\/api\/intentions\/(daily|today|reflect|history|claim)/.test(readFileSync(file, "utf8")));
        // The scan must actually find the sites, or it proves nothing.
        expect(callers.length).toBeGreaterThanOrEqual(6);
        expect(callers.filter((file) => !readFileSync(file, "utf8").includes("guestHeaders()"))).toEqual([]);
    });
});
