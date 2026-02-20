import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAvailableModels } from '../app/mentor-ai/model-check';

// Mock next-auth
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}));

// Mock @/lib/auth
vi.mock('@/lib/auth', () => ({
    authOptions: {},
}));

// Mock GoogleGenerativeAI
vi.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: vi.fn(() => ({
            getGenerativeModel: vi.fn(() => ({
                generateContent: vi.fn(() => Promise.resolve({ response: { text: () => "mock response" } })),
            })),
        })),
    };
});

describe('model-check security', () => {
    beforeEach(() => {
        process.env.GEMINI_API_KEY = "test-key";
        vi.clearAllMocks();
    });

    it('should deny access if not authenticated', async () => {
        const { getServerSession } = await import('next-auth');
        // @ts-ignore
        vi.mocked(getServerSession).mockResolvedValue(null);

        const result = await checkAvailableModels();
        expect(result).toBe("Unauthorized");
    });

    it('should allow access if authenticated', async () => {
        const { getServerSession } = await import('next-auth');
        // @ts-ignore
        vi.mocked(getServerSession).mockResolvedValue({ user: { name: 'Test User' } });

        const result = await checkAvailableModels();
        // It returns "gemini-3-flash-preview is working!" on success or "No Key" or error
        // But specifically NOT "Unauthorized"
        expect(result).not.toBe("Unauthorized");
    });
});
