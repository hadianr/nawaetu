
// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { AdvancedDataSyncer } from './AdvancedDataSyncer';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useSession } from 'next-auth/react';
import { useIsOnline } from '@/hooks/useNetworkStatus';
import { syncQueue } from '@/lib/sync-queue';

// Mock dependencies
vi.mock('next-auth/react');
vi.mock('@/hooks/useNetworkStatus');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
  },
}));

vi.mock('@/lib/sync-queue', () => ({
  syncQueue: {
    getPendingEntries: vi.fn(),
    markAsSynced: vi.fn(),
    markAsFailed: vi.fn(),
    incrementRetry: vi.fn(),
    getStats: vi.fn(),
  },
}));

describe('AdvancedDataSyncer', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = mockFetch;

    // Default mocks
    (useSession as any).mockReturnValue({ data: { user: { id: 'user1' } } });
    (useIsOnline as any).mockReturnValue(true);
    (syncQueue.getStats as any).mockReturnValue({});
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('batches sync requests', async () => {
    vi.useFakeTimers();

    // Mock pending entries
    const pendingEntries = Array.from({ length: 60 }, (_, i) => ({
      id: `entry-${i}`,
      type: 'bookmark',
      action: 'create',
      data: {},
      status: 'pending',
    }));

    (syncQueue.getPendingEntries as any).mockReturnValue(pendingEntries);

    // Mock fetch success
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        synced: pendingEntries.slice(0, 50).map(e => ({ id: e.id })),
        failed: [],
      }),
    });

    render(<AdvancedDataSyncer />);

    // Trigger sync (via online event which defaults to 2s delay)
    await vi.advanceTimersByTimeAsync(3000);

    // Should be called twice (50 + 10 entries)
    // Wait for promises to resolve
    await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    // Check first batch
    const firstCallBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(firstCallBody.entries).toHaveLength(50);
    expect(firstCallBody.entries[0].id).toBe('entry-0');

    // Check second batch
    const secondCallBody = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(secondCallBody.entries).toHaveLength(10);
    expect(secondCallBody.entries[0].id).toBe('entry-50');
  });
});
