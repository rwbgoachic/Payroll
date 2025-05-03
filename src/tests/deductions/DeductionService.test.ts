import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeductionService } from '../../services/deductionService';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [
              {
                id: '1',
                company_id: '1',
                name: '401(k)',
                description: 'Retirement plan contribution',
                type: 'pre_tax',
                calculation_method: 'percentage',
                default_amount: null,
                default_percentage: 5,
                max_annual_amount: 20500
              },
              {
                id: '2',
                company_id: '1',
                name: 'Health Insurance',
                description: 'Employee portion of health insurance',
                type: 'pre_tax',
                calculation_method: 'fixed',
                default_amount: 100,
                default_percentage: null,
                max_annual_amount: null
              }
            ],
            error: null
          })),
          is: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [
                {
                  id: '1',
                  employee_id: '1',
                  deduction_type_id: '1',
                  amount: 5,
                  frequency: 'per-paycheck',
                  start_date: '2025-01-01',
                  end_date: null,
                  deduction_type: {
                    id: '1',
                    company_id: '1',
                    name: '401(k)',
                    description: 'Retirement plan contribution',
                    type: 'pre_tax',
                    calculation_method: 'percentage',
                    default_amount: null,
                    default_percentage: 5,
                    max_annual_amount: 20500
                  }
                }
              ],
              error: null
            }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: '1',
              company_id: '1',
              name: '401(k)',
              description: 'Retirement plan contribution',
              type: 'pre_tax',
              calculation_method: 'percentage',
              default_amount: null,
              default_percentage: 5,
              max_annual_amount: 20500
            },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: '1',
                employee_id: '1',
                deduction_type_id: '1',
                amount: 5,
                frequency: 'per-paycheck',
                start_date: '2025-01-01',
                end_date: '2025-12-31',
                deduction_type: {
                  id: '1',
                  company_id: '1',
                  name: '401(k)',
                  description: 'Retirement plan contribution',
                  type: 'pre_tax',
                  calculation_method: 'percentage',
                  default_amount: null,
                  default_percentage: 5,
                  max_annual_amount: 20500
                }
              },
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}));

describe('DeductionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDeductionTypes', () => {
    it('retrieves deduction types for a company', async () => {
      const types = await DeductionService.getDeductionTypes('1');

      expect(types).toHaveLength(2);
      expect(types[0].name).toBe('401(k)');
      expect(types[1].name).toBe('Health Insurance');
    });
  });

  describe('createDeductionType', () => {
    it('creates a new deduction type', async () => {
      const newType = {
        company_id: '1',
        name: '401(k)',
        description: 'Retirement plan contribution',
        type: 'pre_tax' as const,
        calculation_method: 'percentage' as const,
        default_percentage: 5,
        max_annual_amount: 20500
      };

      const type = await DeductionService.createDeductionType(newType);

      expect(type.id).toBe('1');
      expect(type.name).toBe('401(k)');
      expect(type.calculation_method).toBe('percentage');
    });
  });

  describe('getActiveDeductions', () => {
    it('retrieves active deductions for an employee', async () => {
      const deductions = await DeductionService.getActiveDeductions('1');

      expect(deductions).toHaveLength(1);
      expect(deductions[0].deduction_type?.name).toBe('401(k)');
      expect(deductions[0].amount).toBe(5);
    });
  });

  describe('endDeduction', () => {
    it('ends an employee deduction', async () => {
      const deduction = await DeductionService.endDeduction('1', '2025-12-31');

      expect(deduction.end_date).toBe('2025-12-31');
    });
  });

  describe('calculateDeductionAmount', () => {
    it('calculates fixed amount deductions', () => {
      const deduction = {
        id: '1',
        employee_id: '1',
        deduction_type_id: '2',
        amount: 100,
        frequency: 'per-paycheck' as const,
        start_date: '2025-01-01',
        end_date: null,
        deduction_type: {
          id: '2',
          company_id: '1',
          name: 'Health Insurance',
          description: 'Employee portion of health insurance',
          type: 'pre_tax' as const,
          calculation_method: 'fixed' as const,
          default_amount: 100,
          default_percentage: null,
          max_annual_amount: null
        }
      };

      const amount = DeductionService.calculateDeductionAmount(deduction, 4000);
      expect(amount).toBe(100);
    });

    it('calculates percentage-based deductions', () => {
      const deduction = {
        id: '1',
        employee_id: '1',
        deduction_type_id: '1',
        amount: 5,
        frequency: 'per-paycheck' as const,
        start_date: '2025-01-01',
        end_date: null,
        deduction_type: {
          id: '1',
          company_id: '1',
          name: '401(k)',
          description: 'Retirement plan contribution',
          type: 'pre_tax' as const,
          calculation_method: 'percentage' as const,
          default_amount: null,
          default_percentage: 5,
          max_annual_amount: 20500
        }
      };

      const amount = DeductionService.calculateDeductionAmount(deduction, 4000);
      expect(amount).toBe(200); // 5% of 4000
    });

    it('adjusts for frequency', () => {
      const deduction = {
        id: '1',
        employee_id: '1',
        deduction_type_id: '2',
        amount: 100,
        frequency: 'monthly' as const,
        start_date: '2025-01-01',
        end_date: null,
        deduction_type: {
          id: '2',
          company_id: '1',
          name: 'Health Insurance',
          description: 'Employee portion of health insurance',
          type: 'pre_tax' as const,
          calculation_method: 'fixed' as const,
          default_amount: 100,
          default_percentage: null,
          max_annual_amount: null
        }
      };

      // For bi-weekly pay frequency
      const amount = DeductionService.calculateDeductionAmount(deduction, 4000, 'bi-weekly');
      expect(amount).toBeCloseTo(46.08, 2); // $100 / 2.17
    });
  });

  describe('calculateTotalDeductions', () => {
    it('calculates pre-tax and post-tax totals', () => {
      const deductions = [
        {
          id: '1',
          employee_id: '1',
          deduction_type_id: '1',
          amount: 5,
          frequency: 'per-paycheck' as const,
          start_date: '2025-01-01',
          end_date: null,
          deduction_type: {
            id: '1',
            company_id: '1',
            name: '401(k)',
            description: 'Retirement plan contribution',
            type: 'pre_tax' as const,
            calculation_method: 'percentage' as const,
            default_amount: null,
            default_percentage: 5,
            max_annual_amount: 20500
          }
        },
        {
          id: '2',
          employee_id: '1',
          deduction_type_id: '3',
          amount: 50,
          frequency: 'per-paycheck' as const,
          start_date: '2025-01-01',
          end_date: null,
          deduction_type: {
            id: '3',
            company_id: '1',
            name: 'Life Insurance',
            description: 'Supplemental life insurance',
            type: 'post_tax' as const,
            calculation_method: 'fixed' as const,
            default_amount: 50,
            default_percentage: null,
            max_annual_amount: null
          }
        }
      ];

      const result = DeductionService.calculateTotalDeductions(deductions, 4000);
      
      expect(result.preTaxTotal).toBe(200); // 5% of 4000
      expect(result.postTaxTotal).toBe(50);
      expect(result.total).toBe(250);
    });
  });
});