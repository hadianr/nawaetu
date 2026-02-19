import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askMentor } from '../app/mentor-ai/ai-action';
import { chatRateLimiter } from '@/lib/rate-limit';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
    authOptions: {}
}));

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}));

vi.mock('next/headers', () => ({
    headers: vi.fn(),
}));

vi.mock('@/lib/llm-providers/model-router', () => {
    return {
        ModelRouter: vi.fn().mockImplementation(() => ({
            chat: vi.fn().mockResolvedValue({ response: "AI Response", provider: "Mock" })
        }))
    };
});

vi.mock('@/lib/rate-limit', () => ({
    chatRateLimiter: {
        check: vi.fn().mockResolvedValue({ success: true, remaining: 9 })
    }
}));

describe('Mentor AI Rate Limiting', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should use User ID for authenticated users', async () => {
        // Mock authenticated session
        (getServerSession as any).mockResolvedValue({
            user: { id: 'user-123', name: 'Test User' }
        });

        // Mock headers (async)
        (headers as any).mockResolvedValue({
            get: vi.fn().mockReturnValue('1.2.3.4')
        });

        const context = { name: 'Spoofed Name', prayerStreak: 5, lastPrayer: 'Asr' };
        await askMentor('Hello', context);

        expect(chatRateLimiter.check).toHaveBeenCalledWith(10, 'user:user-123');
        expect(chatRateLimiter.check).not.toHaveBeenCalledWith(10, expect.stringContaining('Spoofed Name'));
    });

    it('should use IP address for guest users', async () => {
        // Mock no session
        (getServerSession as any).mockResolvedValue(null);

        // Mock headers with IP (async)
        (headers as any).mockResolvedValue({
            get: vi.fn((key) => {
                if (key === 'x-forwarded-for') return '203.0.113.1, 10.0.0.1';
                return null;
            })
        });

        const context = { name: 'Guest User', prayerStreak: 0, lastPrayer: 'None' };
        await askMentor('Hello', context);

        // Should use first IP from x-forwarded-for
        expect(chatRateLimiter.check).toHaveBeenCalledWith(10, 'ip:203.0.113.1');
    });

    it('should fallback to x-real-ip if x-forwarded-for is missing', async () => {
        (getServerSession as any).mockResolvedValue(null);

        (headers as any).mockResolvedValue({
            get: vi.fn((key) => {
                if (key === 'x-real-ip') return '192.168.1.100';
                return null;
            })
        });

        const context = { name: 'Guest User', prayerStreak: 0, lastPrayer: 'None' };
        await askMentor('Hello', context);

        expect(chatRateLimiter.check).toHaveBeenCalledWith(10, 'ip:192.168.1.100');
    });

    it('should handle missing headers gracefully', async () => {
        (getServerSession as any).mockResolvedValue(null);

        // Mock empty headers
        (headers as any).mockResolvedValue({
            get: vi.fn().mockReturnValue(null)
        });

        const context = { name: 'Guest User', prayerStreak: 0, lastPrayer: 'None' };
        await askMentor('Hello', context);

        expect(chatRateLimiter.check).toHaveBeenCalledWith(10, 'ip:unknown');
    });

    it('should prevent rate limit bypass by changing name', async () => {
        (getServerSession as any).mockResolvedValue(null);
        (headers as any).mockResolvedValue({
            get: vi.fn().mockReturnValue('1.1.1.1')
        });

        // First request
        await askMentor('Hello', { name: 'User A', prayerStreak: 0, lastPrayer: '' });
        expect(chatRateLimiter.check).toHaveBeenCalledWith(10, 'ip:1.1.1.1');

        vi.clearAllMocks(); // clear call count

        // Second request with different name but same IP
        await askMentor('Hello', { name: 'User B', prayerStreak: 0, lastPrayer: '' });
        expect(chatRateLimiter.check).toHaveBeenCalledWith(10, 'ip:1.1.1.1');
    });
});
