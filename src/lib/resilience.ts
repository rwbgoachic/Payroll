/**
 * Circuit Breaker implementation for handling service failures gracefully
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private readonly maxFailures: number;
  private readonly resetTimeoutMs: number;
  private readonly halfOpenAfterMs: number;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private onStateChange?: (state: 'closed' | 'open' | 'half-open') => void;

  /**
   * Create a new CircuitBreaker
   * @param maxFailures Number of failures before opening the circuit
   * @param resetTimeoutMs Time in ms before resetting failure count
   * @param halfOpenAfterMs Time in ms before trying again (half-open state)
   */
  constructor(
    maxFailures = 5,
    resetTimeoutMs = 60000,
    halfOpenAfterMs = 30000
  ) {
    this.maxFailures = maxFailures;
    this.resetTimeoutMs = resetTimeoutMs;
    this.halfOpenAfterMs = halfOpenAfterMs;
  }

  /**
   * Set a callback to be notified of state changes
   * @param callback Function to call when state changes
   */
  public onStateChangeCallback(callback: (state: 'closed' | 'open' | 'half-open') => void): void {
    this.onStateChange = callback;
  }

  /**
   * Execute a function with circuit breaker protection
   * @param fn Function to execute
   * @returns Result of the function
   * @throws Error if circuit is open or function fails
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      // Check if we should try again (half-open)
      if (this.lastFailureTime && Date.now() - this.lastFailureTime >= this.halfOpenAfterMs) {
        this.setState('half-open');
      } else {
        throw new Error('Service unavailable: circuit breaker is open');
      }
    }

    try {
      // Execute the function
      const result = await fn();

      // If we're in half-open state and the call succeeded, close the circuit
      if (this.state === 'half-open') {
        this.reset();
      }

      return result;
    } catch (error) {
      // Record the failure
      this.recordFailure();

      // Check if we should open the circuit
      if (this.failures >= this.maxFailures && this.state !== 'open') {
        this.setState('open');
      }

      // Re-throw the error
      throw error;
    }
  }

  /**
   * Reset the circuit breaker
   */
  public reset(): void {
    this.failures = 0;
    this.lastFailureTime = null;
    this.setState('closed');
  }

  /**
   * Get the current state of the circuit breaker
   */
  public getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }

  /**
   * Get the number of consecutive failures
   */
  public getFailureCount(): number {
    return this.failures;
  }

  /**
   * Record a failure
   */
  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    // Reset failure count after timeout
    setTimeout(() => {
      if (this.lastFailureTime && Date.now() - this.lastFailureTime >= this.resetTimeoutMs) {
        this.failures = 0;
      }
    }, this.resetTimeoutMs);
  }

  /**
   * Set the circuit state and notify listeners
   */
  private setState(state: 'closed' | 'open' | 'half-open'): void {
    if (this.state !== state) {
      this.state = state;
      if (this.onStateChange) {
        this.onStateChange(state);
      }
    }
  }
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param baseDelayMs Base delay in milliseconds
 * @returns Result of the function
 * @throws Error if all retries fail
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        // Calculate exponential backoff delay
        const delay = baseDelayMs * Math.pow(2, attempt);
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.3 * delay;
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
      }
    }
  }

  throw lastError || new Error('All retries failed');
}

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

  return { circuitBreaker, state };
}