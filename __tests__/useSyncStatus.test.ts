import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSyncStatus } from '../src/hooks/useSyncStatus';
import { syncManager } from '../src/services/syncManager';

// Mock syncManager
vi.mock('../src/services/syncManager', () => ({
  syncManager: {
    getStatus: vi.fn(() => ({ status: 'idle', lastSync: null })),
    addListener: vi.fn((callback) => {
      // Return a function to remove the listener
      return vi.fn();
    }),
    sync: vi.fn(() => Promise.resolve())
  }
}));

describe('useSyncStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the initial sync status', () => {
    const { result } = renderHook(() => useSyncStatus());
    
    expect(result.current.status).toBe('idle');
    expect(result.current.lastSync).toBe(null);
    expect(typeof result.current.sync).toBe('function');
  });

  it('should add a listener for status changes', () => {
    renderHook(() => useSyncStatus());
    
    expect(syncManager.addListener).toHaveBeenCalledTimes(1);
    expect(syncManager.addListener).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should update status when listener is called', () => {
    // Setup mock to capture the listener callback
    let listenerCallback: (status: any) => void;
    vi.mocked(syncManager.addListener).mockImplementation((callback) => {
      listenerCallback = callback;
      return vi.fn();
    });
    
    const { result } = renderHook(() => useSyncStatus());
    
    // Initial state
    expect(result.current.status).toBe('idle');
    
    // Simulate status change
    act(() => {
      listenerCallback('syncing');
    });
    
    expect(result.current.status).toBe('syncing');
    
    // Simulate success
    act(() => {
      listenerCallback('success');
    });
    
    expect(result.current.status).toBe('success');
    expect(result.current.lastSync).not.toBe(null);
  });

  it('should call syncManager.sync when sync function is called', async () => {
    const { result } = renderHook(() => useSyncStatus());
    
    await act(async () => {
      await result.current.sync();
    });
    
    expect(syncManager.sync).toHaveBeenCalledTimes(1);
  });

  it('should remove the listener on unmount', () => {
    // Setup mock to return a removal function
    const removeListener = vi.fn();
    vi.mocked(syncManager.addListener).mockReturnValue(removeListener);
    
    const { unmount } = renderHook(() => useSyncStatus());
    unmount();
    
    expect(removeListener).toHaveBeenCalledTimes(1);
  });
});