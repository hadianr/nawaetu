const TOKEN_KEYS = ["user_token", "fcm_token", "nawaetu_anonymous_id"];

/**
 * Once per account on this device: hands the guest journal (kept on a hidden account named after the
 * device token) to the account that just signed in.
 */
export async function claimGuestIntentions(userId: string): Promise<void> {
    try {
        const flag = `nawaetu_intentions_claimed:${userId}`;
        if (localStorage.getItem(flag)) return;

        const tokens = TOKEN_KEYS.map((key) => localStorage.getItem(key)).filter((token): token is string => Boolean(token));
        if (tokens.length > 0) {
            const response = await fetch("/api/intentions/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tokens, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
            });
            if (!response.ok) return; // try again next time
        }
        localStorage.setItem(flag, "1");
    } catch {
        // Offline: the next start tries again.
    }
}
