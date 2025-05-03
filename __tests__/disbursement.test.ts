import { describe, it, expect, beforeEach, vi } from 'vitest';
import { processDisbursement, getDisbursementStatus } from '../src/services/disbursement';
import { supabase } from '../src/lib/supabase';

// Mock the supabase client
vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: '1',
              company_id: '1',
              balance: 10000,
              currency: 'USD',
              updated_at: new Date().toISOString()
            },
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              transaction_id: 'ACH-123456',
              status: 'approved'
            },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: { success: true },
          error: null
        }))
      }))
    })),
    rpc: vi.fn(() => ({
      data: { transaction_id: 'WALLET-123456' },
      error: null
    }))
  }
}));

describe('Disbursement Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processDisbursement', () => {
    it('should use wallet transfer when balance is sufficient', async () => {
      // Setup mock to return a wallet with sufficient balance
      const fromSpy = vi.spyOn(supabase, 'from');
      const rpcSpy = vi.spyOn(supabase, 'rpc');
      
      const result = await processDisbursement('1', '1', 5000);
      
      expect(fromSpy).toHaveBeenCalledWith('employer_wallets');
      expect(rpcSpy).toHaveBeenCalledWith('transfer_funds', {
        p_from_wallet_id: '1',
        p_employee_id: '1',
        p_amount: 5000
      });
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('wallet');
      expect(result.transactionId).toBe('WALLET-123456');
    });

    it('should use ACH transfer when wallet balance is insufficient', async () => {
      // Setup mock to return a wallet with insufficient balance
      vi.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: '1',
                company_id: '1',
                balance: 1000, // Less than needed
                currency: 'USD',
                updated_at: new Date().toISOString()
              },
              error: null
            }))
          }))
        }))
      } as any));
      
      const result = await processDisbursement('1', '1', 5000);
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('ach');
      expect(result.transactionId).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      // Setup mock to throw an error
      vi.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: new Error('Database error')
            }))
          }))
        }))
      } as any));
      
      const result = await processDisbursement('1', '1', 5000);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getDisbursementStatus', () => {
    it('should return the correct status for a completed transaction', async () => {
      // Setup mock to return a completed transaction
      vi.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                transaction_id: 'ACH-123456',
                status: 'approved',
                amount: 5000,
                currency: 'USD'
              },
              error: null
            }))
          }))
        }))
      } as any));
      
      const result = await getDisbursementStatus('ACH-123456');
      
      expect(result.status).toBe('completed');
      expect(result.details).toBeDefined();
    });

    it('should return the correct status for a pending transaction', async () => {
      // Setup mock to return a pending transaction
      vi.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                transaction_id: 'ACH-123456',
                status: 'pending',
                amount: 5000,
                currency: 'USD'
              },
              error: null
            }))
          }))
        }))
      } as any));
      
      const result = await getDisbursementStatus('ACH-123456');
      
      expect(result.status).toBe('pending');
      expect(result.details).toBeDefined();
    });

    it('should return the correct status for a failed transaction', async () => {
      // Setup mock to return a failed transaction
      vi.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                transaction_id: 'ACH-123456',
                status: 'declined',
                amount: 5000,
                currency: 'USD'
              },
              error: null
            }))
          }))
        }))
      } as any));
      
      const result = await getDisbursementStatus('ACH-123456');
      
      expect(result.status).toBe('failed');
      expect(result.details).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      // Setup mock to throw an error
      vi.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: new Error('Database error')
            }))
          }))
        }))
      } as any));
      
      const result = await getDisbursementStatus('ACH-123456');
      
      expect(result.status).toBe('failed');
      expect(result.details.error).toBeDefined();
    });
  });
});