/*
 * Injected into the page with `anoa eval`. It stands in for the whole backend so the REAL client code
 * (session provider, GuestSyncManager, DataSyncer, tracker, queue, pull, merge) runs in a real browser
 * without a database or a Google login. Every /api request is answered here and never leaves the page,
 * so nothing a test does can reach a real database.
 *
 * It exposes window.__fake: { state, log }. `log` records every /api request the page made.
 */
(() => {
    if (window.__fake) return "already installed";

    const state = {
        user: { id: "u1", name: "Anoa Tester", email: "tester@example.com" },
        serverMissions: [],          // [{ missionId, completedDate, hasanahEarned }]
        hasanah: 0,
        holdSync: false,             // answer /api/user/sync with 503 so changes stay queued
        offline: false,              // behave like a dead network (in addition to anoa's own offline switch)
        syncDelayMs: 0,              // hold each /api/user/sync answer for this long (a slow connection)
        fullDataFails: false,        // answer /api/user/full-data with a server error (a login that does not settle)
    };
    const log = [];
    const realFetch = window.fetch.bind(window);
    const json = (body, status = 200) =>
        new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

    window.fetch = async (input, init) => {
        const url = new URL(typeof input === "string" ? input : input.url, location.origin);
        if (!url.pathname.startsWith("/api/")) return realFetch(input, init);

        const method = (init && init.method ? init.method : "GET").toUpperCase();
        const text = init && typeof init.body === "string" ? init.body : "";
        const record = { path: url.pathname, query: url.search, method, bytes: text.length, body: text ? JSON.parse(text) : null, ok: false, at: Date.now(), online: navigator.onLine };
        log.push(record);

        if (state.offline || navigator.onLine === false) throw new TypeError("Failed to fetch");

        if (url.pathname === "/api/auth/session") {
            record.ok = true;
            return json({ user: state.user, expires: new Date(Date.now() + 864e5).toISOString() });
        }

        if (url.pathname === "/api/user/full-data") {
            if (state.fullDataFails) return json({ error: "boom" }, 500);
            record.ok = true;
            return json({
                profile: { name: state.user.name, guestSyncEligible: false, streaks: { current: 0, longest: 0 } },
                bookmarks: [], completedMissions: [], intentions: [], dailyActivities: [], readingState: null,
                progression: { hasanah: state.hasanah, level: 1, streak: { currentDays: 0, longestDays: 0, lastStreakDate: null, freezesAvailable: 0, days: [] } },
            });
        }

        if (url.pathname === "/api/user/sync" && method === "POST") {
            if (state.holdSync) return json({ error: "busy" }, 503);
            if (state.syncDelayMs) await new Promise((resolve) => setTimeout(resolve, state.syncDelayMs));
            record.ok = true;
            const synced = [];
            for (const entry of record.body.entries || []) {
                if (entry.type === "mission" || entry.type === "mission_progress") {
                    const key = (m) => m.missionId + ":" + m.completedDate;
                    const row = { missionId: entry.data.id, completedDate: entry.data.completedDate, hasanahEarned: entry.data.hasanahEarned || 0 };
                    state.serverMissions = state.serverMissions.filter((m) => key(m) !== key(row));
                    if (entry.action !== "delete") { state.serverMissions.push(row); state.hasanah += row.hasanahEarned; }
                    else state.hasanah = Math.max(0, state.hasanah - row.hasanahEarned);
                } else if (entry.type === "hasanah_event") {
                    state.hasanah += Number(entry.data.amount) || 0;
                }
                synced.push({ id: entry.id });
            }
            return json({ success: true, synced, failed: [], message: "Sync complete" });
        }

        if (url.pathname === "/api/user/pull") {
            record.ok = true;
            const parts = (url.searchParams.get("parts") || "").split(",");
            const body = {};
            if (parts.includes("progress")) body.progression = { hasanah: state.hasanah, level: 1, streak: { currentDays: 0, longestDays: 0, lastStreakDate: null, freezesAvailable: 0, days: [] } };
            if (parts.includes("missions")) body.missions = state.serverMissions;
            if (parts.includes("activity")) body.activity = [];
            if (parts.includes("profile")) body.profile = { isMuhsinin: false, totalInfaq: 0 };
            if (parts.includes("fasting")) body.fasting = [];
            if (parts.includes("bookmarks")) body.bookmarkFingerprint = "0:0";
            return json(body);
        }

        // Anything else the page asks for (analytics, notifications, ...) is swallowed.
        record.ok = true;
        return json({});
    };

    window.__fake = { state, log };
    return "installed";
})();
