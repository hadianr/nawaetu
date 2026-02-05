import { StorageService } from './service';
import { StorageFactory } from './factory';

/**
 * Singleton Storage Service Instance
 * Digunakan di seluruh aplikasi untuk consistency
 */
let storageService: StorageService | null = null;

export function getStorageService(): StorageService {
  if (!storageService) {
    const adapter = StorageFactory.create('localStorage');
    storageService = new StorageService(adapter);
  }
  return storageService;
}

/**
 * Reset storage service (useful for testing)
 */
export function resetStorageService(): void {
  storageService = null;
}

// Re-export types and classes
export * from './adapter';
export * from './service';
export * from './factory';
export { LocalStorageAdapter } from './local-storage.adapter';
