
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fs/promises
const mockReadFile = vi.fn();
vi.mock('fs/promises', () => ({
    readFile: mockReadFile,
}));

// Mock firebase-admin
const mockApps = [] as any[];
const mockInitializeApp = vi.fn();
const mockCert = vi.fn();
const mockMessaging = vi.fn(() => ({ send: vi.fn() }));

vi.mock('firebase-admin', () => {
    return {
        default: {
            get apps() { return mockApps; },
            initializeApp: mockInitializeApp,
            credential: {
                cert: mockCert,
            },
            messaging: mockMessaging,
        },
    };
});

describe('firebase-admin', () => {
    const originalEnv = process.env;
    let getMessaging: typeof import('./firebase-admin').getMessaging;

    beforeEach(async () => {
        vi.resetModules();
        process.env = { ...originalEnv };
        mockApps.length = 0; // Clear apps array
        mockReadFile.mockReset();
        mockInitializeApp.mockReset();
        mockCert.mockReset();
        mockMessaging.mockReset();
        mockMessaging.mockReturnValue({ send: vi.fn() } as any);

        const mod = await import('./firebase-admin');
        getMessaging = mod.getMessaging;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should return null if no credentials and no apps', async () => {
        mockReadFile.mockRejectedValue(new Error('File not found'));
        const messaging = await getMessaging();
        expect(messaging).toBeNull();
        expect(mockInitializeApp).not.toHaveBeenCalled();
    });

    it('should initialize with FIREBASE_SERVICE_ACCOUNT_BASE64', async () => {
        const creds = { project_id: 'test-project' };
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 = Buffer.from(JSON.stringify(creds)).toString('base64');

        await getMessaging();

        expect(mockCert).toHaveBeenCalledWith(creds);
        expect(mockInitializeApp).toHaveBeenCalled();
    });

    it('should initialize with FIREBASE_SERVICE_ACCOUNT_JSON', async () => {
        const creds = { project_id: 'test-project-json' };
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify(creds);

        await getMessaging();

        expect(mockCert).toHaveBeenCalledWith(creds);
        expect(mockInitializeApp).toHaveBeenCalled();
    });

    it('should initialize with local file if env vars missing', async () => {
        const creds = { project_id: 'test-project-file' };
        mockReadFile.mockResolvedValue(JSON.stringify(creds));

        await getMessaging();

        expect(mockReadFile).toHaveBeenCalled();
        expect(mockCert).toHaveBeenCalledWith(creds);
        expect(mockInitializeApp).toHaveBeenCalled();
    });

    it('should return existing messaging instance if already initialized', async () => {
        mockApps.push({}); // Simulate initialized app

        const messaging = await getMessaging();

        expect(messaging).toBeDefined();
        expect(mockInitializeApp).not.toHaveBeenCalled();
    });
});
