import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "./logger";
import * as Sentry from "@sentry/nextjs";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  withScope: vi.fn((callback: (scope: { setLevel: () => void; setTag: () => void }) => void) => callback({ setLevel: vi.fn(), setTag: vi.fn() })),
}));

describe("logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("writes structured warning and error payloads", () => {
    logger.warn("fallback", { route: "/test" });
    logger.error("failed", new Error("boom"), { action: "test" });
    logger.error("unknown", "raw error");

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"level":"warn"'));
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('"name":"Error"'));
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('"name":"UnknownError"'));
  });

  it("uses the development info path and production Sentry paths", () => {
    logger.info("development");
    expect(console.log).toHaveBeenCalledWith("[INFO] development", "");

    vi.stubEnv("NODE_ENV", "production");
    logger.error("production error", new Error("boom"));
    logger.fatal("production fatal", new Error("crash"), { route: "/test" });

    expect(Sentry.captureException).toHaveBeenCalled();
    expect(Sentry.withScope).toHaveBeenCalled();
  });
});
