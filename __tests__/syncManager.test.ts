import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SyncManager, syncManager } from '../src/services/syncManager';
import * as indexedDB from '../src/lib/indexedDB';
import { supabase } from '../src/lib/supabase';

// Mock dependencies
vi.mock('../src/lib/indexedDB');
vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        match: vi.fn(() => ({
          data: [],
          error: null
        }))
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          data: [],
          error: null
        }))
      }))
    }))
  }
}));

describe('SyncManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true
    });
    
    // Mock window.setInterval and clearInterval
    vi.spyOn(window, 'setInterval').mockReturnValue(123);
    vi.spyOn(window, 'clearInterval').mockImplementation(() => {});
    
    // Mock indexedDB functions
    vi.mocked(indexedDB.getUnsyncedTransactions).mockResolvedValue([]);
    vi.mocked(indexedDB.markTransactionSynced).mockResolvedValue();
    vi.mocked(indexedDB.addOfflineTransaction).mockResolvedValue('test-id');
    vi.mocked(indexedDB.clearSyncedTransactions).mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = SyncManager.getInstance();
    const instance2 = SyncManager.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  it('should start and stop sync interval', () => {
    const manager = SyncManager.getInstance();
    
    manager.start(30000);
    expect(window.setInterval).toHaveBeenCalledWith(expect.any(Function), 30000);
    
    manager.stop();
    expect(window.clearInterval).toHaveBeenCalledWith(123);
  });

  it('should add and remove listeners', () => {
    const manager = SyncManager.getInstance();
    const listener = vi.fn();
    
    const removeListener = manager.addListener(listener);
    
    // Trigger a sync to update status
    manager.sync();
    
    expect(listener).toHaveBeenCalled();
    
    // Remove the listener
    removeListener();
    
    // Reset the mock
    listener.mockReset();
    
    // Trigger another sync
    manager.sync();
    
    // Listener should not be called
    expect(listener).not.toHaveBeenCalled();
  });

  it('should sync unsynced transactions', async () => {
    // Mock unsynced transactions
    vi.mocked(indexedDB.getUnsyncedTransactions).mockResolvedValue([
      {
        id: '1',
        type: 'payroll_run',
        data: { test: 'data1' },
        sync_status: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        type: 'time_entry',
        data: { test: 'data2' },
        sync_status: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
    
    await syncManager.sync();
    
    // Should have called upsert for each transaction type
    expect(supabase.from).toHaveBeenCalledWith('payroll_runs');
    expect(supabase.from).toHaveBeenCalledWith('time_entries');
    
    // Should have marked transactions as synced
    expect(indexedDB.markTransactionSynced).toHaveBeenCalledTimes(2);
    expect(indexedDB.markTransactionSynced).toHaveBeenCalledWith('1');
    expect(indexedDB.markTransactionSynced).toHaveBeenCalledWith('2');
    
    // Should have cleared synced transactions
    expect(indexedDB.clearSyncedTransactions).toHaveBeenCalled();
  });

  it('should save data for offline use', async () => {
    const id = await syncManager.saveOfflineData('payroll_run', { test: 'data' });
    
    expect(indexedDB.addOfflineTransaction).toHaveBeenCalledWith('payroll_run', { test: 'data' });
    expect(id).toBe('test-id');
  });

  it('should pull data from the server', async () => {
    await syncManager.pullData('payroll_run', { company_id: '1' });
    
    expect(supabase.from).toHaveBeenCalledWith('payroll_runs');
    expect(supabase.from().select().match).toHaveBeenCalledWith({ company_id: '1' });
  });

  it('should not sync when offline', async () => {
    // Set navigator.onLine to false
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false
    });
    
    await syncManager.sync();
    
    // Should not have attempted to sync
    expect(indexedDB.getUnsyncedTransactions).not.toHaveBeenCalled();
  });

  it('should handle sync errors gracefully', async () => {
    // Mock an error during sync
    vi.mocked(indexedDB.getUnsyncedTransactions).mockRejectedValue(new Error('Test error'));
    
    const listener = vi.fn();
    syncManager.addListener(listener);
    
    await syncManager.sync();
    
    // Should have updated status to error
    expect(listener).toHaveBeenCalledWith('error');
  });
});