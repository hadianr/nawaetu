import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askMentor } from '../app/mentor-ai/ai-action';
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

const { mockChat } = vi.hoisted(() => {
    return { mockChat: vi.fn().mockResolvedValue({ response: "AI Response", provider: "Mock" }) };
});

vi.mock('@/lib/llm-providers/model-router', () => {
    return {
        ModelRouter: class {
            chat = mockChat;
        }
    };
});

vi.mock('@/lib/rate-limit', () => ({
    chatRateLimiter: {
        check: vi.fn().mockResolvedValue({ success: true, remaining: 9 })
    }
}));

describe('Mentor AI Security', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mocks
        (getServerSession as any).mockResolvedValue({ user: { id: 'user-123' } });
        (headers as any).mockResolvedValue({ get: vi.fn().mockReturnValue('1.2.3.4') });
    });

    it('should truncate huge chat history (length and content)', async () => {
        const hugeString = 'a'.repeat(2000); // 2000 chars (limit is 1000)
        // Create 30 messages (limit is 20)
        const hugeHistory = Array(30).fill({ role: 'user', content: hugeString });

        const context = { name: 'Test User', prayerStreak: 5, lastPrayer: 'Asr' };
        await askMentor('Hello', context, hugeHistory);

        expect(mockChat).toHaveBeenCalledTimes(1);
        const [message, ctx, history] = mockChat.mock.calls[0];

        // 1. Check history length (should be 20)
        expect(history.length).toBe(20);

        // 2. Check content truncation (should be 1000 chars)
        expect(history[0].content.length).toBe(1000);
        expect(history[0].content).toBe(hugeString.slice(0, 1000));

        // 3. Check role validation
        expect(history[0].role).toBe('user');
    });

    it('should sanitize invalid roles to assistant', async () => {
        const invalidRoleHistory: any[] = [
            { role: 'admin', content: 'test1' },
            { role: 'system', content: 'test2' },
            { role: 'user', content: 'test3' }
        ];

        const context = { name: 'Test User', prayerStreak: 5, lastPrayer: 'Asr' };
        await askMentor('Hello', context, invalidRoleHistory);

        expect(mockChat).toHaveBeenCalledTimes(1);
        const [message, ctx, history] = mockChat.mock.calls[0];

        expect(history.length).toBe(3);
        expect(history[0].role).toBe('assistant'); // 'admin' -> 'assistant'
        expect(history[1].role).toBe('assistant'); // 'system' -> 'assistant'
        expect(history[2].role).toBe('user');      // 'user' -> 'user'
    });
});
