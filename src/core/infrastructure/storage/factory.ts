import { StorageAdapter } from './adapter';
import { LocalStorageAdapter } from './local-storage.adapter';

export type StorageType = 'localStorage' | 'sessionStorage' | 'memory' | 'api';

/**
 * Storage Factory
 * Memudahkan switching antara storage implementations
 */
export class StorageFactory {
  static create(type: StorageType = 'localStorage'): StorageAdapter {
    switch (type) {
      case 'localStorage':
        return new LocalStorageAdapter();
      
      case 'sessionStorage':
        // Future: SessionStorageAdapter
        // For now, fallback to localStorage
        return new LocalStorageAdapter();
      
      case 'memory':
        // Future: MemoryStorageAdapter for testing
        // For now, fallback to localStorage
        return new LocalStorageAdapter();
      
      case 'api':
        // Future: APIStorageAdapter untuk sync ke backend
        // For now, fallback to localStorage
        return new LocalStorageAdapter();
      
      default:
        throw new Error(`Unknown storage type: ${type}`);
    }
  }
}
