import { describe, it, expect } from 'vitest';
import { PayrollService } from '../../services/payrollService';

describe('PayrollCalculator', () => {
  describe('calculateRegularPay', () => {
    it('calculates salary correctly for bi-weekly period', () => {
      const employee = {
        salary_type: 'salary',
        salary_amount: 120000 // Annual salary
      };
      
      const period = {
        pay_frequency: 'bi-weekly'
      };

      const regularPay = PayrollService['calculateRegularPay'](employee, [], '2025-01-01', '2025-01-15');
      expect(regularPay).toBe(4615.38); // $120,000 / 26 periods
    });

    it('calculates hourly pay correctly', () => {
      const employee = {
        salary_type: 'hourly',
        salary_amount: 25 // Hourly rate
      };

      const timeEntries = [
        {
          date: '2025-01-01',
          start_time: '09:00:00',
          end_time: '17:00:00',
          break_duration: '00:30:00',
          status: 'approved'
        }
      ];

      const regularPay = PayrollService['calculateRegularPay'](employee, timeEntries, '2025-01-01', '2025-01-15');
      expect(regularPay).toBe(187.50); // 7.5 hours * $25
    });
  });

  describe('calculateOvertimePay', () => {
    it('calculates overtime for hourly employees', () => {
      const employee = {
        salary_type: 'hourly',
        salary_amount: 25 // Hourly rate
      };

      const timeEntries = [
        {
          date: '2025-01-01',
          start_time: '09:00:00',
          end_time: '19:00:00',
          break_duration: '00:30:00',
          status: 'approved'
        }
      ];

      const overtimePay = PayrollService['calculateOvertimePay'](employee, timeEntries, '2025-01-01', '2025-01-15');
      expect(overtimePay).toBe(37.50); // 1 overtime hour * ($25 * 1.5)
    });

    it('returns 0 overtime for salaried employees', () => {
      const employee = {
        salary_type: 'salary',
        salary_amount: 120000
      };

      const timeEntries = [
        {
          date: '2025-01-01',
          start_time: '09:00:00',
          end_time: '19:00:00',
          break_duration: '00:30:00',
          status: 'approved'
        }
      ];

      const overtimePay = PayrollService['calculateOvertimePay'](employee, timeEntries, '2025-01-01', '2025-01-15');
      expect(overtimePay).toBe(0);
    });
  });

  describe('calculateTaxes', () => {
    it('calculates federal tax using brackets', () => {
      const grossPay = 4000; // Bi-weekly pay
      const state = 'CA';

      const taxes = PayrollService['calculateTaxes'](grossPay, state);
      
      // Verify tax components
      expect(taxes.federal).toBeGreaterThan(0);
      expect(taxes.state).toBeGreaterThan(0);
      expect(taxes.social).toBe(Math.min(grossPay * 0.062, 9932.40));
      expect(taxes.medicare).toBe(grossPay * 0.0145);
      expect(taxes.total).toBe(
        taxes.federal + taxes.state + taxes.social + taxes.medicare
      );
    });

    it('applies social security wage base limit', () => {
      const grossPay = 200000; // Above wage base
      const state = 'CA';

      const taxes = PayrollService['calculateTaxes'](grossPay, state);
      expect(taxes.social).toBe(9932.40); // Max social security tax
    });
  });

  describe('calculateDeductions', () => {
    it('calculates fixed amount deductions', () => {
      const deductions = [
        {
          amount: 100,
          frequency: 'per-paycheck',
          deduction_type: {
            calculation_method: 'fixed'
          }
        }
      ];

      const grossPay = 4000;
      const period = { pay_frequency: 'bi-weekly' };

      const result = PayrollService['calculateDeductions'](deductions, grossPay, period);
      expect(result.total).toBe(100);
    });

    it('calculates percentage-based deductions', () => {
      const deductions = [
        {
          amount: 5, // 5%
          frequency: 'per-paycheck',
          deduction_type: {
            calculation_method: 'percentage'
          }
        }
      ];

      const grossPay = 4000;
      const period = { pay_frequency: 'bi-weekly' };

      const result = PayrollService['calculateDeductions'](deductions, grossPay, period);
      expect(result.total).toBe(200); // 5% of 4000
    });
  });
});