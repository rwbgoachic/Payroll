import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaxService } from '../services/taxService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        lte: vi.fn(() => ({
          gt: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [
                {
                  id: '1',
                  type: 'federal',
                  calculation_method: 'bracket',
                  brackets: [
                    { threshold_low: 0, threshold_high: 10000, rate: 0.10 },
                    { threshold_low: 10000, threshold_high: 50000, rate: 0.20 },
                    { threshold_low: 50000, threshold_high: null, rate: 0.30 }
                  ]
                }
              ],
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}));

describe('TaxService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateTax', () => {
    it('calculates flat tax correctly', () => {
      const tax = TaxService.calculateTax(1000, {
        id: '1',
        type: 'test',
        calculation_method: 'flat',
        flat_amount: 100,
        jurisdiction: 'US',
        authority: 'TEST',
        effective_date: new Date()
      });
      expect(tax).toBe(100);
    });

    it('calculates percentage tax correctly', () => {
      const tax = TaxService.calculateTax(1000, {
        id: '1',
        type: 'test',
        calculation_method: 'percentage',
        rate: 0.1,
        jurisdiction: 'US',
        authority: 'TEST',
        effective_date: new Date()
      });
      expect(tax).toBe(100);
    });

    it('calculates bracketed tax correctly', () => {
      const tax = TaxService.calculateTax(75000, {
        id: '1',
        type: 'test',
        calculation_method: 'bracket',
        jurisdiction: 'US',
        authority: 'TEST',
        effective_date: new Date(),
        brackets: [
          { id: '1', tax_rate_id: '1', threshold_low: 0, threshold_high: 10000, rate: 0.10 },
          { id: '2', tax_rate_id: '1', threshold_low: 10000, threshold_high: 50000, rate: 0.20 },
          { id: '3', tax_rate_id: '1', threshold_low: 50000, threshold_high: null, rate: 0.30 }
        ]
      });
      expect(tax).toBe(1000 + 8000 + 7500); // (10000 * 0.1) + (40000 * 0.2) + (25000 * 0.3)
    });
  });

  describe('getTaxRates', () => {
    it('fetches tax rates successfully', async () => {
      const rates = await TaxService.getTaxRates();
      expect(rates).toHaveLength(1);
      expect(rates[0].type).toBe('federal');
    });
  });

  describe('calculateTaxes', () => {
    it('calculates all applicable taxes', async () => {
      const taxes = await TaxService.calculateTaxes(50000, 'CA');
      expect(taxes).toHaveProperty('federal');
      expect(taxes).toHaveProperty('state');
      expect(taxes).toHaveProperty('local');
      expect(taxes).toHaveProperty('total');
    });
  });
});