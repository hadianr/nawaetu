/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocalStorageAdapter } from "./local-storage.adapter";

describe("LocalStorageAdapter", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores JSON and string values and reads malformed JSON as text", () => {
    const adapter = new LocalStorageAdapter();

    adapter.setItem("object", { enabled: true });
    adapter.setItem("text", "hello");
    localStorage.setItem("malformed", "{not-json");

    expect(adapter.getItem("object")).toEqual({ enabled: true });
    expect(adapter.getItem("text")).toBe("hello");
    expect(adapter.getItem("malformed")).toBe("{not-json");
    expect(adapter.getItem("missing")).toBeNull();
  });

  it("removes and clears values while emitting change events", () => {
    const adapter = new LocalStorageAdapter();
    const listener = vi.fn();
    window.addEventListener("nawaetu_storage_change", listener);

    adapter.setItem("key", "value");
    adapter.removeItem("key");
    adapter.setItem("other", 1);
    adapter.clear();

    expect(listener).toHaveBeenCalledTimes(4);
    expect(listener.mock.calls.map(([event]) => (event as CustomEvent).detail.action)).toEqual([
      "set", "remove", "set", "clear",
    ]);
    expect(adapter.getItem("other")).toBeNull();
    window.removeEventListener("nawaetu_storage_change", listener);
  });

});
