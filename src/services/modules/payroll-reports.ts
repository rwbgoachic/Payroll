import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/core';

/**
 * Generate payroll summary report
 * @param companyId Company ID
 * @param startDate Start date
 * @param endDate End date
 * @returns Payroll summary report data
 */
export async function generatePayrollSummaryReport(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<{
  totalGrossPay: number;
  totalTaxes: number;
  totalDeductions: number;
  totalNetPay: number;
  employeeCount: number;
  departmentSummary: Record<string, {
    employeeCount: number;
    totalGrossPay: number;
    totalNetPay: number;
  }>;
  periodSummary: Array<{
    periodId: string;
    startDate: string;
    endDate: string;
    payDate: string;
    totalGrossPay: number;
    totalNetPay: number;
  }>;
}> {
  try {
    // Get all payroll runs in the date range
    const { data: runs, error: runsError } = await supabase
      .from('payroll_runs')
      .select(`
        *,
        payroll_period:payroll_periods(*)
      `)
      .eq('company_id', companyId)
      .gte('payroll_period.pay_date', startDate)
      .lte('payroll_period.pay_date', endDate);

    if (runsError) throw runsError;

    if (!runs || runs.length === 0) {
      return {
        totalGrossPay: 0,
        totalTaxes: 0,
        totalDeductions: 0,
        totalNetPay: 0,
        employeeCount: 0,
        departmentSummary: {},
        periodSummary: []
      };
    }

    // Get all payroll items for these runs
    const periodIds = runs.map(run => run.payroll_period.id);
    
    const { data: items, error: itemsError } = await supabase
      .from('payroll_items')
      .select(`
        *,
        employee:employees(*)
      `)
      .in('payroll_period_id', periodIds);

    if (itemsError) throw itemsError;

    // Calculate totals
    const totalGrossPay = runs.reduce((sum, run) => sum + run.total_gross_pay, 0);
    const totalTaxes = runs.reduce((sum, run) => sum + run.total_taxes, 0);
    const totalDeductions = runs.reduce((sum, run) => sum + run.total_deductions, 0);
    const totalNetPay = runs.reduce((sum, run) => sum + run.total_net_pay, 0);

    // Get unique employee count
    const uniqueEmployees = new Set();
    items?.forEach(item => uniqueEmployees.add(item.employee_id));
    const employeeCount = uniqueEmployees.size;

    // Calculate department summary
    const departmentSummary: Record<string, {
      employeeCount: number;
      totalGrossPay: number;
      totalNetPay: number;
    }> = {};

    items?.forEach(item => {
      const department = item.employee?.department || 'Unassigned';
      
      if (!departmentSummary[department]) {
        departmentSummary[department] = {
          employeeCount: 0,
          totalGrossPay: 0,
          totalNetPay: 0
        };
      }
      
      // Only count each employee once per department
      if (!departmentSummary[department][item.employee_id]) {
        departmentSummary[department].employeeCount++;
        departmentSummary[department][item.employee_id] = true;
      }
      
      departmentSummary[department].totalGrossPay += item.regular_pay + item.overtime_pay;
      departmentSummary[department].totalNetPay += item.net_pay;
    });

    // Remove the employee tracking properties
    Object.keys(departmentSummary).forEach(dept => {
      Object.keys(departmentSummary[dept]).forEach(key => {
        if (key !== 'employeeCount' && key !== 'totalGrossPay' && key !== 'totalNetPay') {
          delete departmentSummary[dept][key];
        }
      });
    });

    // Calculate period summary
    const periodSummary = runs.map(run => ({
      periodId: run.payroll_period.id,
      startDate: run.payroll_period.start_date,
      endDate: run.payroll_period.end_date,
      payDate: run.payroll_period.pay_date,
      totalGrossPay: run.total_gross_pay,
      totalNetPay: run.total_net_pay
    }));

    return {
      totalGrossPay,
      totalTaxes,
      totalDeductions,
      totalNetPay,
      employeeCount,
      departmentSummary,
      periodSummary
    };
  } catch (error) {
    console.error('Error generating payroll summary report:', error);
    throw error;
  }
}

/**
 * Generate employee earnings report
 * @param employeeId Employee ID
 * @param year Year to report on
 * @returns Employee earnings report data
 */
export async function generateEmployeeEarningsReport(
  employeeId: string,
  year: number
): Promise<{
  employee: {
    id: string;
    name: string;
    department: string;
    position: string;
  };
  yearToDate: {
    grossPay: number;
    federalTax: number;
    stateTax: number;
    socialSecurity: number;
    medicare: number;
    deductions: number;
    netPay: number;
  };
  payPeriods: Array<{
    periodId: string;
    startDate: string;
    endDate: string;
    payDate: string;
    grossPay: number;
    netPay: number;
  }>;
}> {
  try {
    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (employeeError) throw employeeError;

    // Get all payroll items for this employee in the specified year
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    const { data: items, error: itemsError } = await supabase
      .from('payroll_items')
      .select(`
        *,
        payroll_period:payroll_periods(*)
      `)
      .eq('employee_id', employeeId)
      .gte('payroll_period.pay_date', startDate)
      .lte('payroll_period.pay_date', endDate);

    if (itemsError) throw itemsError;

    // Calculate year-to-date totals
    const yearToDate = {
      grossPay: 0,
      federalTax: 0,
      stateTax: 0,
      socialSecurity: 0,
      medicare: 0,
      deductions: 0,
      netPay: 0
    };

    items?.forEach(item => {
      yearToDate.grossPay += item.regular_pay + item.overtime_pay;
      yearToDate.federalTax += item.federal_tax;
      yearToDate.stateTax += item.state_tax;
      yearToDate.socialSecurity += item.social_security;
      yearToDate.medicare += item.medicare;
      yearToDate.deductions += item.deductions;
      yearToDate.netPay += item.net_pay;
    });

    // Format pay periods
    const payPeriods = items?.map(item => ({
      periodId: item.payroll_period.id,
      startDate: item.payroll_period.start_date,
      endDate: item.payroll_period.end_date,
      payDate: item.payroll_period.pay_date,
      grossPay: item.regular_pay + item.overtime_pay,
      netPay: item.net_pay
    })) || [];

    return {
      employee: {
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        department: employee.department || '',
        position: employee.position || ''
      },
      yearToDate,
      payPeriods
    };
  } catch (error) {
    console.error('Error generating employee earnings report:', error);
    throw error;
  }
}

/**
 * Generate tax liability report
 * @param companyId Company ID
 * @param year Year to report on
 * @param quarter Quarter to report on (1-4, optional)
 * @returns Tax liability report data
 */
export async function generateTaxLiabilityReport(
  companyId: string,
  year: number,
  quarter?: number
): Promise<{
  federalIncomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  stateTaxes: Record<string, number>;
  totalTaxLiability: number;
  monthlyBreakdown: Record<string, {
    federalIncomeTax: number;
    socialSecurityTax: number;
    medicareTax: number;
    stateTaxes: Record<string, number>;
    totalTaxLiability: number;
  }>;
}> {
  try {
    // Determine date range based on year and quarter
    let startDate: string;
    let endDate: string;
    
    if (quarter) {
      const quarterStartMonth = (quarter - 1) * 3;
      startDate = `${year}-${(quarterStartMonth + 1).toString().padStart(2, '0')}-01`;
      
      const endMonth = quarterStartMonth + 3;
      const endYear = endMonth > 11 ? year + 1 : year;
      const adjustedEndMonth = endMonth > 11 ? endMonth - 12 : endMonth;
      
      // Last day of the end month
      const lastDay = new Date(endYear, adjustedEndMonth, 0).getDate();
      endDate = `${endYear}-${(adjustedEndMonth).toString().padStart(2, '0')}-${lastDay}`;
    } else {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
    }
    
    // Get all payroll runs in the date range
    const { data: runs, error: runsError } = await supabase
      .from('payroll_runs')
      .select(`
        *,
        payroll_period:payroll_periods(*)
      `)
      .eq('company_id', companyId)
      .gte('payroll_period.pay_date', startDate)
      .lte('payroll_period.pay_date', endDate);

    if (runsError) throw runsError;

    if (!runs || runs.length === 0) {
      return {
        federalIncomeTax: 0,
        socialSecurityTax: 0,
        medicareTax: 0,
        stateTaxes: {},
        totalTaxLiability: 0,
        monthlyBreakdown: {}
      };
    }

    // Get all payroll items for these runs
    const periodIds = runs.map(run => run.payroll_period.id);
    
    const { data: items, error: itemsError } = await supabase
      .from('payroll_items')
      .select(`
        *,
        employee:employees(*)
      `)
      .in('payroll_period_id', periodIds);

    if (itemsError) throw itemsError;

    // Initialize report data
    let federalIncomeTax = 0;
    let socialSecurityTax = 0;
    let medicareTax = 0;
    const stateTaxes: Record<string, number> = {};
    const monthlyBreakdown: Record<string, {
      federalIncomeTax: number;
      socialSecurityTax: number;
      medicareTax: number;
      stateTaxes: Record<string, number>;
      totalTaxLiability: number;
    }> = {};

    // Process each payroll item
    items?.forEach(item => {
      const payDate = new Date(item.payroll_period.pay_date);
      const monthKey = `${payDate.getFullYear()}-${(payDate.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Initialize monthly breakdown if needed
      if (!monthlyBreakdown[monthKey]) {
        monthlyBreakdown[monthKey] = {
          federalIncomeTax: 0,
          socialSecurityTax: 0,
          medicareTax: 0,
          stateTaxes: {},
          totalTaxLiability: 0
        };
      }
      
      // Add to federal taxes
      federalIncomeTax += item.federal_tax;
      monthlyBreakdown[monthKey].federalIncomeTax += item.federal_tax;
      
      // Add to FICA taxes
      socialSecurityTax += item.social_security;
      medicareTax += item.medicare;
      monthlyBreakdown[monthKey].socialSecurityTax += item.social_security;
      monthlyBreakdown[monthKey].medicareTax += item.medicare;
      
      // Add to state taxes
      const state = item.employee?.state || 'Unknown';
      if (!stateTaxes[state]) {
        stateTaxes[state] = 0;
      }
      if (!monthlyBreakdown[monthKey].stateTaxes[state]) {
        monthlyBreakdown[monthKey].stateTaxes[state] = 0;
      }
      
      stateTaxes[state] += item.state_tax;
      monthlyBreakdown[monthKey].stateTaxes[state] += item.state_tax;
      
      // Update monthly total
      monthlyBreakdown[monthKey].totalTaxLiability += 
        item.federal_tax + item.social_security + item.medicare + item.state_tax;
    });

    // Calculate total tax liability
    const totalTaxLiability = federalIncomeTax + socialSecurityTax + medicareTax + 
      Object.values(stateTaxes).reduce((sum, tax) => sum + tax, 0);

    return {
      federalIncomeTax,
      socialSecurityTax,
      medicareTax,
      stateTaxes,
      totalTaxLiability,
      monthlyBreakdown
    };
  } catch (error) {
    console.error('Error generating tax liability report:', error);
    throw error;
  }
}

/**
 * Generate deduction summary report
 * @param companyId Company ID
 * @param startDate Start date
 * @param endDate End date
 * @returns Deduction summary report data
 */
export async function generateDeductionSummaryReport(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<{
  totalDeductions: number;
  preTaxDeductions: number;
  postTaxDeductions: number;
  deductionsByType: Record<string, {
    count: number;
    total: number;
    isTaxable: boolean;
  }>;
}> {
  try {
    // Get all employees for this company
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id')
      .eq('company_id', companyId)
      .eq('status', 'active');

    if (employeesError) throw employeesError;

    if (!employees || employees.length === 0) {
      return {
        totalDeductions: 0,
        preTaxDeductions: 0,
        postTaxDeductions: 0,
        deductionsByType: {}
      };
    }

    const employeeIds = employees.map(emp => emp.id);

    // Get all deductions for these employees
    const { data: deductions, error: deductionsError } = await supabase
      .from('deductions')
      .select(`
        *,
        deduction_type:deduction_types(*)
      `)
      .in('employee_id', employeeIds)
      .is('end_date', null)
      .or(`end_date.gt.${startDate}`);

    if (deductionsError) throw deductionsError;

    // Initialize report data
    let totalDeductions = 0;
    let preTaxDeductions = 0;
    let postTaxDeductions = 0;
    const deductionsByType: Record<string, {
      count: number;
      total: number;
      isTaxable: boolean;
    }> = {};

    // Process each deduction
    deductions?.forEach(deduction => {
      if (!deduction.deduction_type) return;

      const typeName = deduction.deduction_type.name;
      const isTaxable = deduction.deduction_type.type === 'post_tax';
      
      // Initialize deduction type if needed
      if (!deductionsByType[typeName]) {
        deductionsByType[typeName] = {
          count: 0,
          total: 0,
          isTaxable
        };
      }
      
      // Calculate amount for the period
      let amount = 0;
      
      if (deduction.deduction_type.calculation_method === 'percentage') {
        // For percentage-based deductions, we need to estimate
        // This is a simplification - in a real system, we would calculate based on actual payroll data
        const estimatedGrossPay = 2000; // Placeholder average bi-weekly gross pay
        amount = estimatedGrossPay * (deduction.amount / 100);
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
      
      // Estimate number of pay periods in the date range
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const daysDiff = (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24);
      const payPeriods = Math.ceil(daysDiff / 14); // Assuming bi-weekly pay
      
      const totalAmount = amount * payPeriods;
      
      // Add to totals
      deductionsByType[typeName].count++;
      deductionsByType[typeName].total += totalAmount;
      
      totalDeductions += totalAmount;
      
      if (isTaxable) {
        postTaxDeductions += totalAmount;
      } else {
        preTaxDeductions += totalAmount;
      }
    });

    return {
      totalDeductions,
      preTaxDeductions,
      postTaxDeductions,
      deductionsByType
    };
  } catch (error) {
    console.error('Error generating deduction summary report:', error);
    throw error;
  }
}

/**
 * Export payroll data to CSV format
 * @param runId Payroll run ID
 * @returns CSV string
 */
export async function exportPayrollToCSV(runId: string): Promise<string> {
  try {
    const payrollDetails = await getPayrollDetails(runId);
    
    if (!payrollDetails || !payrollDetails.items) {
      throw new Error('No payroll data found');
    }
    
    // Create CSV header
    let csv = 'Employee ID,Employee Name,Department,Position,Regular Pay,Overtime Pay,Gross Pay,Federal Tax,State Tax,Social Security,Medicare,Deductions,Net Pay\n';
    
    // Add data rows
    payrollDetails.items.forEach((item: any) => {
      const employee = item.employee;
      const grossPay = item.regular_pay + item.overtime_pay;
      
      csv += [
        employee.id,
        `${employee.first_name} ${employee.last_name}`,
        employee.department || '',
        employee.position || '',
        formatCurrency(item.regular_pay),
        formatCurrency(item.overtime_pay),
        formatCurrency(grossPay),
        formatCurrency(item.federal_tax),
        formatCurrency(item.state_tax),
        formatCurrency(item.social_security),
        formatCurrency(item.medicare),
        formatCurrency(item.deductions),
        formatCurrency(item.net_pay)
      ].join(',') + '\n';
    });
    
    return csv;
  } catch (error) {
    console.error('Error exporting payroll to CSV:', error);
    throw error;
  }
}

/**
 * Get payroll details for a specific run
 * @param runId Payroll run ID
 * @returns Payroll run details with items
 */
async function getPayrollDetails(runId: string): Promise<any> {
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