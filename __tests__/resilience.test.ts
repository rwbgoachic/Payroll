import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker, retry } from '../src/lib/resilience';

describe('Circuit Breaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should execute a function successfully', async () => {
    const circuitBreaker = new CircuitBreaker();
    const fn = vi.fn().mockResolvedValue('success');
    
    const result = await circuitBreaker.execute(fn);
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(circuitBreaker.getState()).toBe('closed');
    expect(circuitBreaker.getFailureCount()).toBe(0);
  });

  it('should record failures', async () => {
    const circuitBreaker = new CircuitBreaker(3);
    const fn = vi.fn().mockRejectedValue(new Error('test error'));
    
    // First failure
    await expect(circuitBreaker.execute(fn)).rejects.toThrow('test error');
    expect(circuitBreaker.getFailureCount()).toBe(1);
    expect(circuitBreaker.getState()).toBe('closed');
    
    // Second failure
    await expect(circuitBreaker.execute(fn)).rejects.toThrow('test error');
    expect(circuitBreaker.getFailureCount()).toBe(2);
    expect(circuitBreaker.getState()).toBe('closed');
    
    // Third failure - should open the circuit
    await expect(circuitBreaker.execute(fn)).rejects.toThrow('test error');
    expect(circuitBreaker.getFailureCount()).toBe(3);
    expect(circuitBreaker.getState()).toBe('open');
  });

  it('should reject calls when circuit is open', async () => {
    const circuitBreaker = new CircuitBreaker(1);
    const fn = vi.fn().mockRejectedValue(new Error('test error'));
    
    // First call - fails and opens circuit
    await expect(circuitBreaker.execute(fn)).rejects.toThrow('test error');
    expect(circuitBreaker.getState()).toBe('open');
    
    // Reset the mock to return success
    fn.mockReset().mockResolvedValue('success');
    
    // Second call - should be rejected without calling the function
    await expect(circuitBreaker.execute(fn)).rejects.toThrow('Service unavailable');
    expect(fn).toHaveBeenCalledTimes(1); // Only called once from the first attempt
  });

  it('should transition to half-open state after timeout', async () => {
    const circuitBreaker = new CircuitBreaker(1, 60000, 1000);
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('test error'))
      .mockResolvedValueOnce('success');
    
    // First call - fails and opens circuit
    await expect(circuitBreaker.execute(fn)).rejects.toThrow('test error');
    expect(circuitBreaker.getState()).toBe('open');
    
    // Advance time past the half-open timeout
    vi.advanceTimersByTime(1500);
    
    // Next call should succeed and close the circuit
    const result = await circuitBreaker.execute(fn);
    expect(result).toBe('success');
    expect(circuitBreaker.getState()).toBe('closed');
    expect(circuitBreaker.getFailureCount()).toBe(0);
  });

  it('should reset failure count after timeout', async () => {
    const circuitBreaker = new CircuitBreaker(3, 1000);
    const fn = vi.fn().mockRejectedValue(new Error('test error'));
    
    // First failure
    await expect(circuitBreaker.execute(fn)).rejects.toThrow('test error');
    expect(circuitBreaker.getFailureCount()).toBe(1);
    
    // Advance time past the reset timeout
    vi.advanceTimersByTime(1500);
    
    // Failures should be reset
    expect(circuitBreaker.getFailureCount()).toBe(0);
  });

  it('should notify listeners of state changes', async () => {
    const circuitBreaker = new CircuitBreaker(1);
    const stateChangeHandler = vi.fn();
    
    circuitBreaker.onStateChangeCallback(stateChangeHandler);
    
    const fn = vi.fn().mockRejectedValue(new Error('test error'));
    
    // Call should fail and open the circuit
    await expect(circuitBreaker.execute(fn)).rejects.toThrow('test error');
    
    expect(stateChangeHandler).toHaveBeenCalledWith('open');
  });
});

describe('Retry Function', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return result on first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    
    const resultPromise = retry(fn, 3, 100);
    
    // Fast-forward time to resolve all promises
    await vi.runAllTimersAsync();
    
    const result = await resultPromise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('first failure'))
      .mockRejectedValueOnce(new Error('second failure'))
      .mockResolvedValueOnce('success');
    
    const resultPromise = retry(fn, 3, 100);
    
    // Fast-forward time to resolve all promises
    await vi.runAllTimersAsync();
    
    const result = await resultPromise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('persistent failure'));
    
    const resultPromise = retry(fn, 2, 100);
    
    // Fast-forward time to resolve all promises
    await vi.runAllTimersAsync();
    
    await expect(resultPromise).rejects.toThrow('persistent failure');
    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('should use exponential backoff', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('first failure'))
      .mockRejectedValueOnce(new Error('second failure'))
      .mockResolvedValueOnce('success');
    
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    
    const resultPromise = retry(fn, 2, 100);
    
    // Fast-forward time to resolve all promises
    await vi.runAllTimersAsync();
    
    await resultPromise;
    
    // First retry should be around 100ms (base delay)
    // Second retry should be around 200ms (base delay * 2^1)
    // Exact values will vary due to jitter
    expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
    
    const firstDelay = setTimeoutSpy.mock.calls[0][1];
    const secondDelay = setTimeoutSpy.mock.calls[1][1];
    
    // Check that second delay is roughly double the first (accounting for jitter)
    expect(secondDelay).toBeGreaterThan(firstDelay * 1.5);
    expect(secondDelay).toBeLessThan(firstDelay * 2.5);
  });
});