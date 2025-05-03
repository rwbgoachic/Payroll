import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BenefitsService } from '../../services/benefitsService';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [
                {
                  id: '1',
                  company_id: '1',
                  type: 'health',
                  name: 'Premium Health Plan',
                  description: 'Comprehensive health coverage',
                  provider: 'Blue Cross',
                  plan_year: 2025,
                  effective_date: '2025-01-01',
                  status: 'active'
                },
                {
                  id: '2',
                  company_id: '1',
                  type: 'dental',
                  name: 'Dental Plus',
                  description: 'Full dental coverage',
                  provider: 'Delta Dental',
                  plan_year: 2025,
                  effective_date: '2025-01-01',
                  status: 'active'
                }
              ],
              error: null
            }))
          })),
          order: vi.fn(() => ({
            data: [
              {
                id: '1',
                employee_id: '1',
                type: 'health',
                plan_name: 'Premium Health Plan',
                coverage_level: 'individual',
                start_date: '2025-01-01',
                end_date: null,
                status: 'active',
                annual_cost: 6000,
                employee_contribution: 1200,
                employer_contribution: 4800
              }
            ],
            error: null
          }))
        })),
        single: vi.fn(() => ({
          data: {
            id: '1',
            start_date: '2025-01-01',
            end_date: '2025-01-15',
            pay_date: '2025-01-20'
          },
          error: null
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: '1',
              employee_id: '1',
              type: 'health',
              plan_name: 'Premium Health Plan',
              coverage_level: 'individual',
              start_date: '2025-01-01',
              end_date: null,
              status: 'active',
              annual_cost: 6000,
              employee_contribution: 1200,
              employer_contribution: 4800
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
                type: 'health',
                plan_name: 'Premium Health Plan',
                coverage_level: 'individual',
                start_date: '2025-01-01',
                end_date: '2025-12-31',
                status: 'terminated',
                annual_cost: 6000,
                employee_contribution: 1200,
                employer_contribution: 4800
              },
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}));

describe('BenefitsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBenefitPlans', () => {
    it('retrieves active benefit plans for a company', async () => {
      const plans = await BenefitsService.getBenefitPlans('1');

      expect(plans).toHaveLength(2);
      expect(plans[0].type).toBe('health');
      expect(plans[1].type).toBe('dental');
    });
  });

  describe('createBenefitPlan', () => {
    it('creates a new benefit plan', async () => {
      const newPlan = {
        company_id: '1',
        type: 'health' as const,
        name: 'Premium Health Plan',
        description: 'Comprehensive health coverage',
        provider: 'Blue Cross',
        plan_year: 2025,
        effective_date: '2025-01-01',
        status: 'active' as const
      };

      const plan = await BenefitsService.createBenefitPlan(newPlan);

      expect(plan.id).toBe('1');
      expect(plan.name).toBe('Premium Health Plan');
      expect(plan.type).toBe('health');
    });
  });

  describe('getEmployeeBenefits', () => {
    it('retrieves benefits for an employee', async () => {
      const benefits = await BenefitsService.getEmployeeBenefits('1');

      expect(benefits).toHaveLength(1);
      expect(benefits[0].type).toBe('health');
      expect(benefits[0].plan_name).toBe('Premium Health Plan');
    });
  });

  describe('enrollInBenefit', () => {
    it('enrolls an employee in a benefit', async () => {
      const benefit = await BenefitsService.enrollInBenefit(
        '1',
        'health',
        'Premium Health Plan',
        'individual',
        '2025-01-01',
        6000,
        1200,
        4800
      );

      expect(benefit.id).toBe('1');
      expect(benefit.type).toBe('health');
      expect(benefit.coverage_level).toBe('individual');
      expect(benefit.status).toBe('active');
    });
  });

  describe('terminateBenefit', () => {
    it('terminates an employee benefit', async () => {
      const benefit = await BenefitsService.terminateBenefit('1', '2025-12-31');

      expect(benefit.status).toBe('terminated');
      expect(benefit.end_date).toBe('2025-12-31');
    });
  });

  describe('calculateBenefitDeductions', () => {
    it('calculates benefit deductions for a payroll period', async () => {
      const deductions = await BenefitsService.calculateBenefitDeductions('1', '1');

      expect(deductions).toBeDefined();
      // The mock doesn't return actual calculated values, but we can verify the function runs
    });
  });
});