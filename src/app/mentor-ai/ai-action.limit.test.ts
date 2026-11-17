import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askMentor } from './ai-action';
import { getServerSession } from '@/lib/auth';
import { MENTOR_DAILY_LIMIT } from '@/lib/constants/mentor-limit';
import { USER_MESSAGES } from './mentor-messages';

// The real rate limiters (in memory, since no Redis is configured here); only the user and the model are faked.
const { mockChat } = vi.hoisted(() => ({ mockChat: vi.fn() }));

vi.mock('@/lib/auth', () => ({ authOptions: {}, getServerSession: vi.fn() }));
vi.mock('@/lib/llm-providers/model-router', () => ({
    ModelRouter: vi.fn().mockImplementation(function MockModelRouter() { return { chat: mockChat }; }),
}));
vi.mock('@/lib/time-context', () => ({ getCurrentTimeContext: vi.fn().mockReturnValue({}) }));

const context = { name: 'Alice', prayerStreak: 1, lastPrayer: 'Fajr' };

// The per-minute limit counts every request, failures included, and is not what these tests are about: each
// question is asked a minute later, so only the daily limit can answer "no".
const ask = (message: string) => {
    vi.setSystemTime(Date.now() + 61_000);
    return askMentor(message, context);
};
let n = 0;
const signIn = () => vi.mocked(getServerSession).mockResolvedValue({
    expires: new Date(Date.now() + 60_000).toISOString(),
    user: { id: `limit-user-${++n}`, isMuhsinin: false },
});

describe('askMentor daily limit, with the real limiter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers({ toFake: ['Date'] });
        mockChat.mockResolvedValue({ response: 'Jawaban dari AI', provider: 'Mock' });
    });

    afterEach(() => { vi.useRealTimers(); });

    it('answers the first 10 and refuses the 11th without calling the model', async () => {
        signIn();
        for (let i = 0; i < MENTOR_DAILY_LIMIT; i++) {
            expect(await ask(`Pertanyaan ${i}`)).toBe('Jawaban dari AI');
        }
        mockChat.mockClear();

        expect(await ask('Pertanyaan terakhir')).toBe(USER_MESSAGES.id.dailyLimit);
        expect(mockChat).not.toHaveBeenCalled();
    });

    it('does not use up an answer on model failures or refusals', async () => {
        signIn();
        for (let i = 0; i < 25; i++) {
            mockChat.mockRejectedValueOnce(new Error('boom'));
            expect(await ask(`Gagal ${i}`)).toBe(USER_MESSAGES.id.technical);
        }
        expect(await ask('buatkan JavaScript untuk membuat bintang')).toMatch(/hanya membantu/i);

        // Still the full ten, after 25 failures and a refusal.
        for (let i = 0; i < MENTOR_DAILY_LIMIT; i++) {
            expect(await ask(`Berhasil ${i}`)).toBe('Jawaban dari AI');
        }
        expect(await ask('Satu lagi')).toBe(USER_MESSAGES.id.dailyLimit);
    });
});
