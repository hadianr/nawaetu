import { describe, expect, it } from "vitest";
import { resolveAppIconName } from "./icon-names";

describe("resolveAppIconName", () => {
    it("resolves legacy emoji values for persisted missions", () => {
        expect(resolveAppIconName("🌙")).toBe("moon");
        expect(resolveAppIconName("📖")).toBe("book");
    });

    it("keeps canonical names and safely falls back unknown values", () => {
        expect(resolveAppIconName("sparkles")).toBe("sparkles");
        expect(resolveAppIconName("unknown-icon")).toBe("help");
        expect(resolveAppIconName()).toBe("help");
    });
});
