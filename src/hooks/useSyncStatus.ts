import { useState, useEffect } from 'react';
import { syncManager, SyncStatus } from '../services/syncManager';

/**
 * Hook to track sync status
 * @returns The current sync status and last sync time
 */
export function useSyncStatus(): {
  status: SyncStatus;
  lastSync: Date | null;
  sync: () => Promise<void>;
} {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Get initial status
    const { status: initialStatus, lastSync: initialLastSync } = syncManager.getStatus();
    setStatus(initialStatus);
    setLastSync(initialLastSync);

    // Add listener for status changes
    const removeListener = syncManager.addListener((newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'success') {
        setLastSync(new Date());
      }
    });

    return removeListener;
  }, []);

  const sync = async () => {
    await syncManager.sync();
  };

  return { status, lastSync, sync };
}