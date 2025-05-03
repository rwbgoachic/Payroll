import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../src/hooks/useOnlineStatus';

describe('useOnlineStatus', () => {
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;

  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true
    });

    // Spy on addEventListener and removeEventListener
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the initial online status', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('should add event listeners for online and offline events', () => {
    renderHook(() => useOnlineStatus());
    
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should remove event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOnlineStatus());
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should update status when online event is triggered', () => {
    // Start with offline status
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false
    });
    
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
    
    // Simulate online event
    act(() => {
      // First get the callback function that was registered
      const onlineCallback = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'online'
      )[1];
      
      // Then simulate the event by calling the callback
      onlineCallback();
    });
    
    expect(result.current).toBe(true);
  });

  it('should update status when offline event is triggered', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
    
    // Simulate offline event
    act(() => {
      // First get the callback function that was registered
      const offlineCallback = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'offline'
      )[1];
      
      // Then simulate the event by calling the callback
      offlineCallback();
    });
    
    expect(result.current).toBe(false);
  });
});