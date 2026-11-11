#!/usr/bin/env node
/**
 * Browser validation of sync, offline behaviour and speed, driven with the Anoa browser.
 *
 *   npm run build            (once; use SENTRY_AUTH_TOKEN= so no source maps are uploaded)
 *   npm run test:anoa
 *
 * What it does
 *   1. starts the production build with an UNREACHABLE database, so no test can touch real data;
 *   2. starts a headless Anoa browser (or uses one already listening on ANOA_PORT);
 *   3. replaces the backend inside the page with scripts/anoa/fake-backend.js and runs the real client
 *      code: login hand-off, change tracking, the queue, offline retry, pull and merge;
 *   4. prints PASS or FAIL per check and exits 1 if anything failed.
 *
 * Options (environment)
 *   APP_URL      use an app that is already running instead of starting one
 *   APP_PORT     port for the app it starts (default 3100)
 *   ANOA_PORT    CDP port of the browser (default 9333)
 *   SHOTS_DIR    where failure screenshots go (default: the system temp directory)
 *   ONLY         run only checks whose name contains this text
 */
import { spawn, spawnSync } from "node:child_process";
import { readFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const APP_PORT = Number(process.env.APP_PORT || 3100);
const ANOA_PORT = Number(process.env.ANOA_PORT || 9333);
const APP_URL = process.env.APP_URL || `http://127.0.0.1:${APP_PORT}`;
const SHOTS_DIR = process.env.SHOTS_DIR || join(tmpdir(), "nawaetu-anoa");
// The app removes any service worker on localhost / 127.0.0.1, so the offline-shell check uses a *.localhost name,
// which the browser still treats as a secure origin.
const SW_URL = process.env.SW_URL || APP_URL.replace(/\/\/(127\.0\.0\.1|localhost)/, "//nawaetu.localhost");
const FAKE = readFileSync(join(here, "fake-backend.js"), "utf8");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Anoa ───────────────────────────────────────────────────────────────────

function anoa(args, { allowFail = false } = {}) {
    const result = spawnSync("anoa", ["--port", String(ANOA_PORT), ...args], { encoding: "utf8", timeout: 60_000 });
    if (result.status !== 0 && !allowFail) {
        throw new Error(`anoa ${args.join(" ").slice(0, 80)} failed: ${(result.stderr || result.stdout).trim().slice(0, 300)}`);
    }
    return { out: (result.stdout || "").trim(), status: result.status };
}

/** Runs the body of an async function in the page and returns what it returned, as data. */
function page(body) {
    const wrapped = `(async () => JSON.stringify(await (async () => { ${body} })()))()`;
    const { out } = anoa(["eval", wrapped, "--json"]);
    const parsed = JSON.parse(out);
    const value = typeof parsed === "object" && parsed !== null && "value" in parsed ? parsed.value : parsed;
    return value === undefined || value === null ? undefined : JSON.parse(value);
}

async function waitFor(description, body, timeoutMs = 10_000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (page(`return Boolean(${body});`)) return;
        await sleep(250);
    }
    throw new Error(`timed out after ${timeoutMs} ms waiting for: ${description}`);
}

/** The ref Anoa gave to the first interactive element whose label contains this text. */
function refByText(text) {
    const line = anoa(["snapshot", "-i"]).out.split("\n").find((row) => row.includes(text));
    assert(line, `no element with text "${text}" on the page`);
    return line.trim().split(/\s+/)[0];
}

const open = (path) => { anoa(["open", `${APP_URL}${path}`]); anoa(["wait", "--load"]); };

// ─── Test plumbing ──────────────────────────────────────────────────────────

const results = [];
const only = process.env.ONLY;

async function check(name, run) {
    if (only && !name.includes(only)) return;
    const started = Date.now();
    try {
        await run();
        results.push({ name, ok: true, ms: Date.now() - started });
        console.log(`  PASS  ${name}  (${Date.now() - started} ms)`);
    } catch (error) {
        results.push({ name, ok: false, ms: Date.now() - started, error: error.message });
        console.log(`  FAIL  ${name}\n        ${error.message}`);
        try {
            mkdirSync(SHOTS_DIR, { recursive: true });
            anoa(["screenshot", join(SHOTS_DIR, `${name.replace(/[^a-z0-9]+/gi, "-").slice(0, 60)}.png`)], { allowFail: true });
        } catch { /* a missing screenshot must not hide the failure */ }
    } finally {
        anoa(["set", "offline", "off"], { allowFail: true });
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

// ─── Scenario helpers ───────────────────────────────────────────────────────

const localToday = "new Date().toLocaleDateString('sv-SE')";
const KEYS = { missions: "completed_missions", bookmarks: "nawaetu_bookmarks", activity: "activity_tracker", queue: "nawaetu_sync_queue", syncUser: "last_sync_user_id" };

/** A clean guest page: empty storage, onboarding finished, no fake backend yet. */
async function freshGuestPage(seedJs = "") {
    open("/");
    page(`localStorage.clear(); localStorage.setItem('onboarding_completed','v2'); ${seedJs} return true;`);
    anoa(["reload"]);
    anoa(["wait", "--load"]);
    await waitFor("the app to render", "document.body.innerText.length > 50");
}

/**
 * Signs in the way a user does: the session endpoint starts answering with a user, GuestSyncManager decides
 * what to do with the data on the device, and the sync engine starts once it has settled.
 */
async function signIn(userId = "u1") {
    page(`${FAKE}; window.__fake.state.user.id = ${JSON.stringify(userId)}; // A tab that was open as a guest learns about a sign-in through next-auth's broadcast channel
        // (a visibility change is ignored once the client knows it has no session).
        new BroadcastChannel('next-auth').postMessage({ event: 'session', data: { trigger: 'getSession' } }); return true;`);
    await waitFor("login to settle", `localStorage.getItem('${KEYS.syncUser}') === ${JSON.stringify(userId)}`, 15_000);
    await waitFor("the first pull", "window.__fake.log.some(r => r.path === '/api/user/pull')", 15_000);
}

const syncCalls = () => page(`return window.__fake.log.filter(r => r.path === '/api/user/sync' && r.ok).map(r => ({ bytes: r.bytes, entries: r.body.entries.map(e => ({ type: e.type, action: e.action, data: e.data })) }));`);
const queueLength = () => page(`return JSON.parse(localStorage.getItem('${KEYS.queue}') || '[]').length;`);
const noPageErrors = () => assert(/nothing recorded/i.test(anoa(["errors"]).out), `the page threw: ${anoa(["errors"]).out.slice(0, 300)}`);

const fireStorageChange = (key) =>
    `window.dispatchEvent(new CustomEvent('nawaetu_storage_change', { detail: { key: '${key}', action: 'set', source: 'local_tab' } }));`;
const addMission = (id = "tasbih_99") =>
    `{ const list = JSON.parse(localStorage.getItem('${KEYS.missions}') || '[]'); list.push({ id: '${id}', completedAt: new Date().toISOString(), hasanahEarned: 30 }); localStorage.setItem('${KEYS.missions}', JSON.stringify(list)); ${fireStorageChange(KEYS.missions)} }`;
const removeMissions = () => `localStorage.setItem('${KEYS.missions}', '[]'); ${fireStorageChange(KEYS.missions)}`;

// ─── The checks ─────────────────────────────────────────────────────────────

async function runChecks() {
    console.log("\nGuest mode");
    await check("a guest makes no sync or pull request and the page has no errors", async () => {
        await freshGuestPage();
        await sleep(4000);
        const calls = page(`return performance.getEntriesByType('resource').map(e => e.name).filter(n => /\\/api\\/user\\/(sync|pull)/.test(n));`);
        assert(calls.length === 0, `a guest called ${calls.join(", ")}`);
        noPageErrors();
    });

    console.log("\nLogin hand-off");
    await check("signing in starts the engine: login settles, then one pull for the right parts", async () => {
        await freshGuestPage();
        await signIn();
        const pulls = page(`return window.__fake.log.filter(r => r.path === '/api/user/pull').map(r => r.query);`);
        assert(pulls.length >= 1 && /parts=progress%2Cmissions%2Cactivity%2Cprofile%2Cfasting|parts=progress,missions,activity,profile,fasting/.test(pulls[0]), `unexpected pull: ${pulls[0]}`);
        assert(syncCalls().length === 0, "nothing changed, so nothing should have been sent");
        noPageErrors();
    });

    console.log("\nSpeed: send only what changed");
    await check("one change on a big account sends one small entry, and tracking it is fast", async () => {
        await freshGuestPage(`
            localStorage.setItem('${KEYS.missions}', JSON.stringify(Array.from({ length: 1000 }, (_, i) => ({ id: 'fajr_prayer', completedAt: new Date(Date.now() - (i + 40) * 864e5).toLocaleDateString('sv-SE'), hasanahEarned: 75 }))));
            localStorage.setItem('${KEYS.bookmarks}', JSON.stringify(Array.from({ length: 100 }, (_, i) => ({ id: '2:' + (i + 1), surahId: 2, surahName: 'Al-Baqarah', verseId: i + 1, verseText: 'x'.repeat(180), translationText: 'y'.repeat(120), createdAt: Date.now(), updatedAt: Date.now() }))));`);
        await signIn();
        const fullState = page(`return localStorage.getItem('${KEYS.missions}').length + localStorage.getItem('${KEYS.bookmarks}').length;`);

        const trackMs = page(`
            const list = JSON.parse(localStorage.getItem('${KEYS.missions}')); list.push({ id: 'tasbih_99', completedAt: new Date().toISOString(), hasanahEarned: 30 });
            localStorage.setItem('${KEYS.missions}', JSON.stringify(list));
            const t0 = performance.now(); ${fireStorageChange(KEYS.missions)} return performance.now() - t0;`);
        await waitFor("the change to be sent", "window.__fake.log.some(r => r.path === '/api/user/sync' && r.ok)", 8000);

        const [call] = syncCalls();
        console.log(`        local state ${fullState} bytes -> request ${call.bytes} bytes; tracking took ${trackMs.toFixed(1)} ms`);
        assert(call.entries.length === 1, `expected 1 entry, got ${call.entries.length}`);
        assert(call.entries[0].type === "mission" && call.entries[0].action === "create", "the entry is not a mission create");
        assert(call.bytes < 1500, `request is ${call.bytes} bytes; a full upload would be about ${fullState}`);
        assert(trackMs < 50, `tracking a change took ${trackMs.toFixed(1)} ms with 1000 missions`);
        await waitFor("the queue to empty", `JSON.parse(localStorage.getItem('${KEYS.queue}') || '[]').length === 0`);
    });

    await check("fifty rapid changes to one counter become one request with the last value", async () => {
        await freshGuestPage();
        await signIn();
        page(`for (let n = 1; n <= 50; n++) { localStorage.setItem('${KEYS.activity}', JSON.stringify({ date: ${localToday}, quranAyat: 0, tasbihCount: n, prayersLogged: [] })); ${fireStorageChange(KEYS.activity)} } return true;`);
        await waitFor("the change to be sent", "window.__fake.log.some(r => r.path === '/api/user/sync' && r.ok)", 8000);
        await sleep(2500); // nothing else should follow
        const calls = syncCalls();
        assert(calls.length === 1, `expected 1 request, got ${calls.length}`);
        assert(calls[0].entries.length === 1 && calls[0].entries[0].data.tasbihCount === 50, "the single entry should carry tasbihCount 50");
    });

    console.log("\nOffline and reload");
    await check("changes made offline are kept, then sent in ONE request when the connection returns", async () => {
        await freshGuestPage();
        await signIn();
        // Anoa's own offline switch flaps navigator.onLine between commands, so the fake backend plays dead instead.
        page("window.__fake.state.offline = true; window.dispatchEvent(new Event('offline')); return true;");
        page(`${addMission("tasbih_99")} localStorage.setItem('app_theme', 'midnight'); ${fireStorageChange("app_theme")}
              localStorage.setItem('${KEYS.bookmarks}', JSON.stringify([{ id: '2:255', surahId: 2, surahName: 'Al-Baqarah', verseId: 255, verseText: 'x' }])); ${fireStorageChange(KEYS.bookmarks)} return true;`);
        await sleep(3500);
        assert(syncCalls().length === 0, "something was sent while offline");
        assert(queueLength() === 3, `expected 3 queued changes, found ${queueLength()}`);

        page("window.__fake.state.offline = false; window.dispatchEvent(new Event('online')); return true;");
        await waitFor("the queue to drain", `JSON.parse(localStorage.getItem('${KEYS.queue}') || '[]').length === 0`, 12_000);
        const calls = syncCalls();
        assert(calls.length === 1, `expected one request after reconnecting, got ${calls.length}`);
        assert(calls[0].entries.length === 3, `the request should carry all 3 changes, carried ${calls[0].entries.length}`);
    });

    await check("a change survives closing the page, and is sent when the user returns", async () => {
        await freshGuestPage();
        await signIn();
        page(`window.__fake.state.holdSync = true; ${addMission("tasbih_99")} return true;`);
        await sleep(3500);
        assert(queueLength() === 1, "the change should be waiting in the queue");

        anoa(["reload"]); // the tab is gone: the fake backend and all page memory go with it
        anoa(["wait", "--load"]);
        assert(queueLength() === 1, "the queue did not survive the reload");
        const stamped = page(`return JSON.parse(localStorage.getItem('${KEYS.queue}'))[0].userId;`);
        assert(stamped === "u1", `the queued change should belong to u1, belongs to ${stamped}`);

        await signIn();
        await waitFor("the saved change to be sent", "window.__fake.log.some(r => r.path === '/api/user/sync' && r.ok)", 12_000);
        assert(queueLength() === 0, "the queue should be empty once it was sent");
    });

    await check("an app that was open offline shows its pages from the cache (offline-first)", async () => {
        anoa(["open", `${SW_URL}/`]); anoa(["wait", "--load"]);
        page("localStorage.setItem('onboarding_completed','v2'); return true;");
        await waitFor("the service worker to be ready", "'serviceWorker' in navigator && navigator.serviceWorker.getRegistration().then(r => Boolean(r && r.active))", 20_000);
        anoa(["reload"]); anoa(["wait", "--load"]); // now the page is controlled by it
        await waitFor("control by the service worker", "Boolean(navigator.serviceWorker.controller)", 10_000);
        await sleep(3000); // let it finish caching the page
        anoa(["set", "offline", "on"]);
        anoa(["reload"], { allowFail: true });
        await sleep(1500);
        const text = page("return { title: document.title, length: document.body ? document.body.innerText.length : 0 };");
        assert(text.length > 100 && /nawaetu/i.test(text.title), `the offline page is empty or an error page: ${JSON.stringify(text)}`);
    });

    await check("a connection that keeps dropping and returning does not hammer the server", async () => {
        await freshGuestPage();
        await signIn();
        await sleep(5500); // let the login pull age past the minimum gap
        page("window.__fake.log.length = 0; return true;");
        page("for (let i = 0; i < 20; i++) window.dispatchEvent(new Event('online')); return true;");
        await sleep(2500);
        const missionPulls = page("return window.__fake.log.filter(r => r.path === '/api/user/pull' && /missions/.test(decodeURIComponent(r.query))).length;");
        assert(missionPulls <= 1, `20 reconnects caused ${missionPulls} full pulls`);
    });

    console.log("\nUndo");
    await check("a mission done and undone before sending cancels out; one already sent is undone on the server", async () => {
        await freshGuestPage();
        await signIn();
        page(`${addMission("tasbih_99")} ${removeMissions()} return true;`);
        await sleep(3500);
        assert(syncCalls().length === 0, "a mission that was done and undone should never be sent");
        assert(queueLength() === 0, "and nothing should be waiting");

        page(`${addMission("tasbih_99")} return true;`);
        await waitFor("the completion to be sent", "window.__fake.log.some(r => r.path === '/api/user/sync' && r.ok)", 8000);
        page(`${removeMissions()} return true;`);
        await waitFor("the undo to be sent", "window.__fake.log.filter(r => r.path === '/api/user/sync' && r.ok).length === 2", 8000);
        const last = syncCalls().at(-1);
        assert(last.entries[0].action === "delete" && last.entries[0].data.id === "tasbih_99", "the second request should be a delete of tasbih_99");
        assert(page("return window.__fake.state.serverMissions.length") === 0, "the server should have no mission left");
    });

    console.log("\nThrough the real screens");
    await check("completing a mission with a real click is tracked, sent as one small entry, and undone state stays consistent", async () => {
        await freshGuestPage("localStorage.setItem('user_gender', 'male'); localStorage.setItem('user_name', 'Tester');");
        await signIn();
        await sleep(2500);
        anoa(["press", "Escape"], { allowFail: true }); // the journey intro dialog may be open
        await sleep(800);
        anoa(["click", refByText("Tasbih 99x")]);
        await waitFor("the mission dialog", "document.body.innerText.includes('Complete Mission')", 8000);
        anoa(["click", refByText("Complete Mission")]);

        await waitFor("the completion to be sent", "window.__fake.log.some(r => r.path === '/api/user/sync' && r.ok)", 10_000);
        const [call] = syncCalls();
        assert(call.entries.length === 1 && call.entries[0].type === "mission" && call.entries[0].data.id === "tasbih_99", `unexpected request: ${JSON.stringify(call.entries)}`);
        assert(call.entries[0].data.hasanahEarned === 30, "the reward the screen showed (30) was not what was sent");
        assert(call.bytes < 1000, `the request is ${call.bytes} bytes`);
        assert(page(`return JSON.parse(localStorage.getItem('${KEYS.missions}')).length`) === 1, "the mission should be stored locally once");
        await waitFor("the queue to empty", `JSON.parse(localStorage.getItem('${KEYS.queue}') || '[]').length === 0`);
        noPageErrors();
    });

    console.log("\nOther devices (pull)");
    await check("a mission completed on another device appears, and one undone there disappears, without being sent back", async () => {
        await freshGuestPage(`localStorage.setItem('${KEYS.missions}', JSON.stringify([{ id: 'fajr_prayer', completedAt: new Date().toISOString(), hasanahEarned: 75 }]));`);
        await signIn();
        // The other device: completed Asr, and undid Fajr (the server has no Fajr).
        page(`window.__fake.state.serverMissions = [{ missionId: 'asr_prayer', completedDate: ${localToday}, hasanahEarned: 75 }]; return true;`);
        await sleep(5500); // a forced pull waits this long after the login pull
        page("window.dispatchEvent(new Event('online')); return true;"); // forces a pull
        await waitFor("Asr to arrive", `JSON.parse(localStorage.getItem('${KEYS.missions}') || '[]').some(m => m.id === 'asr_prayer')`, 12_000);
        const ids = page(`return JSON.parse(localStorage.getItem('${KEYS.missions}')).map(m => m.id);`);
        assert(!ids.includes("fajr_prayer"), `Fajr should have gone, local missions: ${ids}`);
        await sleep(3500);
        assert(syncCalls().length === 0, "server data written locally must not be sent back as the user's own change");
        assert(queueLength() === 0, "and must not be queued");
    });

    console.log("\nAccounts");
    await check("changes queued for another account are never sent for the one that signs in", async () => {
        await freshGuestPage(`localStorage.setItem('${KEYS.queue}', JSON.stringify([{ id: 'leftover', type: 'bookmark', action: 'create', data: { surahId: 1, verseId: 1 }, status: 'pending', retryCount: 0, createdAt: Date.now(), key: 'b:1:1', userId: 'someone-else' }]));`);
        await signIn("u1");
        await sleep(3500);
        const sentLeftover = page("return window.__fake.log.some(r => r.path === '/api/user/sync' && JSON.stringify(r.body).includes('leftover'));");
        assert(!sentLeftover, "another account's change was sent");
        assert(queueLength() === 0, "it should have been discarded from this device");
    });
}

// ─── Lifecycle ──────────────────────────────────────────────────────────────

let appProcess = null;
let startedBrowser = false;

async function startApp() {
    if (process.env.APP_URL) return;
    console.log(`Starting the app on ${APP_URL} with an unreachable database...`);
    appProcess = spawn("npx", ["next", "start", "-p", String(APP_PORT)], {
        cwd: root,
        stdio: "ignore",
        env: {
            ...process.env,
            // Nothing the page does can reach a real database or send real errors anywhere.
            DATABASE_URL: "postgres://nobody:nobody@127.0.0.1:1/none",
            DATABASE_URL_UNPOOLED: "postgres://nobody:nobody@127.0.0.1:1/none",
            NEXTAUTH_SECRET: "anoa-validation-secret",
            NEXTAUTH_URL: APP_URL,
            AUTH_TRUST_HOST: "true",
            UPSTASH_REDIS_REST_URL: "",
            UPSTASH_REDIS_REST_TOKEN: "",
            SENTRY_DSN: "",
            NEXT_PUBLIC_SENTRY_DSN: "",
        },
    });
    for (let i = 0; i < 60; i++) {
        try { if ((await fetch(APP_URL)).ok) return; } catch { /* not up yet */ }
        await sleep(500);
    }
    throw new Error("the app did not start; run `npm run build` first");
}

async function startBrowser() {
    if (anoa(["status"], { allowFail: true }).status === 0) return;
    console.log(`Starting a headless Anoa browser on port ${ANOA_PORT}...`);
    spawn("anoa", ["--headless", "--port", String(ANOA_PORT), "--ephemeral"], { stdio: "ignore", detached: true }).unref();
    startedBrowser = true;
    for (let i = 0; i < 40; i++) {
        if (anoa(["status"], { allowFail: true }).status === 0) return;
        await sleep(500);
    }
    throw new Error("the Anoa browser did not start");
}

async function main() {
    await startApp();
    await startBrowser();
    try {
        await runChecks();
    } finally {
        if (startedBrowser) anoa(["close"], { allowFail: true });
        appProcess?.kill();
    }
    const failed = results.filter((r) => !r.ok);
    console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
    if (failed.length) console.log(`Screenshots of failures: ${SHOTS_DIR}`);
    process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
    console.error(error);
    appProcess?.kill();
    process.exit(1);
});
