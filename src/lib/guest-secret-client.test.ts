/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import { ACCOUNT_STORAGE_KEYS } from "./account-data";
import { getGuestSecret, guestHeaders } from "./guest-secret-client";

describe("the device's guest secret", () => {
    beforeEach(() => localStorage.clear());

    it("is created once, long enough for the server to accept, and then stays the same", () => {
        const first = getGuestSecret();
        expect(first.length).toBeGreaterThanOrEqual(16);
        expect(first).toMatch(/^[A-Za-z0-9_-]+$/);
        expect(getGuestSecret()).toBe(first);
    });

    it("goes out as one header, and two devices never share a secret", () => {
        expect(guestHeaders()).toEqual({ "x-guest-secret": getGuestSecret() });
        const mine = getGuestSecret();
        localStorage.clear();
        expect(getGuestSecret()).not.toBe(mine);
    });

    it("belongs to the device, not to an account: signing out must not clear it", () => {
        expect(ACCOUNT_STORAGE_KEYS).not.toContain("nawaetu_guest_secret");
    });

    it("replaces a damaged value instead of sending it", () => {
        localStorage.setItem("nawaetu_guest_secret", "x");
        expect(getGuestSecret().length).toBeGreaterThanOrEqual(16);
    });
});
