import { describe, expect, it } from "vitest";
import { StorageError } from "./adapter";

describe("StorageError", () => {
  it("sets its error name and optional code", () => {
    const error = new StorageError("quota exceeded", "QUOTA");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("StorageError");
    expect(error.message).toBe("quota exceeded");
    expect(error.code).toBe("QUOTA");
  });
});
