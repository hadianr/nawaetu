import { describe, expect, it, vi } from "vitest";
import { StorageService } from "./service";
import type { StorageAdapter } from "./adapter";

function createAdapter(): StorageAdapter & { values: Map<string, unknown> } {
  const values = new Map<string, unknown>();
  return {
    values,
    getItem: <T>(key: string) => (values.has(key) ? values.get(key) as T : null),
    setItem: vi.fn((key: string, value: unknown) => values.set(key, value)),
    removeItem: vi.fn((key: string) => values.delete(key)),
    clear: vi.fn(() => values.clear()),
  };
}

describe("StorageService", () => {
  it("reads values with optional and default fallbacks", () => {
    const adapter = createAdapter();
    adapter.values.set("existing", "value");
    const service = new StorageService(adapter);

    expect(service.get("existing", "fallback")).toBe("value");
    expect(service.get("missing", "fallback")).toBe("fallback");
    expect(service.getOptional("missing")).toBeNull();
    expect(service.has("existing")).toBe(true);
    expect(service.has("missing")).toBe(false);
  });

  it("delegates writes and collection operations", () => {
    const adapter = createAdapter();
    const service = new StorageService(adapter);

    service.set("one", 1);
    service.setMany(new Map([["two", 2], ["three", 3]]));
    expect(service.getMany<number>(["one", "two", "missing"])).toEqual([1, 2, null]);

    service.remove("one");
    expect(service.has("one")).toBe(false);
    service.clear();
    expect(adapter.values.size).toBe(0);
    expect(adapter.setItem).toHaveBeenCalledTimes(3);
    expect(adapter.removeItem).toHaveBeenCalledWith("one");
    expect(adapter.clear).toHaveBeenCalledOnce();
  });
});
