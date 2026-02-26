/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import UpdateChecker from '@/components/UpdateChecker';

// Mock global Fetch
global.fetch = vi.fn();

const mockFetch = (response: any, ok = true) => {
    (global.fetch as any).mockResolvedValue({
        ok,
        json: () => Promise.resolve(response),
    });
};

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        promise: vi.fn((promise) => promise),
    }
}));

describe('UpdateChecker', () => {
    const originalLocation = window.location;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        try {
             // @ts-ignore
            delete window.location;
             // @ts-ignore
            window.location = { ...originalLocation, search: '', href: 'http://localhost/', reload: vi.fn() };
        } catch (e) {}
    });

    afterEach(() => {
        try {
            window.location = originalLocation;
        } catch (e) {}
    });

    it('should NOT render when server version matches current version', async () => {
        mockFetch({ version: '1.0.0' });
        await act(async () => {
            render(<UpdateChecker currentVersion="1.0.0" />);
        });

        expect(global.fetch).toHaveBeenCalled();
        expect(screen.queryByText('Update Tersedia!')).not.toBeInTheDocument();
    });

    it('should NOT render when server version is older', async () => {
        mockFetch({ version: '0.9.9' });
        await act(async () => {
            render(<UpdateChecker currentVersion="1.0.0" />);
        });

        expect(global.fetch).toHaveBeenCalled();
        expect(screen.queryByText('Update Tersedia!')).not.toBeInTheDocument();
    });

    it('should render when server version is newer', async () => {
        mockFetch({ version: '1.0.1' });
        await act(async () => {
            render(<UpdateChecker currentVersion="1.0.0" />);
        });

        expect(screen.getByText('Update Tersedia!')).toBeInTheDocument();
        expect(screen.getByText('Versi 1.0.1 siap digunakan.')).toBeInTheDocument();
    });

    it('should handle update click correctly', async () => {
        vi.useFakeTimers();
        mockFetch({ version: '1.1.0' });

        const postMessage = vi.fn();
        Object.defineProperty(navigator, 'serviceWorker', {
            value: {
                controller: {
                    postMessage,
                },
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            },
            configurable: true
        });

        const deleteCache = vi.fn().mockResolvedValue(true);
        (global as any).caches = {
            keys: vi.fn().mockResolvedValue(['cache-v1']),
            delete: deleteCache,
        };

        await act(async () => {
            render(<UpdateChecker currentVersion="1.0.0" />);
        });

        expect(screen.getByText('Update Tersedia!')).toBeInTheDocument();

        const updateButton = screen.getByRole('button', { name: /Update Sekarang/i });

        await act(async () => {
            fireEvent.click(updateButton);
            // Advance timers to pass delays (2000ms toast + 1000ms SW)
            await vi.advanceTimersByTimeAsync(5000);
        });

        // Check localStorage update
        expect(localStorage.getItem('app_version')).toBe('1.1.0');

        // Check cache clear
        expect(deleteCache).toHaveBeenCalledWith('cache-v1');

        // Check SW message
        expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });

        // Verify redirection intent via logs
        expect(screen.getByText((content) => content.includes('Redirecting to: /?v=1.1.0'))).toBeInTheDocument();

        vi.useRealTimers();
    });
});
