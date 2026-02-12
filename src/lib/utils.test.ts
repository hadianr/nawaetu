import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", true && "bar", false && "baz")).toBe("foo bar");
    expect(cn("foo", null, undefined, 0, "")).toBe("foo");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("px-2 py-1", "p-4")).toBe("p-4");
  });

  it("handles objects and arrays", () => {
    expect(cn({ "bg-red-500": true, "text-white": false }, ["p-4", "m-2"])).toBe("bg-red-500 p-4 m-2");
  });
});
