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
        },
        users: { id: { name: 'id' }, settings: { name: 'settings' } },
    };
});

const mocks = vi.hoisted(() => ({
    messagingSend: vi.fn().mockResolvedValue('msg-id-123'),
    getMessaging: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/notifications/firebase-admin', () => ({
    getMessaging: mocks.getMessaging,
}));

function mockDatabase(subscriptions: unknown[], userRows: unknown[] = []) {
    (db.select as Mock).mockImplementation((selection?: unknown) => ({
        from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(selection ? userRows : subscriptions),
        }),
    }));
    (db.update as Mock).mockImplementation(() => ({
        set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
    }));
}

describe('POST /api/notifications/prayer-alert', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env.CRON_SECRET;
        mocks.getMessaging.mockResolvedValue({ send: mocks.messagingSend });
        mocks.messagingSend.mockResolvedValue('msg-id-123');
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

        const selectMock = db.select as unknown as { mockReturnValue: (value: unknown) => void };
        selectMock.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(mockSubscriptions),
            })
        });

        const req = new NextRequest('http://localhost/api/notifications/prayer-alert?mode=alert');
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

        const selectMock = db.select as unknown as { mockReturnValue: (value: unknown) => void };
        selectMock.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(mockSubscriptions),
            })
        });

        const req = new NextRequest('http://localhost/api/notifications/prayer-alert?mode=alert');
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

    it('returns an empty result when no active subscriptions exist', async () => {
        mockDatabase([]);
        const res = await POST(new NextRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
        const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

        expect(res.status).toBe(200);
        expect(body.results.total).toBe(0);
        expect(mocks.getMessaging).not.toHaveBeenCalled();
    });

    it('returns 500 when Firebase Admin is unavailable', async () => {
        mockDatabase([{ id: 'sub-3', userId: 'user-1', token: 'token-3', active: 1 }]);
        mocks.getMessaging.mockResolvedValueOnce(null);

        const res = await POST(new NextRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
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

        const res = await POST(new Request('http://localhost/api/notifications/prayer-alert?mode=sync') as unknown as NextRequest);
        const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

        expect(res.status).toBe(200);
        expect(body.mode).toBe('sync');
        expect(body.results).toMatchObject({ total: 2, sent: 1, failed: 1, invalidTokens: 1 });
        expect(db.update).toHaveBeenCalledTimes(2);
    });

    it('rejects unsupported notification modes', async () => {
        mockDatabase([{ id: 'sub-unknown', userId: 'user-1', token: 'token-unknown', active: 1 }]);
        const res = await POST(new Request('http://localhost/api/notifications/prayer-alert?mode=unknown') as unknown as NextRequest);
        expect(res.status).toBe(400);
        expect((res as unknown as { body: { error: string } }).body.error).toBe('Invalid mode');
    });

    it('skips subscriptions without location without calling Firebase', async () => {
        mockDatabase([{ id: 'sub-6', userId: 'user-1', token: 'token-6', active: 1, latitude: null, longitude: null }]);

        const res = await POST(new NextRequest('http://localhost/api/notifications/prayer-alert?mode=alert'));
        const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

        expect(res.status).toBe(200);
        expect(body.results).toMatchObject({ total: 1, skipped: 1, noLocation: 1 });
        expect(mocks.messagingSend).not.toHaveBeenCalled();
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
        mocks.messagingSend
            .mockResolvedValueOnce('sent')
            .mockRejectedValueOnce({ code: 'messaging/invalid-registration-token' });

        const res = await POST(new Request('http://localhost/api/notifications/prayer-alert?mode=alert') as unknown as NextRequest);
        const body = (res as unknown as { body: PrayerAlertResponseBody }).body;

        expect(res.status).toBe(200);
        expect(body.results).toMatchObject({ total: 4, sent: 1, failed: 1, invalidTokens: 1, skipped: 2 });
        expect(mocks.messagingSend).toHaveBeenCalledTimes(2);
        expect(db.update).toHaveBeenCalledTimes(2);
    });
});
