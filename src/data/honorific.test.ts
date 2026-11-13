import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Fields copied unchanged from HadeethEnc/QuranEnc; their policy forbids altering the source text.
const COPIED_FIELDS: Record<string, string[]> = {
    "src/data/hadiths/civic-life.ts": ["translation", "translationEn", "arabic"],
    "src/data/history/content.ts": ["translation", "translationEn", "arabic"],
};

function files(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return files(path);
        return /\.(ts|tsx|json)$/.test(name) && !name.includes(".test.") ? [path] : [];
    });
}

describe("Prophet's honorific", () => {
    it("is written as SAW in Nawaetu's own text", () => {
        const offenders: string[] = [];
        for (const file of [...files("src/data"), ...files("src/components"), ...files("src/app")]) {
            const copied = COPIED_FIELDS[file.replaceAll("\\", "/")] ?? [];
            readFileSync(file, "utf8").split("\n").forEach((line, i) => {
                if (!line.includes("ﷺ")) return;
                const key = line.match(/^\s*"?([A-Za-z_]+)"?\s*:/)?.[1];
                if (!key || !copied.includes(key)) offenders.push(`${file}:${i + 1}`);
            });
        }
        expect(offenders).toEqual([]);
    });
});
