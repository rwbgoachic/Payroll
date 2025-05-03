import { supabase } from '../../lib/supabase';
import { calculateEmployeePayroll } from './payroll-calculator';
import { processDisbursement } from '../disbursement';
import { syncManager } from '../syncManager';
import { addOfflineTransaction } from '../../lib/indexedDB';

/**
 * Process payroll for a given period and company
 * @param periodId Payroll period ID
 * @param companyId Company ID
 * @returns Payroll run details
 */
export async function processPayroll(
  periodId: string,
  companyId: string
): Promise<{
  id: string;
  status: string;
  total_gross_pay: number;
  total_taxes: number;
  total_deductions: number;
  total_net_pay: number;
}> {
  const isOnline = navigator.onLine;

  if (!isOnline) {
    // Store payroll data in IndexedDB for later synchronization
    const offlineData = {
      periodId,
      companyId,
      timestamp: new Date().toISOString()
    };
    
    const transactionId = await addOfflineTransaction('payroll_run', offlineData);
    console.log('Payroll data saved for offline sync with ID:', transactionId);
    
    throw new Error('Cannot process payroll while offline. Data has been saved and will be processed when online.');
  }

  try {
    // Get period details
    const { data: period, error: periodError } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('id', periodId)
      .single();

    if (periodError) throw periodError;

    // Get active employees for the company
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'active');

    if (employeesError) throw employeesError;

    // Create payroll run
    const { data: run, error: runError } = await supabase
      .from('payroll_runs')
      .insert({
        company_id: companyId,
        payroll_period_id: periodId,
        status: 'processing',
        processed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (runError) throw runError;

    // Calculate payroll for each employee
    const calculations = await Promise.all(
      employees.map(async (employee) => {
        return calculateEmployeePayroll(
          employee.id,
          period.start_date,
          period.end_date
        );
      })
    );

    // Create payroll items
    const payrollItems = calculations.map((calc) => ({
      payroll_period_id: periodId,
      employee_id: calc.employeeId,
      hours: 0, // This would be calculated from time entries
      regular_pay: calc.regularPay,
      overtime_pay: calc.overtimePay,
      federal_tax: calc.federalTax,
      state_tax: calc.stateTax,
      social_security: calc.socialSecurity,
      medicare: calc.medicare,
      deductions: calc.preTaxDeductions + calc.postTaxDeductions,
      net_pay: calc.netPay
    }));

    const { error: itemsError } = await supabase
      .from('payroll_items')
      .insert(payrollItems);

    if (itemsError) throw itemsError;

    // Calculate totals
    const totalGrossPay = calculations.reduce((sum, calc) => sum + calc.grossPay, 0);
    const totalTaxes = calculations.reduce(
      (sum, calc) => sum + calc.federalTax + calc.stateTax + calc.socialSecurity + calc.medicare,
      0
    );
    const totalDeductions = calculations.reduce(
      (sum, calc) => sum + calc.preTaxDeductions + calc.postTaxDeductions,
      0
    );
    const totalNetPay = calculations.reduce((sum, calc) => sum + calc.netPay, 0);

    // Update payroll run with totals
    const { data: updatedRun, error: updateError } = await supabase
      .from('payroll_runs')
      .update({
        status: 'completed',
        total_gross_pay: totalGrossPay,
        total_taxes: totalTaxes,
        total_deductions: totalDeductions,
        total_net_pay: totalNetPay
      })
      .eq('id', run.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update period status
    const { error: periodUpdateError } = await supabase
      .from('payroll_periods')
      .update({ status: 'completed' })
      .eq('id', periodId);

    if (periodUpdateError) throw periodUpdateError;

    // Process disbursements for each employee
    for (const calc of calculations) {
      try {
        await processDisbursement(companyId, calc.employeeId, calc.netPay);
      } catch (disbursementError) {
        console.error(`Disbursement error for employee ${calc.employeeId}:`, disbursementError);
        // Continue processing other employees even if one fails
      }
    }

    // Log the payroll run for audit purposes
    await logPayrollRun(run.id, companyId, calculations);

    return updatedRun;
  } catch (error) {
    console.error('Error processing payroll:', error);
    throw error;
  }
}

/**
 * Log payroll run for audit purposes
 * @param runId Payroll run ID
 * @param companyId Company ID
 * @param calculations Payroll calculations
 */
async function logPayrollRun(
  runId: string,
  companyId: string,
  calculations: any[]
): Promise<void> {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        id: crypto.randomUUID(),
        action: 'payroll_processed',
        entity_type: 'payroll_run',
        entity_id: runId,
        details: {
          company_id: companyId,
          employee_count: calculations.length,
          total_gross_pay: calculations.reduce((sum, calc) => sum + calc.grossPay, 0),
          total_net_pay: calculations.reduce((sum, calc) => sum + calc.netPay, 0),
          timestamp: new Date().toISOString()
        },
        status: 'success'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging payroll run:', error);
    // Don't throw here to avoid disrupting the main process
  }
}

/**
 * Get payroll history for a company
 * @param companyId Company ID
 * @param limit Number of records to return
 * @param offset Offset for pagination
 * @returns Array of payroll runs
 */
export async function getPayrollHistory(
  companyId: string,
  limit: number = 10,
  offset: number = 0
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('payroll_runs')
      .select(`
        *,
        payroll_period:payroll_periods(*)
      `)
      .eq('company_id', companyId)
      .order('processed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting payroll history:', error);
    throw error;
  }
}

/**
 * Get payroll details for a specific run
 * @param runId Payroll run ID
 * @returns Payroll run details with items
 */
export async function getPayrollDetails(runId: string): Promise<any> {
  try {
    const { data: run, error: runError } = await supabase
      .from('payroll_runs')
      .select(`
        *,
        payroll_period:payroll_periods(*),
        company:companies(*)
      `)
      .eq('id', runId)
      .single();

    if (runError) throw runError;

    const { data: items, error: itemsError } = await supabase
      .from('payroll_items')
      .select(`
        *,
        employee:employees(*)
      `)
      .eq('payroll_period_id', run.payroll_period.id);

    if (itemsError) throw itemsError;

    return {
      ...run,
      items: items || []
    };
  } catch (error) {
    console.error('Error getting payroll details:', error);
    throw error;
  }
}

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
 * Get active employees for a company
 * @param companyId Company ID
 * @returns Array of active employees
 */
export async function getActiveEmployees(companyId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('last_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting active employees:', error);
    throw error;
  }
}