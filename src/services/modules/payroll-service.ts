import { processPayroll, getPayrollHistory, getPayrollDetails } from './payroll-processor';
import { calculateEmployeePayroll } from './payroll-calculator';
import { 
  createPayrollPeriod, 
  getPendingPayrollPeriods, 
  getPayrollPeriods,
  generatePayrollPeriods,
  updatePayrollPeriod,
  deletePayrollPeriod
} from './payroll-periods';
import { 
  generatePayrollSummaryReport,
  generateEmployeeEarningsReport,
  generateTaxLiabilityReport,
  generateDeductionSummaryReport,
  exportPayrollToCSV
} from './payroll-reports';
import { getActiveEmployees } from './payroll-processor';

/**
 * PayrollService class provides a unified interface to all payroll-related functionality
 */
export class PayrollService {
  /**
   * Process payroll for a given period and company
   * @param periodId Payroll period ID
   * @param companyId Company ID
   * @returns Payroll run details
   */
  static async processPayroll(periodId: string, companyId: string) {
    return processPayroll(periodId, companyId);
  }

  /**
   * Get payroll history for a company
   * @param companyId Company ID
   * @param limit Number of records to return
   * @param offset Offset for pagination
   * @returns Array of payroll runs
   */
  static async getPayrollHistory(companyId: string, limit: number = 10, offset: number = 0) {
    return getPayrollHistory(companyId, limit, offset);
  }

  /**
   * Get payroll details for a specific run
   * @param runId Payroll run ID
   * @returns Payroll run details with items
   */
  static async getPayrollDetails(runId: string) {
    return getPayrollDetails(runId);
  }

  /**
   * Calculate payroll for a given period and employees
   * @param periodId Payroll period ID
   * @param employeeIds Array of employee IDs
   * @returns Array of payroll calculations
   */
  static async calculatePayroll(periodId: string, employeeIds: string[]) {
    // Get period details
    const { data: period, error } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('id', periodId)
      .single();

    if (error) throw error;

    // Calculate payroll for each employee
    const calculations = await Promise.all(
      employeeIds.map(async (employeeId) => {
        return calculateEmployeePayroll(
          employeeId,
          period.start_date,
          period.end_date
        );
      })
    );

    return calculations;
  }

  /**
   * Save payroll results to database
   * @param periodId Payroll period ID
   * @param companyId Company ID
   * @param calculations Payroll calculations
   * @returns Payroll run ID
   */
  static async savePayrollResults(
    periodId: string,
    companyId: string,
    calculations: any[]
  ) {
    return processPayroll(periodId, companyId);
  }

  /**
   * Create a new payroll period
   * @param companyId Company ID
   * @param startDate Start date
   * @param endDate End date
   * @param payDate Pay date
   * @returns Created payroll period
   */
  static async createPayrollPeriod(
    companyId: string,
    startDate: Date,
    endDate: Date,
    payDate: Date
  ) {
    return createPayrollPeriod(companyId, startDate, endDate, payDate);
  }

  /**
   * Get pending payroll periods for a company
   * @param companyId Company ID
   * @returns Array of pending payroll periods
   */
  static async getPendingPayrollPeriods(companyId: string) {
    return getPendingPayrollPeriods(companyId);
  }

  /**
   * Get all payroll periods for a company
   * @param companyId Company ID
   * @param limit Number of records to return
   * @param offset Offset for pagination
   * @returns Array of payroll periods
   */
  static async getPayrollPeriods(companyId: string, limit: number = 10, offset: number = 0) {
    return getPayrollPeriods(companyId, limit, offset);
  }

  /**
   * Generate payroll periods for a company based on frequency
   * @param companyId Company ID
   * @param frequency Pay frequency
   * @param startDate Reference start date
   * @param count Number of periods to generate
   * @returns Array of created payroll periods
   */
  static async generatePayrollPeriods(
    companyId: string,
    frequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly',
    startDate: Date = new Date(),
    count: number = 12
  ) {
    return generatePayrollPeriods(companyId, frequency, startDate, count);
  }

  /**
   * Update a payroll period
   * @param periodId Payroll period ID
   * @param updates Updates to apply
   * @returns Updated payroll period
   */
  static async updatePayrollPeriod(
    periodId: string,
    updates: {
      start_date?: string;
      end_date?: string;
      pay_date?: string;
      status?: string;
    }
  ) {
    return updatePayrollPeriod(periodId, updates);
  }

  /**
   * Delete a payroll period
   * @param periodId Payroll period ID
   * @returns Boolean indicating success
   */
  static async deletePayrollPeriod(periodId: string) {
    return deletePayrollPeriod(periodId);
  }

  /**
   * Get active employees for a company
   * @param companyId Company ID
   * @returns Array of active employees
   */
  static async getActiveEmployees(companyId: string) {
    return getActiveEmployees(companyId);
  }

  /**
   * Generate payroll summary report
   * @param companyId Company ID
   * @param startDate Start date
   * @param endDate End date
   * @returns Payroll summary report data
   */
  static async generatePayrollSummaryReport(
    companyId: string,
    startDate: string,
    endDate: string
  ) {
    return generatePayrollSummaryReport(companyId, startDate, endDate);
  }

  /**
   * Generate employee earnings report
   * @param employeeId Employee ID
   * @param year Year to report on
   * @returns Employee earnings report data
   */
  static async generateEmployeeEarningsReport(employeeId: string, year: number) {
    return generateEmployeeEarningsReport(employeeId, year);
  }

  /**
   * Generate tax liability report
   * @param companyId Company ID
   * @param year Year to report on
   * @param quarter Quarter to report on (1-4, optional)
   * @returns Tax liability report data
   */
  static async generateTaxLiabilityReport(
    companyId: string,
    year: number,
    quarter?: number
  ) {
    return generateTaxLiabilityReport(companyId, year, quarter);
  }

  /**
   * Generate deduction summary report
   * @param companyId Company ID
   * @param startDate Start date
   * @param endDate End date
   * @returns Deduction summary report data
   */
  static async generateDeductionSummaryReport(
    companyId: string,
    startDate: string,
    endDate: string
  ) {
    return generateDeductionSummaryReport(companyId, startDate, endDate);
  }

  /**
   * Export payroll data to CSV format
   * @param runId Payroll run ID
   * @returns CSV string
   */
  static async exportPayrollToCSV(runId: string) {
    return exportPayrollToCSV(runId);
  }
}

// Import supabase for the calculatePayroll method
import { supabase } from '../../lib/supabase';