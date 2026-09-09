import { describe, expect, it } from "vitest";
import { ProviderError } from "./provider-interface";

describe("ProviderError", () => {
  it("preserves provider status and retry metadata", () => {
    const error = new ProviderError("rate limited", 429, "RATE_LIMIT", true);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ProviderError");
    expect(error.message).toBe("rate limited");
    expect(error.status).toBe(429);
    expect(error.code).toBe("RATE_LIMIT");
    expect(error.isRetryable).toBe(true);
  });
});
