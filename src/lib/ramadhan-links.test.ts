import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// While RAMADHAN_PAGE_ENABLED is false the page answers 404, so a link to it is a dead end for the user. A file that
// points at /ramadhan must therefore be guarded by the switch. This scan keeps a new link from slipping through.
const SKIP_DIRS = new Set(["node_modules", "ramadhan", "api"]); // the page itself, its API, and its components
function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return SKIP_DIRS.has(name) || name === "data" ? [] : sourceFiles(path);
        return /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) ? [path] : [];
    });
}

describe("links to the Ramadan page", () => {
    it("every file that points at /ramadhan is guarded by RAMADHAN_PAGE_ENABLED", () => {
        const root = join(process.cwd(), "src");
        const pointing = sourceFiles(root)
            .filter((file) => !file.endsWith(join("lib", "features.ts")))
            .filter((file) => /["'`]\/ramadhan["'`]/.test(readFileSync(file, "utf8")));

        // The scan must actually find the places, or it proves nothing.
        expect(pointing.length).toBeGreaterThanOrEqual(6);
        const unguarded = pointing.filter((file) => !readFileSync(file, "utf8").includes("RAMADHAN_PAGE_ENABLED"));
        expect(unguarded.map((file) => relative(root, file))).toEqual([]);
    });
});
