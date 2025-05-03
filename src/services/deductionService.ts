import { supabase } from '../lib/supabase';

interface DeductionType {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  type: 'pre_tax' | 'post_tax';
  calculation_method: 'fixed' | 'percentage';
  default_amount: number | null;
  default_percentage: number | null;
  max_annual_amount: number | null;
}

interface Deduction {
  id: string;
  employee_id: string;
  deduction_type_id: string;
  amount: number;
  frequency: 'per-paycheck' | 'monthly' | 'annual';
  start_date: string;
  end_date: string | null;
  deduction_type?: DeductionType;
}

export class DeductionService {
  /**
   * Get all deduction types for a company
   */
  static async getDeductionTypes(companyId: string): Promise<DeductionType[]> {
    const { data, error } = await supabase
      .from('deduction_types')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get employee deductions
   */
  static async getEmployeeDeductions(employeeId: string): Promise<Deduction[]> {
    const { data, error } = await supabase
      .from('deductions')
      .select(`
        *,
        deduction_type:deduction_types(*)
      `)
      .eq('employee_id', employeeId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get active employee deductions
   */
  static async getActiveDeductions(employeeId: string): Promise<Deduction[]> {
    const { data, error } = await supabase
      .from('deductions')
      .select(`
        *,
        deduction_type:deduction_types(*)
      `)
      .eq('employee_id', employeeId)
      .is('end_date', null)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Calculate deduction amount for a pay period
   */
  static calculateDeductionAmount(
    deduction: Deduction,
    grossPay: number,
    payFrequency: string = 'bi-weekly'
  ): number {
    if (!deduction.deduction_type) {
      throw new Error('Deduction type information is required');
    }

    // Calculate base amount
    let amount: number;
    if (deduction.deduction_type.calculation_method === 'percentage') {
      amount = grossPay * (deduction.amount / 100);
    } else {
      amount = deduction.amount;
    }

    // Adjust for frequency
    switch (deduction.frequency) {
      case 'per-paycheck':
        return amount;
      case 'monthly':
        // Convert monthly to per-paycheck
        switch (payFrequency) {
          case 'weekly':
            return amount / 4.33; // Average weeks per month
          case 'bi-weekly':
            return amount / 2.17; // Average bi-weeks per month
          case 'semi-monthly':
            return amount / 2; // Exactly 2 pay periods per month
          case 'monthly':
            return amount;
          default:
            return amount / 2.17; // Default to bi-weekly
        }
      case 'annual':
        // Convert annual to per-paycheck
        switch (payFrequency) {
          case 'weekly':
            return amount / 52;
          case 'bi-weekly':
            return amount / 26;
          case 'semi-monthly':
            return amount / 24;
          case 'monthly':
            return amount / 12;
          default:
            return amount / 26; // Default to bi-weekly
        }
      default:
        return amount;
    }
  }

  /**
   * Calculate total deductions for a pay period
   */
  static calculateTotalDeductions(
    deductions: Deduction[],
    grossPay: number,
    payFrequency: string = 'bi-weekly'
  ): {
    preTaxTotal: number;
    postTaxTotal: number;
    total: number;
  } {
    let preTaxTotal = 0;
    let postTaxTotal = 0;

    deductions.forEach(deduction => {
      if (!deduction.deduction_type) return;

      const amount = this.calculateDeductionAmount(deduction, grossPay, payFrequency);
      
      if (deduction.deduction_type.type === 'pre_tax') {
        preTaxTotal += amount;
      } else {
        postTaxTotal += amount;
      }
    });

    return {
      preTaxTotal,
      postTaxTotal,
      total: preTaxTotal + postTaxTotal
    };
  }

  /**
   * Add a deduction for an employee
   */
  static async addDeduction(deduction: Omit<Deduction, 'id' | 'deduction_type'>): Promise<Deduction> {
    const { data, error } = await supabase
      .from('deductions')
      .insert(deduction)
      .select(`
        *,
        deduction_type:deduction_types(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * End a deduction
   */
  static async endDeduction(id: string, endDate: string): Promise<Deduction> {
    const { data, error } = await supabase
      .from('deductions')
      .update({ end_date: endDate })
      .eq('id', id)
      .select(`
        *,
        deduction_type:deduction_types(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }
}