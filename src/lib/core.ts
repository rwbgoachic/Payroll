/**
 * PaySurity Core Library
 * Shared logic and utilities for payroll processing
 */

import { CircuitBreaker } from './resilience';

// Circuit breakers for critical services
export const taxServiceBreaker = new CircuitBreaker(5, 60000, 30000);
export const paymentServiceBreaker = new CircuitBreaker(3, 120000, 60000);

/**
 * Calculate pay period dates based on frequency
 * @param frequency Pay frequency (weekly, bi-weekly, semi-monthly, monthly)
 * @param referenceDate Reference date for calculation
 * @returns Array of pay period objects with start, end, and pay dates
 */
export function calculatePayPeriods(
  frequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly',
  referenceDate: Date = new Date(),
  count: number = 12
): Array<{
  startDate: Date;
  endDate: Date;
  payDate: Date;
}> {
  const periods = [];
  const currentDate = new Date(referenceDate);
  
  switch (frequency) {
    case 'weekly':
      // Start on Monday of current week
      currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      
      for (let i = 0; i < count; i++) {
        const startDate = new Date(currentDate);
        
        // End date is Sunday (6 days after start)
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        // Pay date is the Friday after the end date
        const payDate = new Date(endDate);
        payDate.setDate(payDate.getDate() + 5);
        
        periods.push({ startDate, endDate, payDate });
        
        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7);
      }
      break;
      
    case 'bi-weekly':
      // Start on Monday of current week
      currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      
      for (let i = 0; i < count; i++) {
        const startDate = new Date(currentDate);
        
        // End date is Sunday after next (13 days after start)
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 13);
        
        // Pay date is the Friday after the end date
        const payDate = new Date(endDate);
        payDate.setDate(payDate.getDate() + 5);
        
        periods.push({ startDate, endDate, payDate });
        
        // Move to next bi-weekly period
        currentDate.setDate(currentDate.getDate() + 14);
      }
      break;
      
    case 'semi-monthly':
      // First period: 1st to 15th, paid on 20th
      // Second period: 16th to last day of month, paid on 5th of next month
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      
      for (let i = 0; i < count; i++) {
        const month = (currentMonth + Math.floor(i / 2)) % 12;
        const year = currentYear + Math.floor((currentMonth + Math.floor(i / 2)) / 12);
        
        if (i % 2 === 0) {
          // First half of month
          const startDate = new Date(year, month, 1);
          const endDate = new Date(year, month, 15);
          const payDate = new Date(year, month, 20);
          
          periods.push({ startDate, endDate, payDate });
        } else {
          // Second half of month
          const startDate = new Date(year, month, 16);
          const endDate = new Date(year, month + 1, 0); // Last day of month
          const payDate = new Date(year, month + 1, 5);
          
          periods.push({ startDate, endDate, payDate });
        }
      }
      break;
      
    case 'monthly':
      // Period: 1st to last day of month, paid on 5th of next month
      const baseYear = currentDate.getFullYear();
      const baseMonth = currentDate.getMonth();
      
      for (let i = 0; i < count; i++) {
        const month = (baseMonth + i) % 12;
        const year = baseYear + Math.floor((baseMonth + i) / 12);
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // Last day of month
        const payDate = new Date(year, month + 1, 5);
        
        periods.push({ startDate, endDate, payDate });
      }
      break;
  }
  
  return periods;
}

/**
 * Calculate tax withholding based on gross pay and filing status
 * @param grossPay Gross pay amount
 * @param filingStatus Filing status (single, married, head)
 * @param allowances Number of allowances claimed
 * @param state State code for state tax calculation
 * @returns Object with federal, state, social security, and medicare tax amounts
 */
export function calculateTaxWithholding(
  grossPay: number,
  filingStatus: 'single' | 'married' | 'head',
  allowances: number = 0,
  state: string = 'CA'
): {
  federal: number;
  state: number;
  socialSecurity: number;
  medicare: number;
  total: number;
} {
  // Federal tax calculation
  let federalTax = 0;
  const adjustedGrossPay = grossPay * 26 - (allowances * 4300); // Annualized with allowances
  
  if (filingStatus === 'single') {
    if (adjustedGrossPay <= 11000) {
      federalTax = adjustedGrossPay * 0.10;
    } else if (adjustedGrossPay <= 44725) {
      federalTax = 1100 + (adjustedGrossPay - 11000) * 0.12;
    } else if (adjustedGrossPay <= 95375) {
      federalTax = 5147 + (adjustedGrossPay - 44725) * 0.22;
    } else if (adjustedGrossPay <= 182100) {
      federalTax = 16290 + (adjustedGrossPay - 95375) * 0.24;
    } else if (adjustedGrossPay <= 231250) {
      federalTax = 37104 + (adjustedGrossPay - 182100) * 0.32;
    } else if (adjustedGrossPay <= 578125) {
      federalTax = 52832 + (adjustedGrossPay - 231250) * 0.35;
    } else {
      federalTax = 174238.25 + (adjustedGrossPay - 578125) * 0.37;
    }
  } else if (filingStatus === 'married') {
    if (adjustedGrossPay <= 22000) {
      federalTax = adjustedGrossPay * 0.10;
    } else if (adjustedGrossPay <= 89450) {
      federalTax = 2200 + (adjustedGrossPay - 22000) * 0.12;
    } else if (adjustedGrossPay <= 190750) {
      federalTax = 10294 + (adjustedGrossPay - 89450) * 0.22;
    } else if (adjustedGrossPay <= 364200) {
      federalTax = 32580 + (adjustedGrossPay - 190750) * 0.24;
    } else if (adjustedGrossPay <= 462500) {
      federalTax = 74208 + (adjustedGrossPay - 364200) * 0.32;
    } else if (adjustedGrossPay <= 693750) {
      federalTax = 105664 + (adjustedGrossPay - 462500) * 0.35;
    } else {
      federalTax = 186601.5 + (adjustedGrossPay - 693750) * 0.37;
    }
  } else { // head of household
    if (adjustedGrossPay <= 15700) {
      federalTax = adjustedGrossPay * 0.10;
    } else if (adjustedGrossPay <= 59850) {
      federalTax = 1570 + (adjustedGrossPay - 15700) * 0.12;
    } else if (adjustedGrossPay <= 95350) {
      federalTax = 6868 + (adjustedGrossPay - 59850) * 0.22;
    } else if (adjustedGrossPay <= 182100) {
      federalTax = 14678 + (adjustedGrossPay - 95350) * 0.24;
    } else if (adjustedGrossPay <= 231250) {
      federalTax = 35498 + (adjustedGrossPay - 182100) * 0.32;
    } else if (adjustedGrossPay <= 578100) {
      federalTax = 51226 + (adjustedGrossPay - 231250) * 0.35;
    } else {
      federalTax = 172623.5 + (adjustedGrossPay - 578100) * 0.37;
    }
  }
  
  // Convert annual tax to per-paycheck (bi-weekly)
  federalTax = federalTax / 26;
  
  // State tax calculation (simplified)
  let stateTax = 0;
  switch (state) {
    case 'CA':
      stateTax = grossPay * 0.06; // Simplified CA tax rate
      break;
    case 'NY':
      stateTax = grossPay * 0.05; // Simplified NY tax rate
      break;
    case 'TX':
    case 'FL':
    case 'WA':
    case 'NV':
    case 'SD':
    case 'WY':
    case 'AK':
      stateTax = 0; // No state income tax
      break;
    default:
      stateTax = grossPay * 0.04; // Default state tax rate
  }
  
  // FICA taxes
  const socialSecurityWageBase = 160200; // 2023 wage base
  const annualizedGrossPay = grossPay * 26;
  const socialSecurityTax = Math.min(grossPay, socialSecurityWageBase / 26) * 0.062;
  const medicareTax = grossPay * 0.0145;
  
  // Additional Medicare tax for high earners
  const additionalMedicareTax = annualizedGrossPay > 200000 ? grossPay * 0.009 : 0;
  
  const totalTax = federalTax + stateTax + socialSecurityTax + medicareTax + additionalMedicareTax;
  
  return {
    federal: Math.round(federalTax * 100) / 100,
    state: Math.round(stateTax * 100) / 100,
    socialSecurity: Math.round(socialSecurityTax * 100) / 100,
    medicare: Math.round((medicareTax + additionalMedicareTax) * 100) / 100,
    total: Math.round(totalTax * 100) / 100
  };
}

/**
 * Calculate net pay after taxes and deductions
 * @param grossPay Gross pay amount
 * @param taxes Tax withholdings
 * @param preTaxDeductions Pre-tax deductions
 * @param postTaxDeductions Post-tax deductions
 * @returns Net pay amount
 */
export function calculateNetPay(
  grossPay: number,
  taxes: {
    federal: number;
    state: number;
    socialSecurity: number;
    medicare: number;
  },
  preTaxDeductions: number = 0,
  postTaxDeductions: number = 0
): number {
  const taxableIncome = grossPay - preTaxDeductions;
  const totalTaxes = taxes.federal + taxes.state + taxes.socialSecurity + taxes.medicare;
  const netPay = taxableIncome - totalTaxes - postTaxDeductions;
  
  return Math.max(0, Math.round(netPay * 100) / 100);
}

/**
 * Format currency amount
 * @param amount Amount to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Calculate overtime hours and pay
 * @param regularHours Regular hours worked
 * @param totalHours Total hours worked
 * @param hourlyRate Hourly rate
 * @returns Object with regular and overtime pay
 */
export function calculateOvertimePay(
  regularHours: number,
  totalHours: number,
  hourlyRate: number
): {
  regularPay: number;
  overtimePay: number;
  totalPay: number;
} {
  const overtimeHours = Math.max(0, totalHours - regularHours);
  const regularPay = regularHours * hourlyRate;
  const overtimePay = overtimeHours * hourlyRate * 1.5;
  const totalPay = regularPay + overtimePay;
  
  return {
    regularPay: Math.round(regularPay * 100) / 100,
    overtimePay: Math.round(overtimePay * 100) / 100,
    totalPay: Math.round(totalPay * 100) / 100
  };
}

/**
 * Calculate benefit deductions
 * @param benefits Array of benefit objects
 * @param payFrequency Pay frequency
 * @returns Object with pre-tax and post-tax deduction totals
 */
export function calculateBenefitDeductions(
  benefits: Array<{
    type: string;
    amount: number;
    frequency: 'per-paycheck' | 'monthly' | 'annual';
    isTaxable: boolean;
  }>,
  payFrequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly' = 'bi-weekly'
): {
  preTaxTotal: number;
  postTaxTotal: number;
  total: number;
} {
  let preTaxTotal = 0;
  let postTaxTotal = 0;
  
  benefits.forEach(benefit => {
    let amount = benefit.amount;
    
    // Adjust amount based on frequency
    if (benefit.frequency === 'monthly') {
      switch (payFrequency) {
        case 'weekly':
          amount /= 4.33; // Average weeks per month
          break;
        case 'bi-weekly':
          amount /= 2.17; // Average bi-weeks per month
          break;
        case 'semi-monthly':
          amount /= 2; // Exactly 2 pay periods per month
          break;
        // For monthly, no adjustment needed
      }
    } else if (benefit.frequency === 'annual') {
      switch (payFrequency) {
        case 'weekly':
          amount /= 52;
          break;
        case 'bi-weekly':
          amount /= 26;
          break;
        case 'semi-monthly':
          amount /= 24;
          break;
        case 'monthly':
          amount /= 12;
          break;
      }
    }
    
    // Add to appropriate total
    if (benefit.isTaxable) {
      postTaxTotal += amount;
    } else {
      preTaxTotal += amount;
    }
  });
  
  return {
    preTaxTotal: Math.round(preTaxTotal * 100) / 100,
    postTaxTotal: Math.round(postTaxTotal * 100) / 100,
    total: Math.round((preTaxTotal + postTaxTotal) * 100) / 100
  };
}

/**
 * Validate EIN (Employer Identification Number)
 * @param ein EIN to validate
 * @returns Boolean indicating if EIN is valid
 */
export function validateEIN(ein: string): boolean {
  // EIN format: XX-XXXXXXX
  const einRegex = /^\d{2}-\d{7}$/;
  return einRegex.test(ein);
}

/**
 * Validate SSN (Social Security Number)
 * @param ssn SSN to validate
 * @returns Boolean indicating if SSN is valid
 */
export function validateSSN(ssn: string): boolean {
  // SSN format: XXX-XX-XXXX
  const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
  
  if (!ssnRegex.test(ssn)) {
    return false;
  }
  
  // Additional validation rules
  const parts = ssn.split('-');
  const firstThree = parts[0];
  const middleTwo = parts[1];
  const lastFour = parts[2];
  
  // SSN cannot be all zeros in any group
  if (firstThree === '000' || middleTwo === '00' || lastFour === '0000') {
    return false;
  }
  
  // First three digits cannot be 666 or 900-999
  if (firstThree === '666' || (parseInt(firstThree) >= 900 && parseInt(firstThree) <= 999)) {
    return false;
  }
  
  return true;
}

/**
 * Generate a random transaction ID
 * @param prefix Optional prefix for the transaction ID
 * @returns Random transaction ID
 */
export function generateTransactionId(prefix: string = 'TX'): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param baseDelay Base delay in milliseconds
 * @returns Promise that resolves to the function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        // Calculate exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('All retries failed');
}