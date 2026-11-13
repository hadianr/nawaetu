import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'user-1' } }) }));
vi.mock('@/lib/rate-limit', () => ({
    insightRateLimiter: { check: vi.fn().mockResolvedValue({ success: false, remaining: 0 }) },
}));
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class { getGenerativeModel() { return { generateContent }; } },
}));

import { POST } from './route';
import { insightRateLimiter } from '@/lib/rate-limit';

describe('POST /api/ramadhan/insight', () => {
    it('answers from the fallback list, without calling a model, once the user is over the limit', async () => {
        const req = new NextRequest('http://localhost/api/ramadhan/insight', {
            method: 'POST',
            body: JSON.stringify({ stats: {}, lang: 'id' }),
        });

        const res = await POST(req);

        expect(insightRateLimiter.check).toHaveBeenCalledWith('insight:user-1');
        expect(res.status).toBe(200);
        expect((res as unknown as { body: { insight: string } }).body.insight).toEqual(expect.any(String));
        expect(generateContent).not.toHaveBeenCalled();
    });
});
