import { supabase } from '../lib/supabase';
import { CircuitBreaker, retry } from '../lib/resilience';

interface TaxRates {
  federal: number;
  state: number;
  social: number;
  medicare: number;
  total: number;
}

// Create circuit breakers for critical operations
const taxRatesCircuitBreaker = new CircuitBreaker(5, 60000, 30000);

/**
 * Calculate payroll taxes for a given gross pay amount and state
 */
export async function calculatePayrollTaxes(grossPay: number, state: string): Promise<TaxRates> {
  try {
    // Use circuit breaker to protect against API failures
    return await taxRatesCircuitBreaker.execute(async () => {
      // Get current tax rates from the database
      const { data: federalRates, error: federalError } = await supabase
        .from('tax_rates')
        .select('*')
        .eq('type', 'federal')
        .lte('effective_date', new Date().toISOString())
        .order('effective_date', { ascending: false })
        .limit(1);

      if (federalError) throw federalError;

      const { data: stateRates, error: stateError } = await supabase
        .from('tax_rates')
        .select('*')
        .eq('type', 'state')
        .eq('state', state)
        .lte('effective_date', new Date().toISOString())
        .order('effective_date', { ascending: false })
        .limit(1);

      if (stateError) throw stateError;

      // Calculate federal tax
      const federalTax = calculateFederalTax(grossPay, federalRates?.[0]);

      // Calculate state tax
      const stateTax = calculateStateTax(grossPay, stateRates?.[0]);

      // Calculate social security (6.2% up to wage base)
      const socialSecurityWageBase = 160200; // 2024 wage base
      const socialSecurity = Math.min(grossPay, socialSecurityWageBase) * 0.062;

      // Calculate Medicare (1.45% on all wages)
      const medicare = grossPay * 0.0145;

      // Additional Medicare tax for high earners (0.9% on wages over $200,000)
      const additionalMedicare = grossPay > 200000 ? (grossPay - 200000) * 0.009 : 0;

      const total = federalTax + stateTax + socialSecurity + medicare + additionalMedicare;

      return {
        federal: federalTax,
        state: stateTax,
        social: socialSecurity,
        medicare: medicare + additionalMedicare,
        total
      };
    });
  } catch (error) {
    console.error('Error calculating payroll taxes:', error);
    // Return default minimum rates if there's an error
    return {
      federal: grossPay * 0.1, // 10% federal
      state: grossPay * 0.05,  // 5% state
      social: grossPay * 0.062, // 6.2% social security
      medicare: grossPay * 0.0145, // 1.45% medicare
      total: grossPay * 0.22645 // Total of above rates
    };
  }
}

/**
 * Get tax rates from the database with retry logic
 */
export async function getTaxRates(date: Date = new Date()): Promise<any[]> {
  return retry(async () => {
    const { data, error } = await supabase
      .from('tax_rates')
      .select(`
        *,
        brackets:tax_brackets(*)
      `)
      .lte('effective_date', date.toISOString())
      .or(`expiration_date.is.null,expiration_date.gt.${date.toISOString()}`);

    if (error) throw error;
    return data || [];
  }, 3, 1000);
}

/**
 * Calculate taxes for a given amount
 */
export async function calculateTaxes(amount: number, state: string): Promise<TaxRates> {
  try {
    // Use circuit breaker to protect against API failures
    return await taxRatesCircuitBreaker.execute(async () => {
      const taxRates = await getTaxRates();
      
      // Find federal tax rate
      const federalTaxRate = taxRates.find(rate => 
        rate.type === 'federal' && 
        rate.calculation_method === 'bracket'
      );
      
      // Find state tax rate
      const stateTaxRate = taxRates.find(rate => 
        rate.type === 'state' && 
        rate.state === state && 
        rate.calculation_method === 'bracket'
      );
      
      // Find social security tax rate
      const socialSecurityTaxRate = taxRates.find(rate => 
        rate.type === 'social_security' && 
        rate.calculation_method === 'percentage'
      );
      
      // Find medicare tax rate
      const medicareTaxRate = taxRates.find(rate => 
        rate.type === 'medicare' && 
        rate.calculation_method === 'percentage'
      );
      
      // Calculate federal tax
      const federalTax = federalTaxRate 
        ? calculateTax(amount, federalTaxRate) 
        : amount * 0.15; // Default fallback rate
      
      // Calculate state tax
      const stateTax = stateTaxRate 
        ? calculateTax(amount, stateTaxRate) 
        : amount * 0.05; // Default fallback rate
      
      // Calculate social security tax (6.2% up to wage base limit)
      const socialSecurityWageBase = 160200; // 2024 wage base
      const socialSecurityTax = socialSecurityTaxRate 
        ? Math.min(amount, socialSecurityWageBase) * (socialSecurityTaxRate.rate || 0.062)
        : Math.min(amount, socialSecurityWageBase) * 0.062;
      
      // Calculate medicare tax (1.45% with no wage base)
      const medicareTax = medicareTaxRate 
        ? amount * (medicareTaxRate.rate || 0.0145)
        : amount * 0.0145;
      
      return {
        federal: federalTax,
        state: stateTax,
        social: socialSecurityTax,
        medicare: medicareTax,
        total: federalTax + stateTax + socialSecurityTax + medicareTax
      };
    });
  } catch (error) {
    console.error('Error calculating taxes:', error);
    // Return default minimum rates if there's an error
    return {
      federal: amount * 0.1, // 10% federal
      state: amount * 0.05,  // 5% state
      social: amount * 0.062, // 6.2% social security
      medicare: amount * 0.0145, // 1.45% medicare
      total: amount * 0.22645 // Total of above rates
    };
  }
}

/**
 * Get the current state of the tax rates circuit breaker
 */
export function getTaxCircuitBreakerState(): 'closed' | 'open' | 'half-open' {
  return taxRatesCircuitBreaker.getState();
}

/**
 * Reset the tax rates circuit breaker
 */
export function resetTaxCircuitBreaker(): void {
  taxRatesCircuitBreaker.reset();
}

/**
 * Calculate tax based on tax brackets
 */
function calculateFederalTax(grossPay: number, rateInfo: any): number {
  if (!rateInfo) {
    // Default to 2024 tax brackets if no rates found
    const brackets = [
      { threshold: 11600, rate: 0.10 },
      { threshold: 47150, rate: 0.12 },
      { threshold: 100525, rate: 0.22 },
      { threshold: 191950, rate: 0.24 },
      { threshold: 243725, rate: 0.32 },
      { threshold: 609350, rate: 0.35 },
      { threshold: Infinity, rate: 0.37 }
    ];

    let tax = 0;
    let remainingIncome = grossPay;
    let previousThreshold = 0;

    for (const bracket of brackets) {
      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.threshold - previousThreshold
      );
      
      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
      
      if (remainingIncome <= 0) break;
      previousThreshold = bracket.threshold;
    }

    return tax;
  }

  // Use database rates if available
  return grossPay * (rateInfo.rate || 0.1); // Default to 10% if rate not specified
}

/**
 * Calculate state tax based on state-specific rules
 */
function calculateStateTax(grossPay: number, rateInfo: any): number {
  if (!rateInfo) {
    // Default to flat 5% if no state rate found
    return grossPay * 0.05;
  }

  // Use database rates if available
  return grossPay * (rateInfo.rate || 0.05); // Default to 5% if rate not specified
}

/**
 * Calculate tax for a given amount using specified tax rate
 */
export function calculateTax(amount: number, taxRate: any): number {
  switch (taxRate.calculation_method) {
    case 'flat':
      return taxRate.flat_amount || 0;
    
    case 'percentage':
      return amount * (taxRate.rate || 0);
    
    case 'bracket':
      return calculateTaxWithBrackets(amount, taxRate.brackets || []);
  }
}

/**
 * Calculate tax using tax brackets
 */
function calculateTaxWithBrackets(amount: number, brackets: any[]): number {
  if (amount <= 0 || !brackets.length) return 0;
  
  let tax = 0;
  const sortedBrackets = [...brackets].sort((a, b) => a.threshold_low - b.threshold_low);
  
  for (let i = 0; i < sortedBrackets.length; i++) {
    const bracket = sortedBrackets[i];
    
    if (amount <= bracket.threshold_low) break;
    
    const bracketMax = bracket.threshold_high || Infinity;
    const taxableInBracket = Math.min(amount, bracketMax) - bracket.threshold_low;
    
    if (taxableInBracket > 0) {
      tax += taxableInBracket * bracket.rate;
    }
    
    if (!bracket.threshold_high || amount <= bracket.threshold_high) break;
  }
  
  return tax;
}