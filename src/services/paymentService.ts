import { supabase } from '../lib/supabase';
import { CircuitBreaker, retry } from '../lib/resilience';

interface PaymentMethod {
  id: string;
  type: 'credit-card' | 'ach' | 'crypto' | 'digital-wallet';
  details: any;
  isDefault: boolean;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export class PaymentService {
  // Create circuit breakers for critical operations
  private static paymentCircuitBreaker = new CircuitBreaker(3, 120000, 60000);
  private static methodsCircuitBreaker = new CircuitBreaker(5, 60000, 30000);

  /**
   * Process a payment
   * @param customerId The customer ID
   * @param amount The payment amount
   * @param currency The currency code (default: USD)
   * @param paymentMethodId Optional payment method ID (uses default if not provided)
   * @param description Optional payment description
   * @returns A promise that resolves to the payment result
   */
  static async processPayment(
    customerId: string,
    amount: number,
    currency: string = 'USD',
    paymentMethodId?: string,
    description?: string
  ): Promise<PaymentResult> {
    try {
      // Use circuit breaker to protect against API failures
      return await this.paymentCircuitBreaker.execute(async () => {
        // Get the payment method
        const method = paymentMethodId
          ? await this.getPaymentMethod(paymentMethodId)
          : await this.getDefaultPaymentMethod(customerId);

        if (!method) {
          throw new Error('No payment method available');
        }

        // Process the payment based on the method type
        const { data, error } = await supabase
          .from('helcim_transactions')
          .insert({
            transaction_id: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            customer_id: customerId,
            payment_method_id: method.id,
            amount,
            currency,
            status: 'approved', // In a real implementation, this would come from the payment gateway
            message: description || 'Payment processed',
            metadata: {
              description,
              processed_at: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return {
          success: true,
          transactionId: data.transaction_id
        };
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown payment processing error'
      };
    }
  }

  /**
   * Get a payment method by ID
   * @param methodId The payment method ID
   * @returns A promise that resolves to the payment method
   */
  static async getPaymentMethod(methodId: string): Promise<PaymentMethod | null> {
    try {
      // Use circuit breaker to protect against API failures
      return await this.methodsCircuitBreaker.execute(async () => {
        const { data, error } = await supabase
          .from('helcim_payment_methods')
          .select('*')
          .eq('id', methodId)
          .single();

        if (error) {
          throw error;
        }

        return data;
      });
    } catch (error) {
      console.error('Error getting payment method:', error);
      return null;
    }
  }

  /**
   * Get the default payment method for a customer
   * @param customerId The customer ID
   * @returns A promise that resolves to the default payment method
   */
  static async getDefaultPaymentMethod(customerId: string): Promise<PaymentMethod | null> {
    try {
      // Use retry with exponential backoff for critical operations
      return await retry(async () => {
        const { data, error } = await supabase
          .from('helcim_payment_methods')
          .select('*')
          .eq('customer_id', customerId)
          .eq('is_default', true)
          .single();

        if (error) {
          throw error;
        }

        return data;
      }, 3, 1000);
    } catch (error) {
      console.error('Error getting default payment method:', error);
      return null;
    }
  }

  /**
   * Get the payment circuit breaker state
   */
  static getPaymentCircuitBreakerState(): 'closed' | 'open' | 'half-open' {
    return this.paymentCircuitBreaker.getState();
  }

  /**
   * Reset the payment circuit breaker
   */
  static resetPaymentCircuitBreaker(): void {
    this.paymentCircuitBreaker.reset();
  }

  /**
   * Get the methods circuit breaker state
   */
  static getMethodsCircuitBreakerState(): 'closed' | 'open' | 'half-open' {
    return this.methodsCircuitBreaker.getState();
  }

  /**
   * Reset the methods circuit breaker
   */
  static resetMethodsCircuitBreaker(): void {
    this.methodsCircuitBreaker.reset();
  }
}