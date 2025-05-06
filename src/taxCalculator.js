// Tax Calculator Library
// Provides tax calculation functions with validation

/**
 * Validates a Social Security Number (SSN) format
 * @param ssn The SSN to validate
 * @throws Error if SSN format is invalid
 */
export function validateSSN(ssn: string): void {
  if (!/^\d{3}-\d{2}-\d{4}$/.test(ssn)) throw 'Invalid SSN';
}

/**
 * Calculate federal tax withholding
 * @param income Taxable income
 * @param filingStatus Filing status (single, married, head)
 * @param allowances Number of allowances
 * @returns Federal tax amount
 */
export function calculateFederalTax(
  income: number,
  filingStatus: 'single' | 'married' | 'head',
  allowances: number = 0
): number {
  // Validate inputs
  if (income < 0) throw new Error('Income cannot be negative');
  if (allowances < 0) throw new Error('Allowances cannot be negative');
  
  // Adjust income based on allowances
  const adjustedIncome = Math.max(0, income - (allowances * 4300));
  
  // Calculate tax based on filing status and brackets
  let tax = 0;
  
  if (filingStatus === 'single') {
    if (adjustedIncome <= 11000) {
      tax = adjustedIncome * 0.10;
    } else if (adjustedIncome <= 44725) {
      tax = 1100 + (adjustedIncome - 11000) * 0.12;
    } else if (adjustedIncome <= 95375) {
      tax = 5147 + (adjustedIncome - 44725) * 0.22;
    } else if (adjustedIncome <= 182100) {
      tax = 16290 + (adjustedIncome - 95375) * 0.24;
    } else if (adjustedIncome <= 231250) {
      tax = 37104 + (adjustedIncome - 182100) * 0.32;
    } else if (adjustedIncome <= 578125) {
      tax = 52832 + (adjustedIncome - 231250) * 0.35;
    } else {
      tax = 174238.25 + (adjustedIncome - 578125) * 0.37;
    }
  } else if (filingStatus === 'married') {
    if (adjustedIncome <= 22000) {
      tax = adjustedIncome * 0.10;
    } else if (adjustedIncome <= 89450) {
      tax = 2200 + (adjustedIncome - 22000) * 0.12;
    } else if (adjustedIncome <= 190750) {
      tax = 10294 + (adjustedIncome - 89450) * 0.22;
    } else if (adjustedIncome <= 364200) {
      tax = 32580 + (adjustedIncome - 190750) * 0.24;
    } else if (adjustedIncome <= 462500) {
      tax = 74208 + (adjustedIncome - 364200) * 0.32;
    } else if (adjustedIncome <= 693750) {
      tax = 105664 + (adjustedIncome - 462500) * 0.35;
    } else {
      tax = 186601.5 + (adjustedIncome - 693750) * 0.37;
    }
  } else { // head of household
    if (adjustedIncome <= 15700) {
      tax = adjustedIncome * 0.10;
    } else if (adjustedIncome <= 59850) {
      tax = 1570 + (adjustedIncome - 15700) * 0.12;
    } else if (adjustedIncome <= 95350) {
      tax = 6868 + (adjustedIncome - 59850) * 0.22;
    } else if (adjustedIncome <= 182100) {
      tax = 14678 + (adjustedIncome - 95350) * 0.24;
    } else if (adjustedIncome <= 231250) {
      tax = 35498 + (adjustedIncome - 182100) * 0.32;
    } else if (adjustedIncome <= 578100) {
      tax = 51226 + (adjustedIncome - 231250) * 0.35;
    } else {
      tax = 172623.5 + (adjustedIncome - 578100) * 0.37;
    }
  }
  
  return Math.round(tax * 100) / 100;
}

/**
 * Calculate state tax withholding
 * @param income Taxable income
 * @param state State code
 * @returns State tax amount
 */
export function calculateStateTax(income: number, state: string): number {
  // Validate inputs
  if (income < 0) throw new Error('Income cannot be negative');
  if (!state || state.length !== 2) throw new Error('Invalid state code');
  
  // States with no income tax
  const noTaxStates = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY'];
  if (noTaxStates.includes(state)) {
    return 0;
  }
  
  // Calculate state tax (simplified)
  let taxRate = 0.05; // Default 5%
  
  switch (state) {
    case 'CA':
      taxRate = 0.08; // California ~8%
      break;
    case 'NY':
      taxRate = 0.065; // New York ~6.5%
      break;
    case 'IL':
      taxRate = 0.0495; // Illinois 4.95%
      break;
    case 'PA':
      taxRate = 0.0307; // Pennsylvania 3.07%
      break;
    // Add more states as needed
  }
  
  return Math.round(income * taxRate * 100) / 100;
}

/**
 * Calculate FICA taxes (Social Security and Medicare)
 * @param income Gross income
 * @param ytdEarnings Year-to-date earnings for Social Security cap
 * @returns Object with Social Security and Medicare tax amounts
 */
export function calculateFICA(income: number, ytdEarnings: number = 0): { socialSecurity: number; medicare: number } {
  // Validate inputs
  if (income < 0) throw new Error('Income cannot be negative');
  if (ytdEarnings < 0) throw new Error('YTD earnings cannot be negative');
  
  // Social Security (6.2% up to wage base)
  const ssWageBase = 160200; // 2024 wage base
  const ssTaxableWages = Math.max(0, Math.min(income, ssWageBase - ytdEarnings));
  const socialSecurity = ssTaxableWages * 0.062;
  
  // Medicare (1.45% on all wages)
  let medicare = income * 0.0145;
  
  // Additional Medicare Tax (0.9% on wages over $200,000)
  if (ytdEarnings > 200000) {
    medicare += income * 0.009;
  } else if (ytdEarnings + income > 200000) {
    const additionalTaxableWages = ytdEarnings + income - 200000;
    medicare += additionalTaxableWages * 0.009;
  }
  
  return {
    socialSecurity: Math.round(socialSecurity * 100) / 100,
    medicare: Math.round(medicare * 100) / 100
  };
}

if (!/^\d{3}-\d{2}-\d{4}$/.test(ssn)) throw 'Invalid SSN';