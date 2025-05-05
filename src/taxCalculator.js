// This file contains tax calculation logic imported from the Tax repo

/**
 * Calculates tax based on income and filing status
 * @param {number} income - Taxable income
 * @param {string} filingStatus - Filing status (single, married, head)
 * @returns {number} - Calculated tax amount
 */
function calculateTax(income, filingStatus = 'single') {
  // Validate inputs
  if (typeof income !== 'number' || income < 0) {
    throw new Error('Income must be a non-negative number');
  }
  
  if (!['single', 'married', 'head'].includes(filingStatus)) {
    throw new Error('Filing status must be single, married, or head');
  }
  
  // Tax brackets for 2024
  const brackets = {
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
  
  // Calculate tax using progressive brackets
  let tax = 0;
  const applicableBrackets = brackets[filingStatus];
  
  for (let i = 0; i < applicableBrackets.length; i++) {
    const bracket = applicableBrackets[i];
    
    if (income > bracket.min) {
      const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
      tax += taxableInBracket * bracket.rate;
    }
    
    if (income <= bracket.max) break;
  }
  
  return Math.round(tax * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculates state tax based on income and state
 * @param {number} income - Taxable income
 * @param {string} state - State code (e.g., 'CA', 'NY')
 * @returns {number} - Calculated state tax amount
 */
function calculateStateTax(income, state) {
  // Validate inputs
  if (typeof income !== 'number' || income < 0) {
    throw new Error('Income must be a non-negative number');
  }
  
  if (typeof state !== 'string' || state.length !== 2) {
    throw new Error('State must be a valid two-letter code');
  }
  
  // States with no income tax
  const noTaxStates = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY'];
  if (noTaxStates.includes(state)) {
    return 0;
  }
  
  // Simplified state tax rates (for demonstration)
  const stateRates = {
    'CA': 0.093, // California ~9.3%
    'NY': 0.065, // New York ~6.5%
    'IL': 0.0495, // Illinois 4.95%
    'PA': 0.0307, // Pennsylvania 3.07%
    // Default rate for other states
    'DEFAULT': 0.05 // 5%
  };
  
  const rate = stateRates[state] || stateRates.DEFAULT;
  return Math.round(income * rate * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculates FICA taxes (Social Security and Medicare)
 * @param {number} income - Gross income
 * @param {number} ytdEarnings - Year-to-date earnings for Social Security cap
 * @returns {Object} - Object with Social Security and Medicare tax amounts
 */
function calculateFICA(income, ytdEarnings = 0) {
  // Validate inputs
  if (typeof income !== 'number' || income < 0) {
    throw new Error('Income must be a non-negative number');
  }
  
  if (typeof ytdEarnings !== 'number' || ytdEarnings < 0) {
    throw new Error('YTD earnings must be a non-negative number');
  }
  
  // 2024 constants
  const ssWageBase = 160200; // Social Security wage base
  const ssRate = 0.062; // 6.2%
  const medicareRate = 0.0145; // 1.45%
  const additionalMedicareThreshold = 200000; // Additional Medicare tax threshold
  const additionalMedicareRate = 0.009; // 0.9%
  
  // Calculate Social Security tax (subject to wage base)
  const ssTaxableWages = Math.max(0, Math.min(income, ssWageBase - ytdEarnings));
  const socialSecurityTax = ssTaxableWages * ssRate;
  
  // Calculate Medicare tax (no wage base)
  let medicareTax = income * medicareRate;
  
  // Additional Medicare tax for high earners
  if (ytdEarnings > additionalMedicareThreshold) {
    medicareTax += income * additionalMedicareRate;
  } else if (ytdEarnings + income > additionalMedicareThreshold) {
    const additionalTaxableWages = ytdEarnings + income - additionalMedicareThreshold;
    medicareTax += additionalTaxableWages * additionalMedicareRate;
  }
  
  return {
    socialSecurity: Math.round(socialSecurityTax * 100) / 100,
    medicare: Math.round(medicareTax * 100) / 100
  };
}

// Export the functions
module.exports = {
  calculateTax,
  calculateStateTax,
  calculateFICA
};