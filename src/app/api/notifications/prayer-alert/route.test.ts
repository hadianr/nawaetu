/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { POST } from './route';
import { db } from '@/db';
import { NextRequest } from 'next/server';

interface PrayerAlertResponseBody {
    success: boolean;
    mode: string;
    results: { total: number; skipped?: number; noLocation?: number; sent?: number; failed?: number; invalidTokens?: number };
}

vi.mock('@/db', () => ({
    db: {
        select: vi.fn(),
        update: vi.fn(),
        execute: vi.fn(),
    }
}));

vi.mock('drizzle-orm', async (importOriginal) => {
    const actual = await importOriginal<typeof import('drizzle-orm')>();
    return {
        ...actual,
        eq: vi.fn(),
    };
});

vi.mock('@/db/schema', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/db/schema')>();
    return {
        ...actual,
        pushSubscriptions: {
            id: { name: 'id' },
            token: { name: 'token' },
            active: { name: 'active' },
            lastUsedAt: { name: 'last_used_at' },
            lastNotificationSent: { name: 'last_notification_sent' },
            nextAlertAt: { name: 'next_alert_at' },
        },
        users: { id: { name: 'id' }, settings: { name: 'settings' } },
    };
});

const mocks = vi.hoisted(() => ({
    setNextAlerts: vi.fn(),
    messagingSend: vi.fn().mockResolvedValue('msg-id-123'),
    messagingSendEach: vi.fn(),
    getMessaging: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/notifications/push-copy', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/notifications/push-copy')>()),
    // Deterministic copy that shows which language was chosen.
    getPrayerNotificationCopy: vi.fn((locale: unknown, prayer: string) => ({ title: `${String(locale)}|${prayer}`, body: 'b' })),
}));

vi.mock('@/lib/notifications/prayer-send', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/notifications/prayer-send')>()),
    setNextAlerts: mocks.setNextAlerts,
}));

vi.mock('@/lib/notifications/firebase-admin', () => ({
    getMessaging: mocks.getMessaging,
}));

/** What `where(...)` returns: awaitable on its own (sync mode, the users query) and chainable as `.orderBy().limit()` (alert mode). */
const rowsOf = (value: unknown) => Object.assign(Promise.resolve(value), {
    orderBy: () => ({ limit: async () => value }),
    limit: async () => value,
});

function mockDatabase(subscriptions: unknown[], userRows: unknown[] = []) {
    (db.select as Mock).mockImplementation((selection?: unknown) => ({
        from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue(rowsOf(selection ? userRows : subscriptions)),
        }),
    }));
    (db.update as Mock).mockImplementation(() => ({
        set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
    }));
    (db.execute as Mock).mockResolvedValue([]);
}

function authorizedRequest(url: string) {
    return new Request(url, { headers: { authorization: 'Bearer test-secret' } }) as unknown as NextRequest;
}

describe('POST /api/notifications/prayer-alert', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.CRON_SECRET = 'test-secret';
        mocks.getMessaging.mockResolvedValue({ send: mocks.messagingSend, sendEach: mocks.messagingSendEach });
        mocks.messagingSend.mockResolvedValue('msg-id-123');
        mocks.setNextAlerts.mockReset().mockResolvedValue(undefined);
        // Every message succeeds unless a test says otherwise.
        mocks.messagingSendEach.mockReset().mockImplementation(async (messages: unknown[]) => ({
            responses: messages.map(() => ({ success: true })), successCount: messages.length, failureCount: 0,
        }));
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                data: {
                    timings: {
                        Fajr: "04:35",
                        Dhuhr: "12:05",
                        Asr: "15:20",
                        Maghrib: "17:50",
                        Isha: "19:00",
                        Imsak: "04:25"
                    }
                }
            })
        } as Response);
    });

    it('returns mode=alert results when invoked with ?mode=alert', async () => {
        const mockSubscriptions = [
            {
                id: 'sub-1',
                token: 'token-123',
                active: 1,
                userLocation: { lat: -6.867, lng: 107.63 },
                timezone: 'Asia/Jakarta',
                prayerPreferences: null,
                lastNotificationSent: null,
            }
        ];

        mockDatabase(mockSubscriptions);

        const req = authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert');
        const res = await POST(req);
        const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.mode).toBe('alert');
        expect(body.results.total).toBe(1);
    });

    it('gracefully processes stringified JSON fields without crashing', async () => {
        const mockSubscriptions = [
            {
                id: 'sub-2',
                token: 'token-456',
                active: 1,
                userLocation: '{"lat":-6.2088,"lng":106.8456}', // stringified JSON
                timezone: 'Asia/Jakarta',
                prayerPreferences: '{"fajr":true,"imsak":true}', // stringified JSON
                lastNotificationSent: null,
            }
        ];

        mockDatabase(mockSubscriptions);

        const req = authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert');
        const res = await POST(req);
        const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.results.total).toBe(1);
    });

    it('rejects an invalid cron authorization header', async () => {
        process.env.CRON_SECRET = 'secret';
        const req = new NextRequest('http://localhost/api/notifications/prayer-alert?mode=sync', {
            headers: { authorization: 'Bearer wrong' },
        });

        const res = await POST(req);
        expect(res.status).toBe(401);
        expect(db.select).not.toHaveBeenCalled();
    });

    it('returns 503 when the cron secret is not configured', async () => {
        delete process.env.CRON_SECRET;
        const res = await POST(new NextRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));

        expect(res.status).toBe(503);
        expect(db.select).not.toHaveBeenCalled();
    });

    it('accepts a valid cron authorization header', async () => {
        mockDatabase([]);
        const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));

        expect(res.status).toBe(200);
    });

    it('returns an empty result when no active subscriptions exist', async () => {
        mockDatabase([]);
        const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
        const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

        expect(res.status).toBe(200);
        expect(body.results.total).toBe(0);
        expect(mocks.getMessaging).not.toHaveBeenCalled();
    });

    it('returns 500 when Firebase Admin is unavailable', async () => {
        mockDatabase([{ id: 'sub-3', userId: 'user-1', token: 'token-3', active: 1 }]);
        mocks.getMessaging.mockResolvedValueOnce(null);

        const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
        expect(res.status).toBe(500);
    });

    it('syncs tokens and deactivates invalid registration tokens', async () => {
        mockDatabase([
            { id: 'sub-4', userId: 'user-1', token: 'token-4', active: 1 },
            { id: 'sub-5', userId: 'user-1', token: 'token-5', active: 1 },
        ]);
        mocks.messagingSend
            .mockResolvedValueOnce('sent')
            .mockRejectedValueOnce({ code: 'messaging/registration-token-not-registered' });

        const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=sync'));
        const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

        expect(res.status).toBe(200);
        expect(body.mode).toBe('sync');
        expect(body.results).toMatchObject({ total: 2, sent: 1, failed: 1, invalidTokens: 1 });
        expect(db.update).toHaveBeenCalledTimes(2);
    });

    it('rejects unsupported notification modes', async () => {
        mockDatabase([{ id: 'sub-unknown', userId: 'user-1', token: 'token-unknown', active: 1 }]);
        const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=unknown'));
        expect(res.status).toBe(400);
        expect((res as unknown as { body: { error: string } }).body.error).toBe('Invalid mode');
    });

    it('skips subscriptions without location without calling Firebase', async () => {
        mockDatabase([{ id: 'sub-6', userId: 'user-1', token: 'token-6', active: 1, latitude: null, longitude: null }]);

        const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
        const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

        expect(res.status).toBe(200);
        expect(body.results).toMatchObject({ total: 1, skipped: 1, noLocation: 1 });
        expect(mocks.messagingSend).not.toHaveBeenCalled();
    });

    it('asks Aladhan once per place per month, not once per place per minute (the Sentry N+1)', async () => {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        // Prayer times far from now, so nothing is sent and only the lookups are counted.
        const farFromNow = (now.getUTCHours() + 7) % 24 < 12 ? '23:55' : '00:05';
        global.fetch = vi.fn().mockImplementation(async () => ({
            ok: true,
            json: async () => ({ data: [{ date: { gregorian: { date: dateStr } }, timings: { Imsak: farFromNow, Fajr: farFromNow, Dhuhr: farFromNow, Asr: farFromNow, Maghrib: farFromNow, Isha: farFromNow } }] }),
        }) as Response);
        // Three subscribers in two 0.1 degree cells.
        mockDatabase([
            { id: 'n1-a', token: 't-a', active: 1, latitude: -7.91, longitude: 110.41, timezone: 'Asia/Jakarta' },
            { id: 'n1-b', token: 't-b', active: 1, latitude: -7.93, longitude: 110.43, timezone: 'Asia/Jakarta' },
            { id: 'n1-c', token: 't-c', active: 1, latitude: -8.11, longitude: 112.21, timezone: 'Asia/Jakarta' },
        ]);

        // The cron fires every minute: three runs.
        for (let minute = 0; minute < 3; minute++) {
            const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
            expect(res.status).toBe(200);
        }

        // Two cells, one month each: two requests in total, not six.
        const calls = (global.fetch as Mock).mock.calls.map((call) => String(call[0]));
        expect(calls).toHaveLength(2);
        expect(calls.every((url) => url.includes('/calendar/'))).toBe(true);
    });

    it('sends an alert, deduplicates today, respects preferences, and disables invalid tokens', async () => {
        const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
        const localTime = new Date().toLocaleTimeString('en-US', {
            timeZone: 'Asia/Jakarta', hourCycle: 'h23', hour: '2-digit', minute: '2-digit',
        });
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: { timings: { Fajr: localTime } } }),
        } as Response);
        mockDatabase([
            { id: 'sub-7', userId: 'user-1', token: 'token-7', active: 1, latitude: -6.2, longitude: 106.8, timezone: 'Asia/Jakarta' },
            { id: 'sub-8', userId: 'user-1', token: 'token-8', active: 1, latitude: -6.2, longitude: 106.8, timezone: 'Asia/Jakarta', lastNotificationSent: JSON.stringify({ Fajr: today }) },
            { id: 'sub-9', userId: 'user-1', token: 'token-9', active: 1, latitude: -6.2, longitude: 106.8, timezone: 'Asia/Jakarta', prayerPreferences: { fajr: false } },
            { id: 'sub-10', userId: 'user-1', token: 'token-10', active: 1, latitude: -6.2, longitude: 106.8, timezone: 'Asia/Jakarta' },
        ], [{ id: 'user-1', settings: { locale: 'id' } }]);
        mocks.messagingSendEach.mockResolvedValueOnce({
            responses: [{ success: true }, { success: false, error: { code: 'messaging/invalid-registration-token' } }],
            successCount: 1, failureCount: 1,
        });

        const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
        const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

        expect(res.status).toBe(200);
        expect(body.results).toMatchObject({ total: 4, sent: 1, failed: 1, invalidTokens: 1, skipped: 2 });
        // The two that are due go out in ONE call, and the bookkeeping is one write for those sent plus one to switch off the dead token.
        expect(mocks.messagingSendEach).toHaveBeenCalledTimes(1);
        expect(mocks.messagingSendEach.mock.calls[0][0].map((message: { token: string }) => message.token)).toEqual(['token-7', 'token-10']);
        expect(mocks.messagingSend).not.toHaveBeenCalled();
        expect(db.update).toHaveBeenCalledTimes(2);
    });

    it('sends the prayer alert to a guest subscription that has no owner', async () => {
        const localTime = new Date().toLocaleTimeString('en-US', {
            timeZone: 'Asia/Jakarta', hourCycle: 'h23', hour: '2-digit', minute: '2-digit',
        });
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: { timings: { Fajr: localTime } } }),
        } as Response);
        mockDatabase([
            { id: 'guest-1', userId: null, token: 'guest-token', active: 1, latitude: -6.2, longitude: 106.8, timezone: 'Asia/Jakarta' },
        ]);
        const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
        const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

        expect(body.results).toMatchObject({ total: 1, sent: 1 });
        expect(mocks.messagingSendEach).toHaveBeenCalledWith([expect.objectContaining({ token: 'guest-token' })]);
    });

    it('uses the language the guest device chose, and the account language when there is one', async () => {
        const localTime = new Date().toLocaleTimeString('en-US', {
            timeZone: 'Asia/Jakarta', hourCycle: 'h23', hour: '2-digit', minute: '2-digit',
        });
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: { timings: { Fajr: localTime } } }),
        } as Response);
        const place = { latitude: -6.2, longitude: 106.8, timezone: 'Asia/Jakarta', active: 1 };
        mockDatabase([
            { id: 'guest-en', userId: null, token: 'guest-en-token', locale: 'en', ...place },
            { id: 'user-id', userId: 'user-9', token: 'account-token', locale: 'en', ...place },
        ], [{ id: 'user-9', settings: { locale: 'id' } }]);
        await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));

        const sent = mocks.messagingSendEach.mock.calls.flatMap((call) => call[0]);
        const guest = sent.find((message) => message.token === 'guest-en-token');
        const account = sent.find((message) => message.token === 'account-token');

        // The copy is picked per language; the stub makes the language visible in the title.
        expect(guest.notification.title).toBe('en|Fajr');
        // The account's own setting (Indonesian) wins over what the device said.
        expect(account.notification.title).toBe('id|Fajr');
    });

    describe('sending in batches', () => {
        const dueNow = () => {
            const localTime = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Jakarta', hourCycle: 'h23', hour: '2-digit', minute: '2-digit' });
            global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { timings: { Fajr: localTime } } }) } as Response);
        };
        const crowd = (count: number) => Array.from({ length: count }, (_, i) => ({
            id: `crowd-${i}`, userId: null, token: `crowd-token-${i}`, active: 1, latitude: -6.2, longitude: 106.8, timezone: 'Asia/Jakarta',
        }));

        it('sends 1,200 alerts in three calls, not 1,200, and writes the bookkeeping in three statements', async () => {
            dueNow();
            mockDatabase(crowd(1200));

            const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
            const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

            expect(body.results).toMatchObject({ total: 1200, sent: 1200, failed: 0 });
            expect(mocks.messagingSendEach.mock.calls.map((call) => call[0].length)).toEqual([500, 500, 200]);
            expect(db.update).toHaveBeenCalledTimes(3);
        });

        it('counts a whole failed call as failed, and neither marks them sent nor switches their tokens off', async () => {
            dueNow();
            mockDatabase(crowd(3));
            mocks.messagingSendEach.mockRejectedValueOnce(new Error('FCM is down'));

            const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
            const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

            expect(res.status).toBe(200);
            expect(body.results).toMatchObject({ total: 3, sent: 0, failed: 3, invalidTokens: 0 });
            expect(db.update).not.toHaveBeenCalled(); // they stay due, so the next minute tries again
        });

        it('keeps going and reports it when the bookkeeping write fails after the alerts went out', async () => {
            dueNow();
            mockDatabase(crowd(2));
            (db.update as Mock).mockImplementation(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockRejectedValue(new Error('db down')) }) }));

            const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
            const body = (res as unknown as { body: PrayerAlertResponseBody & { results: { errors?: string[] } } }).body;

            expect(res.status).toBe(200);
            expect(body.results.sent).toBe(2);
            expect(body.results.errors?.some((message) => message.includes('bookkeeping'))).toBe(true);
        });

        it('sends nothing, and writes nothing, when everyone due was already alerted today', async () => {
            dueNow();
            const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
            mockDatabase(crowd(2).map((sub) => ({ ...sub, lastNotificationSent: { Fajr: today } })));

            const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
            const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

            expect(body.results).toMatchObject({ sent: 0, skipped: 2 });
            expect(mocks.messagingSendEach).not.toHaveBeenCalled();
            expect(db.update).not.toHaveBeenCalled();
        });
    });

    describe('scheduling the next look', () => {
        // The prayer-times helper keeps what it fetched for the life of the module, so every test uses a cell of its own.
        let cells = 0;
        const freshPlace = () => { cells++; return { latitude: -1 - cells * 0.3, longitude: 100 + cells * 0.5, timezone: 'Asia/Jakarta', active: 1 }; };
        const nowTime = () => new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Jakarta', hourCycle: 'h23', hour: '2-digit', minute: '2-digit' });
        const timingsAnswer = (timings: Record<string, string>) => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { timings } }) } as Response);
        };
        /** Every prayer a few hours from now, so none is due this minute. */
        const farAway = () => {
            const hour = (new Date().getUTCHours() + 7) % 24;
            const later = `${String((hour + 5) % 24).padStart(2, '0')}:30`;
            timingsAnswer({ Imsak: later, Fajr: later, Dhuhr: later, Asr: later, Maghrib: later, Isha: later });
        };
        const scheduled = () => mocks.setNextAlerts.mock.calls.flatMap((call) => call[0] as Array<{ id: string; at: Date }>);

        it('stores a later time for everyone it looked at when nothing is due, and sends nothing', async () => {
            const place = freshPlace();
            farAway();
            mockDatabase([{ id: 's1', token: 't1', ...place }, { id: 's2', token: 't2', ...place }]);

            const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));

            expect(res.status).toBe(200);
            expect(mocks.messagingSendEach).not.toHaveBeenCalled();
            expect(scheduled().map((entry) => entry.id).sort()).toEqual(['s1', 's2']);
            expect(scheduled().every((entry) => entry.at.getTime() > Date.now())).toBe(true);
        });

        it('schedules those that were sent, and does NOT schedule one whose send failed: it stays due and is retried', async () => {
            const place = freshPlace();
            timingsAnswer({ Imsak: '00:01', Fajr: nowTime(), Dhuhr: '23:58', Asr: '23:58', Maghrib: '23:58', Isha: '23:58' });
            mockDatabase([{ id: 'ok', token: 't-ok', ...place }, { id: 'retry', token: 't-retry', ...place }]);
            mocks.messagingSendEach.mockResolvedValueOnce({
                responses: [{ success: true }, { success: false, error: { code: 'messaging/internal-error' } }], successCount: 1, failureCount: 1,
            });

            await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));

            expect(scheduled().map((entry) => entry.id)).toEqual(['ok']);
        });

        it('does not schedule a token FCM no longer knows: it is switched off instead', async () => {
            const place = freshPlace();
            timingsAnswer({ Imsak: '00:01', Fajr: nowTime(), Dhuhr: '23:58', Asr: '23:58', Maghrib: '23:58', Isha: '23:58' });
            mockDatabase([{ id: 'dead', token: 't-dead', ...place }]);
            mocks.messagingSendEach.mockResolvedValueOnce({
                responses: [{ success: false, error: { code: 'messaging/registration-token-not-registered' } }], successCount: 0, failureCount: 1,
            });

            await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));

            expect(scheduled()).toEqual([]);
            expect(db.update).toHaveBeenCalledTimes(1); // only the switch-off
        });

        it('schedules someone already alerted today, so they stop being looked at every minute', async () => {
            const place = freshPlace();
            const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
            timingsAnswer({ Imsak: '00:01', Fajr: nowTime(), Dhuhr: '23:58', Asr: '23:58', Maghrib: '23:58', Isha: '23:58' });
            mockDatabase([{ id: 'done', token: 't-done', lastNotificationSent: { Fajr: today }, ...place }]);

            await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));

            expect(mocks.messagingSendEach).not.toHaveBeenCalled();
            expect(scheduled().map((entry) => entry.id)).toEqual(['done']);
        });

        it('looks at a subscription without a location again a day later, not every minute', async () => {
            farAway();
            mockDatabase([{ id: 'nowhere', token: 't-nowhere', active: 1 }]);

            const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
            const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

            expect(body.results).toMatchObject({ noLocation: 1 });
            const [entry] = scheduled();
            expect(entry.id).toBe('nowhere');
            expect(entry.at.getTime() - Date.now()).toBeGreaterThan(23 * 3600_000);
        });

        it('schedules nobody when the prayer times cannot be had: they stay due and the next minute asks again', async () => {
            global.fetch = vi.fn().mockRejectedValue(new TypeError('offline'));
            mockDatabase([{ id: 'wait', token: 't-wait', latitude: -3.3, longitude: 114.6, timezone: 'Asia/Makassar', active: 1 }]);

            const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));

            expect(res.status).toBe(200);
            expect(scheduled()).toEqual([]);
        });

        it('reports a failed schedule write and still answers 200: the rows simply stay due', async () => {
            const place = freshPlace();
            farAway();
            mockDatabase([{ id: 's9', token: 't9', ...place }]);
            mocks.setNextAlerts.mockRejectedValueOnce(new Error('db down'));

            const res = await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
            const body = (res as unknown as { body: { results: { errors?: string[] } } }).body;

            expect(res.status).toBe(200);
            expect(body.results.errors?.some((message) => message.includes('Schedule write'))).toBe(true);
        });

        it('leaves the schedule alone in sync mode, which still visits everyone', async () => {
            const place = freshPlace();
            mockDatabase([{ id: 'sy', token: 't-sy', ...place }]);
            await POST(authorizedRequest('http://localhost/api/notifications/prayer-alert?mode=sync'));
            expect(mocks.setNextAlerts).not.toHaveBeenCalled();
        });
    });
});
