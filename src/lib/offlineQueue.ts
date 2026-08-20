/**
 * Offline Mutation Queue Manager
 * Backed by IndexedDB with in-memory fallback for offline-first UX resilience.
 */

export interface QueuedAction {
  id: string;
  type: 'BOOKMARK' | 'APPLICATION_UPDATE' | 'PROFILE_EDIT' | 'NOTE_SAVE';
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  payload: any;
  timestamp: number;
  retryCount: number;
}

class OfflineQueueManager {
  private memoryQueue: QueuedAction[] = [];
  private dbName = 'YuvaHubOfflineDB';
  private storeName = 'offline_mutations';
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  public async init(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined' || !window.indexedDB) {
      return;
    }

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(this.dbName, 1);

        request.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName, { keyPath: 'id' });
          }
        };

        request.onsuccess = (event: any) => {
          this.db = event.target.result;
          this.isInitialized = true;
          resolve();
        };

        request.onerror = () => {
          // Fallback to in-memory queue
          this.isInitialized = true;
          resolve();
        };
      } catch {
        this.isInitialized = true;
        resolve();
      }
    });
  }

  public async enqueue(
    type: QueuedAction['type'],
    endpoint: string,
    method: QueuedAction['method'],
    payload: any
  ): Promise<QueuedAction> {
    await this.init();

    const action: QueuedAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      endpoint,
      method,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    if (this.db) {
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db!.transaction(this.storeName, 'readwrite');
          const store = tx.objectStore(this.storeName);
          const req = store.add(action);
          req.onsuccess = () => resolve(action);
          req.onerror = () => {
            this.memoryQueue.push(action);
            resolve(action);
          };
        } catch {
          this.memoryQueue.push(action);
          resolve(action);
        }
      });
    }

    this.memoryQueue.push(action);
    return action;
  }

  public async getPendingActions(): Promise<QueuedAction[]> {
    await this.init();

    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction(this.storeName, 'readonly');
          const store = tx.objectStore(this.storeName);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([...this.memoryQueue]);
        } catch {
          resolve([...this.memoryQueue]);
        }
      });
    }

    return [...this.memoryQueue];
  }

  public async removeAction(id: string): Promise<void> {
    await this.init();

    this.memoryQueue = this.memoryQueue.filter((a) => a.id !== id);

    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction(this.storeName, 'readwrite');
          const store = tx.objectStore(this.storeName);
          const req = store.delete(id);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }
  }

  public async clear(): Promise<void> {
    this.memoryQueue = [];
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction(this.storeName, 'readwrite');
          const store = tx.objectStore(this.storeName);
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }
  }
}

export const offlineQueue = new OfflineQueueManager();
