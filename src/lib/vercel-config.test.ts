import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The database (Supabase, ap-southeast-1) and Redis (Upstash) are in Asia. Functions that run in Virginia pay about 230 ms
// for every query and every Redis call, so they run in Singapore. This guards against the setting being lost.
describe("vercel.json", () => {
    const config = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8"));

    it("runs functions in Singapore, next to the database and Redis", () => {
        expect(config.regions).toEqual(["sin1"]);
    });

    it("keeps the build settings", () => {
        expect(config.installCommand).toContain("npm ci");
        expect(config.ignoreCommand).toContain("git diff");
    });
});
