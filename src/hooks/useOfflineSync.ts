import { useState, useEffect, useCallback } from 'react';
import { offlineQueue, QueuedAction } from '../lib/offlineQueue';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const refreshPendingCount = useCallback(async () => {
    const actions = await offlineQueue.getPendingActions();
    setPendingCount(actions.length);
  }, []);

  const flushQueue = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    const actions = await offlineQueue.getPendingActions();
    if (actions.length === 0) return;

    setIsSyncing(true);

    try {
      for (const action of actions) {
        try {
          const res = await fetch(action.endpoint, {
            method: action.method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: action.payload ? JSON.stringify(action.payload) : undefined,
          });

          if (res.ok || res.status === 409) {
            // Success or already applied
            await offlineQueue.removeAction(action.id);
          }
        } catch {
          // Keep in queue for next sync attempt
          break;
        }
      }
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
      await refreshPendingCount();
    }
  }, [isSyncing, refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      void flushQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    void refreshPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [flushQueue, refreshPendingCount]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncTime,
    flushQueue,
    refreshPendingCount,
  };
}
