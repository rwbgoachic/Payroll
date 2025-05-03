import { useState, useEffect } from 'react';
import { CircuitBreaker } from '../lib/resilience';

/**
 * Hook to use a circuit breaker in React components
 * @param options Circuit breaker options
 * @returns Circuit breaker instance and state
 */
export function useCircuitBreaker(options?: {
  maxFailures?: number;
  resetTimeoutMs?: number;
  halfOpenAfterMs?: number;
}) {
  const [circuitBreaker] = useState(() => new CircuitBreaker(
    options?.maxFailures,
    options?.resetTimeoutMs,
    options?.halfOpenAfterMs
  ));
  
  const [state, setState] = useState<'closed' | 'open' | 'half-open'>(circuitBreaker.getState());

  useEffect(() => {
    circuitBreaker.onStateChangeCallback(setState);
    
    return () => {
      circuitBreaker.onStateChangeCallback(() => {});
    };
  }, [circuitBreaker]);

  const reset = () => {
    circuitBreaker.reset();
  };

  return { circuitBreaker, state, reset };
}