/**
 * Tax Cache 2024
 * Provides cached tax rates and brackets for faster calculations
 */

// Federal tax brackets for 2024
export const federalTaxBrackets = {
  single: [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182100, rate: 0.24 },
    { min: 182100, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 }
  ],
  married: [
    { min: 0, max: 22000, rate: 0.10 },
    { min: 22000, max: 89450, rate: 0.12 },
    { min: 89450, max: 190750, rate: 0.22 },
    { min: 190750, max: 364200, rate: 0.24 },
    { min: 364200, max: 462500, rate: 0.32 },
    { min: 462500, max: 693750, rate: 0.35 },
    { min: 693750, max: Infinity, rate: 0.37 }
  ],
  head: [
    { min: 0, max: 15700, rate: 0.10 },
    { min: 15700, max: 59850, rate: 0.12 },
    { min: 59850, max: 95350, rate: 0.22 },
    { min: 95350, max: 182100, rate: 0.24 },
    { min: 182100, max: 231250, rate: 0.32 },
    { min: 231250, max: 578100, rate: 0.35 },
    { min: 578100, max: Infinity, rate: 0.37 }
  ]
};

// State tax rates for 2024
export const stateTaxRates = {
  // States with no income tax
  'AK': 0,
  'FL': 0,
  'NV': 0,
  'SD': 0,
  'TN': 0,
  'TX': 0,
  'WA': 0,
  'WY': 0,
  
  // Flat tax states
  'CO': 0.0455,
  'IL': 0.0495,
  'IN': 0.0323,
  'KY': 0.045,
  'MA': 0.05,
  'MI': 0.0425,
  'NH': 0.05, // Only on interest and dividends
  'NC': 0.0475,
  'PA': 0.0307,
  'UT': 0.0485,
  
  // Progressive tax states (simplified with average rates)
  'AL': 0.05,
  'AZ': 0.0454,
  'AR': 0.055,
  'CA': 0.08,
  'CT': 0.06,
  'DE': 0.066,
  'GA': 0.0575,
  'HI': 0.07,
  'ID': 0.06,
  'IA': 0.06,
  'KS': 0.057,
  'LA': 0.0425,
  'ME': 0.0715,
  'MD': 0.05,
  'MN': 0.0785,
  'MS': 0.05,
  'MO': 0.054,
  'MT': 0.0675,
  'NE': 0.0684,
  'NJ': 0.06375,
  'NM': 0.059,
  'NY': 0.065,
  'ND': 0.0290,
  'OH': 0.0399,
  'OK': 0.0475,
  'OR': 0.0875,
  'RI': 0.0599,
  'SC': 0.07,
  'VT': 0.066,
  'VA': 0.0575,
  'WV': 0.065,
  'WI': 0.0654,
  'DC': 0.0895 // District of Columbia
};

// FICA tax rates for 2024
export const ficaTaxRates = {
  socialSecurity: {
    rate: 0.062,
    wageBase: 160200
  },
  medicare: {
    rate: 0.0145,
    additionalRate: 0.009,
    additionalThreshold: 200000
  }
};

// Standard deductions for 2024
export const standardDeductions = {
  single: 13850,
  married: 27700,
  head: 20800
};

// Personal exemption (currently $0 due to TCJA)
export const personalExemption = 0;

// Tax credits
export const taxCredits = {
  childTaxCredit: 2000,
  childAndDependentCare: {
    maxExpenses: 3000, // per qualifying person
    maxCredit: 1050 // per qualifying person
  },
  earnedIncome: {
    // Complex calculation, simplified values
    maxNoChildren: 560,
    maxOneChild: 3733,
    maxTwoChildren: 6164,
    maxThreeOrMoreChildren: 6935
  }
};

// State withholding allowances
export const stateWithholdingAllowances = {
  'CA': 134.20, // California allowance value
  'NY': 1000.00, // New York allowance value
  // Add more states as needed
};

// Supplemental wage rates
export const supplementalWageRates = {
  federal: 0.22, // Federal supplemental wage rate
  state: {
    'CA': 0.1023, // California
    'NY': 0.09, // New York
    // Add more states as needed
  }
};

// Unemployment tax rates (employer paid)
export const unemploymentTaxRates = {
  federal: 0.006, // FUTA rate
  state: {
    'CA': 0.034, // California SUI rate (average)
    'NY': 0.038, // New York SUI rate (average)
    // Add more states as needed
  }
};

// Tax filing deadlines
export const taxFilingDeadlines = {
  w2Distribution: '2025-01-31',
  form941: ['2024-04-30', '2024-07-31', '2024-10-31', '2025-01-31'],
  form940: '2025-01-31',
  form1099: '2025-01-31',
  formW2: '2025-01-31',
  stateWithholding: {
    'CA': ['2024-04-30', '2024-07-31', '2024-10-31', '2025-01-31'],
    'NY': ['2024-04-30', '2024-07-31', '2024-10-31', '2025-01-31'],
    // Add more states as needed
  }
};

// Cache expiration timestamp
export const cacheLastUpdated = '2024-01-15T00:00:00Z';
export const cacheExpiresAt = '2025-01-15T00:00:00Z';

/**
 * Check if the tax cache is still valid
 * @returns Boolean indicating if cache is valid
 */
export function isCacheValid(): boolean {
  const now = new Date();
  const expiresAt = new Date(cacheExpiresAt);
  return now < expiresAt;
}

/**
 * Get federal tax bracket for a given income and filing status
 * @param income Taxable income
 * @param filingStatus Filing status
 * @returns Tax bracket object
 */
export function getFederalTaxBracket(income: number, filingStatus: 'single' | 'married' | 'head'): { min: number; max: number; rate: number } {
  const brackets = federalTaxBrackets[filingStatus];
  return brackets.find(bracket => income > bracket.min && income <= bracket.max) || brackets[brackets.length - 1];
}

/**
 * Calculate federal tax using cached brackets
 * @param income Taxable income
 * @param filingStatus Filing status
 * @returns Federal tax amount
 */
export function calculateFederalTaxFromCache(income: number, filingStatus: 'single' | 'married' | 'head'): number {
  const brackets = federalTaxBrackets[filingStatus];
  let tax = 0;
  let remainingIncome = income;
  
  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const prevMax = i > 0 ? brackets[i-1].max : 0;
    
    if (income <= prevMax) break;
    
    const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
    tax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
    
    if (remainingIncome <= 0) break;
  }
  
  return Math.round(tax * 100) / 100;
}

/**
 * Get state tax rate from cache
 * @param state State code
 * @returns State tax rate
 */
export function getStateTaxRate(state: string): number {
  return stateTaxRates[state] || 0;
}

/**
 * Calculate state tax using cached rates
 * @param income Taxable income
 * @param state State code
 * @returns State tax amount
 */
export function calculateStateTaxFromCache(income: number, state: string): number {
  const rate = getStateTaxRate(state);
  return Math.round(income * rate * 100) / 100;
}