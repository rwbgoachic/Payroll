import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PayrollService } from '../../services/payrollService';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: '1',
              company_id: '1',
              start_date: '2025-01-01',
              end_date: '2025-01-15',
              pay_date: '2025-01-20',
              status: 'pending'
            },
            error: null
          }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: '1',
              company: { id: '1', state: 'CA' },
              employees: [
                {
                  id: '1',
                  salary_type: 'salary',
                  salary_amount: 120000,
                  state: 'CA'
                },
                {
                  id: '2',
                  salary_type: 'hourly',
                  salary_amount: 25,
                  state: 'CA'
                }
              ]
            },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null }))
      }))
    }))
  }
}));

describe('PayrollService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPayrollPeriod', () => {
    it('creates a new payroll period', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-15');
      const payDate = new Date('2025-01-20');

      const period = await PayrollService.createPayrollPeriod(
        '1',
        startDate,
        endDate,
        payDate
      );

      expect(period).toEqual({
        id: '1',
        company_id: '1',
        start_date: '2025-01-01',
        end_date: '2025-01-15',
        pay_date: '2025-01-20',
        status: 'pending'
      });
    });
  });

  describe('calculatePayroll', () => {
    it('calculates payroll for all employees', async () => {
      const run = await PayrollService.calculatePayroll('1');

      expect(run).toBeDefined();
      expect(run.status).toBe('completed');
      expect(run.total_gross_pay).toBeGreaterThan(0);
      expect(run.total_taxes).toBeGreaterThan(0);
      expect(run.total_net_pay).toBeGreaterThan(0);
    });

    it('handles different employee types correctly', async () => {
      const run = await PayrollService.calculatePayroll('1');

      // Verify calculations for both salary and hourly employees
      expect(run.total_gross_pay).toBeGreaterThan(0);
      expect(run.total_taxes).toBeGreaterThan(0);
      expect(run.total_deductions).toBeGreaterThanOrEqual(0);
      expect(run.total_net_pay).toBeGreaterThan(0);
    });
  });

  describe('calculateRegularPay', () => {
    it('calculates salary correctly', () => {
      const employee = {
        salary_type: 'salary',
        salary_amount: 120000
      };

      const regularPay = PayrollService['calculateRegularPay'](
        employee,
        [],
        '2025-01-01',
        '2025-01-15'
      );

      expect(regularPay).toBe(4615.38); // $120,000 / 26
    });

    it('calculates hourly pay correctly', () => {
      const employee = {
        salary_type: 'hourly',
        salary_amount: 25
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

      const regularPay = PayrollService['calculateRegularPay'](
        employee,
        timeEntries,
        '2025-01-01',
        '2025-01-15'
      );

      expect(regularPay).toBe(187.50); // 7.5 hours * $25
    });
  });

  describe('calculateOvertimePay', () => {
    it('calculates overtime for hourly employees', () => {
      const employee = {
        salary_type: 'hourly',
        salary_amount: 25
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

      const overtimePay = PayrollService['calculateOvertimePay'](
        employee,
        timeEntries,
        '2025-01-01',
        '2025-01-15'
      );

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

      const overtimePay = PayrollService['calculateOvertimePay'](
        employee,
        timeEntries,
        '2025-01-01',
        '2025-01-15'
      );

      expect(overtimePay).toBe(0);
    });
  });

  describe('calculateHours', () => {
    it('calculates hours correctly with break', () => {
      const entry = {
        start_time: '09:00:00',
        end_time: '17:00:00',
        break_duration: '00:30:00'
      };

      const hours = PayrollService['calculateHours'](entry);
      expect(hours).toBe(7.5); // 8 hours - 30 minutes break
    });

    it('returns 0 for incomplete entries', () => {
      const entry = {
        start_time: '09:00:00',
        end_time: null,
        break_duration: '00:00:00'
      };

      const hours = PayrollService['calculateHours'](entry);
      expect(hours).toBe(0);
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

      const total = PayrollService['calculateDeductions'](deductions, 4000);
      expect(total).toBe(100);
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

      const total = PayrollService['calculateDeductions'](deductions, 4000);
      expect(total).toBe(200); // 5% of 4000
    });

    it('handles multiple deductions', () => {
      const deductions = [
        {
          amount: 100,
          frequency: 'per-paycheck',
          deduction_type: {
            calculation_method: 'fixed'
          }
        },
        {
          amount: 5,
          frequency: 'per-paycheck',
          deduction_type: {
            calculation_method: 'percentage'
          }
        }
      ];

      const total = PayrollService['calculateDeductions'](deductions, 4000);
      expect(total).toBe(300); // 100 + (5% of 4000)
    });
  });
});