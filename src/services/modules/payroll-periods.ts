import { supabase } from '../../lib/supabase';
import { calculatePayPeriods } from '../../lib/core';

/**
 * Create a new payroll period
 * @param companyId Company ID
 * @param startDate Start date
 * @param endDate End date
 * @param payDate Pay date
 * @returns Created payroll period
 */
export async function createPayrollPeriod(
  companyId: string,
  startDate: Date,
  endDate: Date,
  payDate: Date
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('payroll_periods')
      .insert({
        company_id: companyId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        pay_date: payDate.toISOString().split('T')[0],
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payroll period:', error);
    throw error;
  }
}

/**
 * Get pending payroll periods for a company
 * @param companyId Company ID
 * @returns Array of pending payroll periods
 */
export async function getPendingPayrollPeriods(companyId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'pending')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting pending payroll periods:', error);
    throw error;
  }
}

/**
 * Get all payroll periods for a company
 * @param companyId Company ID
 * @param limit Number of records to return
 * @param offset Offset for pagination
 * @returns Array of payroll periods
 */
export async function getPayrollPeriods(
  companyId: string,
  limit: number = 10,
  offset: number = 0
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('company_id', companyId)
      .order('start_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting payroll periods:', error);
    throw error;
  }
}

/**
 * Generate payroll periods for a company based on frequency
 * @param companyId Company ID
 * @param frequency Pay frequency
 * @param startDate Reference start date
 * @param count Number of periods to generate
 * @returns Array of created payroll periods
 */
export async function generatePayrollPeriods(
  companyId: string,
  frequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly',
  startDate: Date = new Date(),
  count: number = 12
): Promise<any[]> {
  try {
    // Get company details to check if periods already exist
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;

    // Calculate periods
    const periods = calculatePayPeriods(frequency, startDate, count);

    // Check for existing periods to avoid duplicates
    const { data: existingPeriods, error: periodsError } = await supabase
      .from('payroll_periods')
      .select('start_date, end_date')
      .eq('company_id', companyId);

    if (periodsError) throw periodsError;

    // Filter out periods that already exist
    const existingDates = new Set(existingPeriods?.map(p => p.start_date) || []);
    const newPeriods = periods.filter(p => 
      !existingDates.has(p.startDate.toISOString().split('T')[0])
    );

    if (newPeriods.length === 0) {
      return [];
    }

    // Insert new periods
    const periodsToInsert = newPeriods.map(period => ({
      company_id: companyId,
      start_date: period.startDate.toISOString().split('T')[0],
      end_date: period.endDate.toISOString().split('T')[0],
      pay_date: period.payDate.toISOString().split('T')[0],
      status: 'pending'
    }));

    const { data, error } = await supabase
      .from('payroll_periods')
      .insert(periodsToInsert)
      .select();

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error generating payroll periods:', error);
    throw error;
  }
}

/**
 * Update a payroll period
 * @param periodId Payroll period ID
 * @param updates Updates to apply
 * @returns Updated payroll period
 */
export async function updatePayrollPeriod(
  periodId: string,
  updates: {
    start_date?: string;
    end_date?: string;
    pay_date?: string;
    status?: string;
  }
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('payroll_periods')
      .update(updates)
      .eq('id', periodId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating payroll period:', error);
    throw error;
  }
}

/**
 * Delete a payroll period
 * @param periodId Payroll period ID
 * @returns Boolean indicating success
 */
export async function deletePayrollPeriod(periodId: string): Promise<boolean> {
  try {
    // Check if period has associated payroll runs
    const { data: runs, error: runsError } = await supabase
      .from('payroll_runs')
      .select('id')
      .eq('payroll_period_id', periodId);

    if (runsError) throw runsError;

    if (runs && runs.length > 0) {
      throw new Error('Cannot delete period with associated payroll runs');
    }

    // Delete period
    const { error } = await supabase
      .from('payroll_periods')
      .delete()
      .eq('id', periodId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting payroll period:', error);
    throw error;
  }
}