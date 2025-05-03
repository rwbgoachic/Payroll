import { supabase } from '../lib/supabase';

export interface Benefit {
  id: string;
  employee_id: string;
  type: 'health' | 'dental' | 'vision' | 'life' | 'disability' | 'retirement';
  plan_name: string;
  coverage_level: 'individual' | 'individual-plus-spouse' | 'family';
  start_date: string;
  end_date: string | null;
  status: 'pending' | 'active' | 'terminated';
  annual_cost: number;
  employee_contribution: number;
  employer_contribution: number;
}

export interface BenefitPlan {
  id: string;
  company_id: string;
  type: 'health' | 'dental' | 'vision' | 'life' | 'disability' | 'retirement';
  name: string;
  description: string | null;
  provider: string;
  plan_year: number;
  enrollment_start: string | null;
  enrollment_end: string | null;
  effective_date: string;
  termination_date: string | null;
  status: 'draft' | 'active' | 'inactive';
}

interface BenefitDeduction {
  id: string;
  benefit_id: string;
  payroll_period_id: string;
  amount: number;
  type: 'pre_tax' | 'post_tax';
}

export class BenefitsService {
  /**
   * Get all benefit plans for a company
   */
  static async getBenefitPlans(companyId: string): Promise<BenefitPlan[]> {
    const { data, error } = await supabase
      .from('benefit_plans')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('type', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a new benefit plan
   */
  static async createBenefitPlan(plan: Omit<BenefitPlan, 'id'>): Promise<BenefitPlan> {
    const { data, error } = await supabase
      .from('benefit_plans')
      .insert(plan)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get employee benefits
   */
  static async getEmployeeBenefits(employeeId: string): Promise<Benefit[]> {
    const { data, error } = await supabase
      .from('benefits')
      .select('*')
      .eq('employee_id', employeeId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Enroll employee in a benefit
   */
  static async enrollInBenefit(
    employeeId: string,
    type: Benefit['type'],
    planName: string,
    coverageLevel: Benefit['coverage_level'],
    startDate: string,
    annualCost: number,
    employeeContribution: number,
    employerContribution: number
  ): Promise<Benefit> {
    const { data, error } = await supabase
      .from('benefits')
      .insert({
        employee_id: employeeId,
        type,
        plan_name: planName,
        coverage_level: coverageLevel,
        start_date: startDate,
        status: 'active',
        annual_cost: annualCost,
        employee_contribution: employeeContribution,
        employer_contribution: employerContribution
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Terminate a benefit
   */
  static async terminateBenefit(
    benefitId: string,
    endDate: string
  ): Promise<Benefit> {
    const { data, error } = await supabase
      .from('benefits')
      .update({
        status: 'terminated',
        end_date: endDate
      })
      .eq('id', benefitId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Calculate benefit deductions for a payroll period
   */
  static async calculateBenefitDeductions(
    employeeId: string,
    payrollPeriodId: string
  ): Promise<BenefitDeduction[]> {
    // Get active benefits for employee
    const { data: benefits, error: benefitsError } = await supabase
      .from('benefits')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('status', 'active');

    if (benefitsError) throw benefitsError;
    if (!benefits?.length) return [];

    // Get payroll period details
    const { data: period, error: periodError } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('id', payrollPeriodId)
      .single();

    if (periodError) throw periodError;

    // Calculate per-period deductions
    const deductions: Omit<BenefitDeduction, 'id'>[] = benefits.map(benefit => {
      // Calculate per-paycheck amount (assuming bi-weekly)
      const amount = benefit.employee_contribution / 26;

      return {
        benefit_id: benefit.id,
        payroll_period_id: payrollPeriodId,
        amount,
        type: 'pre_tax' // Most benefits are pre-tax
      };
    });

    // Insert deductions
    const { data, error } = await supabase
      .from('benefit_deductions')
      .insert(deductions)
      .select();

    if (error) throw error;
    return data || [];
  }

  /**
   * Get benefit deductions for a payroll period
   */
  static async getBenefitDeductions(
    employeeId: string,
    payrollPeriodId: string
  ): Promise<BenefitDeduction[]> {
    const { data, error } = await supabase
      .from('benefit_deductions')
      .select(`
        *,
        benefit:benefits(
          id,
          type,
          plan_name,
          coverage_level
        )
      `)
      .eq('payroll_period_id', payrollPeriodId)
      .eq('benefit.employee_id', employeeId);

    if (error) throw error;
    return data || [];
  }
}