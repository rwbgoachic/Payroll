import { describe, it, expect } from 'vitest';
import { TaxService } from '../../services/taxService';

describe('TaxCalculator', () => {
  describe('calculateTaxWithBrackets', () => {
    it('calculates tax correctly for each bracket', () => {
      const brackets = [
        { threshold_low: 0, threshold_high: 10000, rate: 0.10 },
        { threshold_low: 10000, threshold_high: 40000, rate: 0.20 },
        { threshold_low: 40000, threshold_high: null, rate: 0.30 }
      ];

      // Test first bracket
      expect(TaxService['calculateTaxWithBrackets'](5000, brackets))
        .toBe(500); // 5000 * 0.10

      // Test second bracket
      expect(TaxService['calculateTaxWithBrackets'](20000, brackets))
        .toBe(3000); // (10000 * 0.10) + (10000 * 0.20)

      // Test highest bracket
      expect(TaxService['calculateTaxWithBrackets'](50000, brackets))
        .toBe(11000); // (10000 * 0.10) + (30000 * 0.20) + (10000 * 0.30)
    });

    it('handles edge cases', () => {
      const brackets = [
        { threshold_low: 0, threshold_high: 10000, rate: 0.10 },
        { threshold_low: 10000, threshold_high: null, rate: 0.20 }
      ];

      // Test zero income
      expect(TaxService['calculateTaxWithBrackets'](0, brackets)).toBe(0);

      // Test bracket boundary
      expect(TaxService['calculateTaxWithBrackets'](10000, brackets))
        .toBe(1000); // 10000 * 0.10

      // Test negative income
      expect(TaxService['calculateTaxWithBrackets'](-1000, brackets)).toBe(0);
    });
  });

  describe('calculateTax', () => {
    it('calculates flat tax correctly', () => {
      const taxRate = {
        id: '1',
        type: 'test',
        calculation_method: 'flat',
        flat_amount: 1000,
        jurisdiction: 'US',
        authority: 'TEST',
        effective_date: new Date()
      };

      expect(TaxService.calculateTax(50000, taxRate)).toBe(1000);
    });

    it('calculates percentage tax correctly', () => {
      const taxRate = {
        id: '1',
        type: 'test',
        calculation_method: 'percentage',
        rate: 0.10,
        jurisdiction: 'US',
        authority: 'TEST',
        effective_date: new Date()
      };

      expect(TaxService.calculateTax(50000, taxRate)).toBe(5000);
    });

    it('calculates bracketed tax correctly', () => {
      const taxRate = {
        id: '1',
        type: 'test',
        calculation_method: 'bracket',
        jurisdiction: 'US',
        authority: 'TEST',
        effective_date: new Date(),
        brackets: [
          { id: '1', tax_rate_id: '1', threshold_low: 0, threshold_high: 10000, rate: 0.10 },
          { id: '2', tax_rate_id: '1', threshold_low: 10000, threshold_high: null, rate: 0.20 }
        ]
      };

      expect(TaxService.calculateTax(15000, taxRate)).toBe(2000); // (10000 * 0.10) + (5000 * 0.20)
    });
  });

  describe('getTaxRates', () => {
    it('returns rates for the correct date', async () => {
      const date = new Date('2025-01-01');
      const rates = await TaxService.getTaxRates(date);

      expect(rates.length).toBeGreaterThan(0);
      rates.forEach(rate => {
        expect(new Date(rate.effective_date)).toBeLessThanOrEqual(date);
        if (rate.expiration_date) {
          expect(new Date(rate.expiration_date)).toBeGreaterThan(date);
        }
      });
    });
  });

  describe('calculateTaxes', () => {
    it('calculates all applicable taxes', async () => {
      const amount = 50000;
      const state = 'CA';

      const taxes = await TaxService.calculateTaxes(amount, state);

      expect(taxes.federal).toBeGreaterThan(0);
      expect(taxes.state).toBeGreaterThan(0);
      expect(taxes.social).toBeLessThanOrEqual(amount * 0.062);
      expect(taxes.medicare).toBe(amount * 0.0145);
      expect(taxes.total).toBe(
        taxes.federal + taxes.state + taxes.social + taxes.medicare
      );
    });
  });
});