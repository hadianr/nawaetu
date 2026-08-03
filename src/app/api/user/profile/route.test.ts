/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH } from './route';
import { getServerSession } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
    authOptions: {},
    getServerSession: vi.fn()
}));

const mockUpdateSet = vi.fn().mockReturnThis();
const mockUpdateWhere = vi.fn().mockResolvedValue([]);

vi.mock('@/db', () => ({
    db: {
        update: vi.fn(() => ({
            set: mockUpdateSet.mockImplementation(() => ({
                where: mockUpdateWhere
            }))
        }))
    }
}));

vi.mock('next/server', () => ({
    NextRequest: class {
        body?: string;
        constructor(input: string, init?: { body?: string }) {
            this.body = init?.body;
        }
        json() {
            return Promise.resolve(JSON.parse(this.body ?? '{}'));
        }
    },
    NextResponse: {
        json: (data: Record<string, unknown>, init?: { status?: number }) => ({
            status: init?.status || 200,
            json: async () => data,
            body: data
        })
    }
}));

describe("PATCH /api/user/profile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 401 if user is not authenticated", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce(null);
        const req = {
            json: () => Promise.resolve({ gender: 'female' })
        };
        const res: any = await PATCH(req as any);
        expect(res.status).toBe(401);
    });

    it("should update gender successfully for authenticated user", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { id: 'user-123', email: 'test@example.com' }
        } as any);

        const req = {
            json: () => Promise.resolve({ gender: 'female' })
        };

        const res: any = await PATCH(req as any);
        expect(res.status).toBe(200);
        const body = res.body || (await res.json());
        expect(body.data.gender).toBe('female');
        expect(mockUpdateSet).toHaveBeenCalledWith(expect.objectContaining({ gender: 'female' }));
    });
});
