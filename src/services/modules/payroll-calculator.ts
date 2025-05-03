import { calculateTaxWithholding, calculateNetPay, calculateOvertimePay } from '../../lib/core';
import { supabase } from '../../lib/supabase';

/**
 * Calculate payroll for a given employee
 * @param employeeId Employee ID
 * @param startDate Start date of pay period
 * @param endDate End date of pay period
 * @returns Payroll calculation result
 */
export async function calculateEmployeePayroll(
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<{
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
}> {
  try {
    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (employeeError) throw employeeError;

    // Calculate regular and overtime pay
    const { regularPay, overtimePay } = await calculateGrossPay(
      employee,
      startDate,
      endDate
    );

    const grossPay = regularPay + overtimePay;

    // Calculate taxes
    const taxes = calculateTaxWithholding(
      grossPay,
      'single', // Default to single filing status
      0, // Default to 0 allowances
      employee.state || 'CA'
    );

    // Calculate deductions
    const deductions = await calculateDeductions(employeeId, grossPay);

    // Calculate net pay
    const netPay = calculateNetPay(
      grossPay,
      taxes,
      deductions.preTaxTotal,
      deductions.postTaxTotal
    );

    return {
      employeeId,
      name: `${employee.first_name} ${employee.last_name}`,
      department: employee.department || '',
      grossPay,
      regularPay,
      overtimePay,
      federalTax: taxes.federal,
      stateTax: taxes.state,
      socialSecurity: taxes.socialSecurity,
      medicare: taxes.medicare,
      preTaxDeductions: deductions.preTaxTotal,
      postTaxDeductions: deductions.postTaxTotal,
      netPay
    };
  } catch (error) {
    console.error('Error calculating employee payroll:', error);
    throw error;
  }
}

/**
 * Calculate gross pay for an employee
 * @param employee Employee object
 * @param startDate Start date of pay period
 * @param endDate End date of pay period
 * @returns Object with regular and overtime pay
 */
async function calculateGrossPay(
  employee: any,
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
      const { regularHours, overtimeHours } = calculateTotalHours(
        timeEntries || []
      );

      const regularPay = regularHours * employee.salary_amount;
      const overtimePay = overtimeHours * (employee.salary_amount * 1.5); // Time and a half

      return { 
        regularPay: Math.round(regularPay * 100) / 100, 
        overtimePay: Math.round(overtimePay * 100) / 100 
      };
    } catch (error) {
      console.error('Error calculating gross pay:', error);
      return { regularPay: 0, overtimePay: 0 };
    }
  }
}

/**
 * Calculate total hours from time entries
 * @param timeEntries Array of time entries
 * @returns Object with regular and overtime hours
 */
function calculateTotalHours(timeEntries: any[]): {
  regularHours: number;
  overtimeHours: number;
} {
  // Group entries by week
  const weeklyHours = new Map<string, number>();
  
  timeEntries.forEach(entry => {
    if (!entry.end_time) return;
    
    const weekStart = getWeekStart(new Date(entry.date));
    const hours = calculateHours(entry);
    
    weeklyHours.set(
      weekStart,
      (weeklyHours.get(weekStart) || 0) + hours
    );
  });
  
  // Calculate regular and overtime hours
  let regularHours = 0;
  let overtimeHours = 0;
  
  weeklyHours.forEach(hours => {
    if (hours <= 40) {
      regularHours += hours;
    } else {
      regularHours += 40;
      overtimeHours += hours - 40;
    }
  });
  
  return { regularHours, overtimeHours };
}

/**
 * Calculate hours for a time entry
 * @param entry Time entry object
 * @returns Number of hours
 */
function calculateHours(entry: any): number {
  if (!entry.end_time) return 0;

  const start = new Date(`2000-01-01T${entry.start_time}`);
  const end = new Date(`2000-01-01T${entry.end_time}`);
  
  // Parse break duration (format: HH:MM:SS)
  let breakMinutes = 0;
  if (entry.break_duration) {
    const breakParts = entry.break_duration.split(':');
    if (breakParts.length === 3) {
      breakMinutes = 
        parseInt(breakParts[0]) * 60 + // Hours to minutes
        parseInt(breakParts[1]) +       // Minutes
        parseInt(breakParts[2]) / 60;   // Seconds to minutes
    }
  }

  const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  return Math.max(0, (totalMinutes - breakMinutes) / 60);
}

/**
 * Get the start of the week for a date
 * @param date Date object
 * @returns String representation of the week start date
 */
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

/**
 * Calculate deductions for an employee
 * @param employeeId Employee ID
 * @param grossPay Gross pay amount
 * @returns Object with pre-tax and post-tax deduction totals
 */
async function calculateDeductions(
  employeeId: string,
  grossPay: number
): Promise<{
  preTaxTotal: number;
  postTaxTotal: number;
  total: number;
}> {
  try {
    // Get active deductions for the employee
    const { data: deductions, error } = await supabase
      .from('deductions')
      .select(`
        *,
        deduction_type:deduction_types(*)
      `)
      .eq('employee_id', employeeId)
      .is('end_date', null);

    if (error) throw error;

    let preTaxTotal = 0;
    let postTaxTotal = 0;

    // Calculate each deduction
    (deductions || []).forEach(deduction => {
      if (!deduction.deduction_type) return;

      let amount = 0;
      
      // Calculate amount based on calculation method
      if (deduction.deduction_type.calculation_method === 'percentage') {
        amount = grossPay * (deduction.amount / 100);
      } else {
        amount = deduction.amount;
      }
      
      // Adjust for frequency
      if (deduction.frequency === 'monthly') {
        // Convert monthly to per-paycheck (assuming bi-weekly)
        amount /= 2.17; // Average bi-weeks per month
      } else if (deduction.frequency === 'annual') {
        // Convert annual to per-paycheck (assuming bi-weekly)
        amount /= 26;
      }
      
      // Add to appropriate total
      if (deduction.deduction_type.type === 'pre_tax') {
        preTaxTotal += amount;
      } else {
        postTaxTotal += amount;
      }
    });

    return {
      preTaxTotal: Math.round(preTaxTotal * 100) / 100,
      postTaxTotal: Math.round(postTaxTotal * 100) / 100,
      total: Math.round((preTaxTotal + postTaxTotal) * 100) / 100
    };
  } catch (error) {
    console.error('Error calculating deductions:', error);
    return { preTaxTotal: 0, postTaxTotal: 0, total: 0 };
  }
}