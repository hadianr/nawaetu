/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { db } from '@/db';
import { NextRequest } from 'next/server';

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
        }
    };
});

vi.mock('@/lib/notifications/firebase-admin', () => ({
    getMessaging: vi.fn().mockResolvedValue({
        send: vi.fn().mockResolvedValue('msg-id-123'),
    })
}));

describe('POST /api/notifications/prayer-alert', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
        } as any);
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

        (db.select as any).mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(mockSubscriptions),
            })
        });

        const req = new NextRequest('http://localhost/api/notifications/prayer-alert?mode=alert');
        const res = await POST(req);
        const body = (res as any).body || (typeof (res as any).json === 'function' ? await (res as any).json() : res);

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

        (db.select as any).mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(mockSubscriptions),
            })
        });

        const req = new NextRequest('http://localhost/api/notifications/prayer-alert?mode=alert');
        const res = await POST(req);
        const body = (res as any).body || (typeof (res as any).json === 'function' ? await (res as any).json() : res);

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.results.total).toBe(1);
    });
});
