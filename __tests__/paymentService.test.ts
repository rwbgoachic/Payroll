import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentService } from '../src/services/paymentService';
import { supabase } from '../src/lib/supabase';

// Mock the supabase client
vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: 'payment-method-1',
                type: 'credit-card',
                details: { last4: '4242' },
                is_default: true
              },
              error: null
            }))
          })),
          single: vi.fn(() => ({
            data: {
              id: 'payment-method-1',
              type: 'credit-card',
              details: { last4: '4242' },
              is_default: true
            },
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              transaction_id: 'TX-123456',
              status: 'approved'
            },
            error: null
          }))
        }))
      }))
    }))
  }
}));

describe('Payment Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should process a payment successfully', async () => {
      const result = await PaymentService.processPayment('customer-1', 100);
      
      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('TX-123456');
      
      // Verify Supabase calls
      expect(supabase.from).toHaveBeenCalledWith('helcim_payment_methods');
      expect(supabase.from).toHaveBeenCalledWith('helcim_transactions');
    });

    it('should use the specified payment method if provided', async () => {
      await PaymentService.processPayment('customer-1', 100, 'USD', 'payment-method-2');
      
      // Verify it called getPaymentMethod with the specified ID
      expect(supabase.from().select().eq).toHaveBeenCalledWith('id', 'payment-method-2');
    });

    it('should handle payment processing errors gracefully', async () => {
      // Mock a failure in the payment processing
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  id: 'payment-method-1',
                  type: 'credit-card',
                  details: { last4: '4242' },
                  is_default: true
                },
                error: null
              }))
            })),
            single: vi.fn(() => ({
              data: {
                id: 'payment-method-1',
                type: 'credit-card',
                details: { last4: '4242' },
                is_default: true
              },
              error: null
            }))
          }))
        }))
      } as any));

      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: new Error('Payment processing failed')
            }))
          }))
        }))
      } as any));
      
      const result = await PaymentService.processPayment('customer-1', 100);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment processing failed');
    });
  });

  describe('getPaymentMethod', () => {
    it('should return a payment method by ID', async () => {
      const method = await PaymentService.getPaymentMethod('payment-method-1');
      
      expect(method).toEqual({
        id: 'payment-method-1',
        type: 'credit-card',
        details: { last4: '4242' },
        is_default: true
      });
    });

    it('should return null if payment method is not found', async () => {
      // Mock a failure in getting the payment method
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: new Error('Payment method not found')
            }))
          }))
        }))
      } as any));
      
      const method = await PaymentService.getPaymentMethod('non-existent');
      
      expect(method).toBeNull();
    });
  });

  describe('getDefaultPaymentMethod', () => {
    it('should return the default payment method for a customer', async () => {
      const method = await PaymentService.getDefaultPaymentMethod('customer-1');
      
      expect(method).toEqual({
        id: 'payment-method-1',
        type: 'credit-card',
        details: { last4: '4242' },
        is_default: true
      });
      
      // Verify it queried for the default payment method
      expect(supabase.from().select().eq).toHaveBeenCalledWith('customer_id', 'customer-1');
      expect(supabase.from().select().eq().eq).toHaveBeenCalledWith('is_default', true);
    });

    it('should return null if no default payment method is found', async () => {
      // Mock a failure in getting the default payment method
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: new Error('No default payment method found')
              }))
            }))
          }))
        }))
      } as any));
      
      const method = await PaymentService.getDefaultPaymentMethod('customer-1');
      
      expect(method).toBeNull();
    });
  });

  describe('circuit breaker state', () => {
    it('should expose circuit breaker states', () => {
      expect(PaymentService.getPaymentCircuitBreakerState()).toBe('closed');
      expect(PaymentService.getMethodsCircuitBreakerState()).toBe('closed');
    });

    it('should allow resetting circuit breakers', () => {
      // These methods should not throw
      expect(() => PaymentService.resetPaymentCircuitBreaker()).not.toThrow();
      expect(() => PaymentService.resetMethodsCircuitBreaker()).not.toThrow();
    });
  });
});