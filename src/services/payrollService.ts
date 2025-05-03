import { supabase } from '../lib/supabase';
import { TaxService } from './taxService';
import { DeductionService } from './deductionService';
import { TimeTrackingService } from './timeTrackingService';
import { format } from 'date-fns';
import { calculatePayrollTaxes } from "@paysurity/admin-ui/tax-service";
import { processDisbursement } from "./disbursement";
import { syncManager } from './syncManager';
import { addOfflineTransaction } from '../lib/indexedDB';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  salary_type: 'salary' | 'hourly';
  salary_amount: number;
  state: string;
}

interface PayrollPeriod {
  id: string;
  company_id: string;
  start_date: string;
  end_date: string;
  pay_date: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

interface PayrollCalculation {
  employeeId: string;
  name: string;
  department: string;
  grossPay: number;
  regularPay: number;
  overtimePay: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  preTaxDeductions: number;
  postTaxDeductions: number;
  netPay: number;
}

export class PayrollService {
  /**
   * Calculate payroll for a given period and employees
   */
  static async calculatePayroll(
    periodId: string,
    employeeIds: string[]
  ): Promise<PayrollCalculation[]> {
    // Get period details
    const { data: period, error: periodError } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('id', periodId)
      .single();

    if (periodError) throw periodError;

    // Get employees
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .in('id', employeeIds);

    if (employeesError) throw employeesError;

    // Calculate payroll for each employee
    const calculations = await Promise.all(
      employees.map(async (employee) => {
        return this.calculateEmployeePayroll(
          employee,
          period.start_date,
          period.end_date
        );
      })
    );

    return calculations;
  }

  /**
   * Calculate payroll for a single employee
   */
  static async calculateEmployeePayroll(
    employee: Employee,
    startDate: string,
    endDate: string
  ): Promise<PayrollCalculation> {
    // Calculate regular and overtime pay
    const { regularPay, overtimePay } = await this.calculateGrossPay(
      employee,
      startDate,
      endDate
    );

    const grossPay = regularPay + overtimePay;

    // Calculate taxes using the tax service
    const taxes = await TaxService.calculatePayrollTaxes(grossPay, employee.state || 'CA');

    // Calculate deductions
    const deductions = await DeductionService.getActiveDeductions(employee.id);
    const { preTaxTotal, postTaxTotal } = DeductionService.calculateTotalDeductions(
      deductions,
      grossPay,
      'bi-weekly' // Default to bi-weekly
    );

    // Calculate net pay
    const netPay = grossPay - taxes.total - preTaxTotal - postTaxTotal;

    return {
      employeeId: employee.id,
      name: `${employee.first_name} ${employee.last_name}`,
      department: employee.department || '',
      grossPay,
      regularPay,
      overtimePay,
      federalTax: taxes.federal,
      stateTax: taxes.state,
      socialSecurity: taxes.social,
      medicare: taxes.medicare,
      preTaxDeductions: preTaxTotal,
      postTaxDeductions: postTaxTotal,
      netPay
    };
  }

  /**
   * Calculate gross pay for an employee
   */
  static async calculateGrossPay(
    employee: Employee,
    startDate: string,
    endDate: string
  ): Promise<{ regularPay: number; overtimePay: number }> {
    if (employee.salary_type === 'salary') {
      // For salaried employees, calculate per-period amount
      // Assuming bi-weekly pay (26 pay periods per year)
      const regularPay = employee.salary_amount / 26;
      return { regularPay, overtimePay: 0 };
    } else {
      // For hourly employees, calculate based on time entries
      try {
        // Get time entries for the period
        const { data: timeEntries, error } = await supabase
          .from('time_entries')
          .select('*')
          .eq('employee_id', employee.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .eq('status', 'approved');

        if (error) throw error;

        // Calculate hours and pay
        const { regularHours, overtimeHours } = TimeTrackingService.calculateTotalHours(
          timeEntries || []
        );

        const regularPay = regularHours * employee.salary_amount;
        const overtimePay = overtimeHours * (employee.salary_amount * 1.5); // Time and a half

        return { regularPay, overtimePay };
      } catch (error) {
        console.error('Error calculating gross pay:', error);
        return { regularPay: 0, overtimePay: 0 };
      }
    }
  }

  /**
   * Save payroll results to database and process disbursements
   */
  static async savePayrollResults(
    periodId: string,
    companyId: string,
    calculations: PayrollCalculation[]
  ): Promise<string> {
    const isOnline = navigator.onLine;

    if (!isOnline) {
      // Store payroll data in IndexedDB for later synchronization
      const offlineData = {
        periodId,
        companyId,
        calculations,
        timestamp: new Date().toISOString()
      };
      
      const transactionId = await addOfflineTransaction('payroll_run', offlineData);
      console.log('Payroll data saved for offline sync with ID:', transactionId);
      
      return transactionId;
    }

    try {
      // Create payroll run
      const { data: run, error: runError } = await supabase
        .from('payroll_runs')
        .insert({
          company_id: companyId,
          payroll_period_id: periodId,
          status: 'completed',
          processed_at: new Date().toISOString(),
          total_gross_pay: calculations.reduce((sum, calc) => sum + calc.grossPay, 0),
          total_taxes: calculations.reduce(
            (sum, calc) => sum + calc.federalTax + calc.stateTax + calc.socialSecurity + calc.medicare,
            0
          ),
          total_deductions: calculations.reduce(
            (sum, calc) => sum + calc.preTaxDeductions + calc.postTaxDeductions,
            0
          ),
          total_net_pay: calculations.reduce((sum, calc) => sum + calc.netPay, 0)
        })
        .select()
        .single();

      if (runError) throw runError;

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

      // Update period status
      const { error: periodError } = await supabase
        .from('payroll_periods')
        .update({ status: 'completed' })
        .eq('id', periodId);

      if (periodError) throw periodError;

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
      await this.logPayrollRun(run.id, companyId, calculations);

      return run.id;
    } catch (error) {
      console.error('Error saving payroll results:', error);
      throw error;
    }
  }

  /**
   * Log payroll run for audit purposes
   */
  private static async logPayrollRun(
    runId: string,
    companyId: string,
    calculations: PayrollCalculation[]
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
   * Create a new payroll period
   */
  static async createPayrollPeriod(
    companyId: string,
    startDate: Date,
    endDate: Date,
    payDate: Date
  ): Promise<PayrollPeriod> {
    const { data, error } = await supabase
      .from('payroll_periods')
      .insert({
        company_id: companyId,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        pay_date: format(payDate, 'yyyy-MM-dd'),
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get pending payroll periods for a company
   */
  static async getPendingPayrollPeriods(companyId: string): Promise<PayrollPeriod[]> {
    const { data, error } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'pending')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get active employees for a company
   */
  static async getActiveEmployees(companyId: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('last_name', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}