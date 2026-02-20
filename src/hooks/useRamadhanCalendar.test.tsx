// @vitest-environment jsdom
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRamadhanCalendar } from './useRamadhanCalendar';
import { expect, vi, describe, it, beforeEach } from 'vitest';

// Use vi.hoisted for variables used in mocks
const { mockGetOptional, mockSet, mockCaptureException, mockFetchWithTimeout } = vi.hoisted(() => {
    return {
        mockGetOptional: vi.fn(),
        mockSet: vi.fn(),
        mockCaptureException: vi.fn(),
        mockFetchWithTimeout: vi.fn(),
    }
});

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
    captureException: mockCaptureException,
}));

// Mock Storage
vi.mock('@/core/infrastructure/storage', () => ({
    getStorageService: () => ({
        getOptional: mockGetOptional,
        set: mockSet,
    }),
}));

// Mock API Config
vi.mock('@/config/apis', () => ({
    API_CONFIG: {
        ALADHAN: { BASE_URL: 'http://api.aladhan.com' }
    }
}));

// Mock fetchWithTimeout
vi.mock('@/lib/utils/fetch', () => ({
    fetchWithTimeout: mockFetchWithTimeout,
}));

describe('useRamadhanCalendar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetOptional.mockReturnValue(null); // Default no cached data
    });

    it('should handle fetch errors gracefully by logging to Sentry and not console', async () => {
        // Arrange
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockFetchWithTimeout.mockRejectedValue(new Error('Network error'));

        // Act
        const { result } = renderHook(() => useRamadhanCalendar());

        // Trigger fetch wrapped in act
        await act(async () => {
            await result.current.fetchCalendar();
        });

        // Wait for error state to be updated
        await waitFor(() => {
            expect(result.current.error).toBe('Network error');
        });

        expect(result.current.loading).toBe(false);

        // Assert
        expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error));

        // Ensure console.error was not called with the error
        // (It might be called with React warnings if act is not perfect, but we care about the error log)
        const errorCalls = consoleErrorSpy.mock.calls.filter(args =>
            args[0] instanceof Error && args[0].message === 'Network error'
        );
        expect(errorCalls.length).toBe(0);

        consoleErrorSpy.mockRestore();
    });
});
