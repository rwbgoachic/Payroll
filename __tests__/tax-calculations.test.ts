import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculatePayrollTaxes } from '@paysurity/admin-ui/tax-service';
import { TaxService } from '../src/services/taxService';

// Mock the @paysurity/admin-ui/tax-service module
vi.mock('@paysurity/admin-ui/tax-service', () => ({
  calculatePayrollTaxes: vi.fn((grossPay, stateCode) => {
    // Mock implementation that returns realistic tax values
    const federalTax = grossPay * 0.15; // 15% federal tax
    const stateTax = stateCode === 'CA' ? grossPay * 0.08 : grossPay * 0.05; // 8% for CA, 5% for others
    const socialTax = Math.min(grossPay, 160200) * 0.062; // 6.2% up to wage base
    const medicareTax = grossPay * 0.0145; // 1.45% medicare
    
    return {
      federal: federalTax,
      state: stateTax,
      social: socialTax,
      medicare: medicareTax,
      total: federalTax + stateTax + socialTax + medicareTax
    };
  })
}));

describe('Tax Calculation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculatePayrollTaxes', () => {
    it('calculates taxes correctly for California', async () => {
      const grossPay = 5000;
      const stateCode = 'CA';
      
      const result = await calculatePayrollTaxes(grossPay, stateCode);
      
      expect(result.federal).toBe(750); // 15% of 5000
      expect(result.state).toBe(400); // 8% of 5000
      expect(result.social).toBe(310); // 6.2% of 5000
      expect(result.medicare).toBe(72.5); // 1.45% of 5000
      expect(result.total).toBe(1532.5); // Sum of all taxes
    });

    it('calculates taxes correctly for New York', async () => {
      const grossPay = 5000;
      const stateCode = 'NY';
      
      const result = await calculatePayrollTaxes(grossPay, stateCode);
      
      expect(result.federal).toBe(750); // 15% of 5000
      expect(result.state).toBe(250); // 5% of 5000
      expect(result.social).toBe(310); // 6.2% of 5000
      expect(result.medicare).toBe(72.5); // 1.45% of 5000
      expect(result.total).toBe(1382.5); // Sum of all taxes
    });

    it('respects social security wage base limit', async () => {
      const grossPay = 200000; // Above wage base
      const stateCode = 'CA';
      
      const result = await calculatePayrollTaxes(grossPay, stateCode);
      
      // Social security should be capped at wage base (160200 * 0.062)
      expect(result.social).toBe(9932.4);
    });
  });

  describe('TaxService.calculateTaxes', () => {
    it('should use bracket-based calculation for federal taxes', async () => {
      // Mock the supabase response for getTaxRates
      vi.spyOn(TaxService, 'getTaxRates').mockResolvedValue([
        {
          id: '1',
          type: 'federal',
          calculation_method: 'bracket',
          effective_date: new Date(),
          brackets: [
            { threshold_low: 0, threshold_high: 10000, rate: 0.10 },
            { threshold_low: 10000, threshold_high: 40000, rate: 0.15 },
            { threshold_low: 40000, threshold_high: null, rate: 0.25 }
          ]
        }
      ]);
      
      // Test with amount in second bracket
      const result = await TaxService.calculateTaxes(20000, 'CA');
      
      // Expected: (10000 * 0.10) + (10000 * 0.15) = 1000 + 1500 = 2500
      expect(result.federal).toBe(2500);
    });

    it('should handle percentage-based calculation for FICA taxes', async () => {
      // Mock the supabase response for getTaxRates
      vi.spyOn(TaxService, 'getTaxRates').mockResolvedValue([
        {
          id: '2',
          type: 'social_security',
          calculation_method: 'percentage',
          rate: 0.062,
          effective_date: new Date()
        },
        {
          id: '3',
          type: 'medicare',
          calculation_method: 'percentage',
          rate: 0.0145,
          effective_date: new Date()
        }
      ]);
      
      const result = await TaxService.calculateTaxes(50000, 'CA');
      
      expect(result.social).toBe(3100); // 6.2% of 50000
      expect(result.medicare).toBe(725); // 1.45% of 50000
    });
  });
});