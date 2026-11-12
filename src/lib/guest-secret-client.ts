/**
 * The device's guest secret (see `guest-secret.ts` on the server). Generated once and kept for as long as the device
 * keeps its guest identity. It is deliberately not part of an account's data: signing out does not remove it.
 */
const STORAGE_KEY = "nawaetu_guest_secret";

function randomSecret(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The secret, created on first use. Empty only when storage is unavailable (then the request is simply unbound). */
export function getGuestSecret(): string {
    try {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (existing && existing.length >= 16) return existing;
        const created = randomSecret();
        localStorage.setItem(STORAGE_KEY, created);
        return created;
    } catch {
        return "";
    }
}

/** Headers to add to every request that names a guest token. */
export function guestHeaders(): Record<string, string> {
    const secret = getGuestSecret();
    return secret ? { "x-guest-secret": secret } : {};
}
