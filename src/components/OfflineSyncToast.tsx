import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

export const OfflineSyncToast: React.FC = () => {
  const { isOnline, pendingCount, isSyncing, flushQueue } = useOfflineSync();

  // If online and nothing is queued, render nothing to keep viewport clean
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      aria-label="Offline synchronization status"
      className="fixed bottom-5 right-5 z-50 animate-slide-up"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md transition-all ${
          !isOnline
            ? 'bg-amber-950/90 border-amber-800 text-amber-200 shadow-amber-950/50'
            : isSyncing
            ? 'bg-indigo-950/90 border-indigo-800 text-indigo-200 shadow-indigo-950/50'
            : 'bg-slate-900/90 border-slate-700 text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
          ) : isSyncing ? (
            <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
          ) : (
            <Wifi className="w-4 h-4 text-emerald-400" />
          )}

          <span>
            {!isOnline
              ? `Offline Mode ${pendingCount > 0 ? `(${pendingCount} pending)` : ''}`
              : isSyncing
              ? `Syncing ${pendingCount} change${pendingCount > 1 ? 's' : ''}...`
              : `${pendingCount} changes saved locally`}
          </span>
        </div>

        {isOnline && pendingCount > 0 && !isSyncing && (
          <button
            onClick={() => void flushQueue()}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
          >
            Sync Now
          </button>
        )}
      </div>
    </aside>
  );
};
