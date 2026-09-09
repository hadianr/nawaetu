import { describe, expect, it } from "vitest";
import { getStorageService, resetStorageService } from "./index";

describe("storage service singleton", () => {
  it("reuses the service until explicitly reset", () => {
    const first = getStorageService();
    expect(getStorageService()).toBe(first);

    resetStorageService();
    expect(getStorageService()).not.toBe(first);
    resetStorageService();
  });
});
