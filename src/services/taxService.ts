import { calculatePayrollTaxes, calculateTaxes, getTaxRates, getTaxCircuitBreakerState, resetTaxCircuitBreaker } from '../microservices/tax';

/**
 * TaxService class provides a unified interface to all tax-related functionality
 */
export class TaxService {
  /**
   * Calculate payroll taxes for a given gross pay amount and state
   * @param grossPay Gross pay amount
   * @param state State code
   * @returns Tax calculation result
   */
  static async calculatePayrollTaxes(grossPay: number, state: string) {
    return calculatePayrollTaxes(grossPay, state);
  }

  /**
   * Calculate taxes for a given amount
   * @param amount Amount to calculate taxes for
   * @param state State code
   * @returns Tax calculation result
   */
  static async calculateTaxes(amount: number, state: string) {
    return calculateTaxes(amount, state);
  }

  /**
   * Get tax rates from the database
   * @param date Date to get rates for
   * @returns Array of tax rates
   */
  static async getTaxRates(date: Date = new Date()) {
    return getTaxRates(date);
  }

  /**
   * Get the current state of the tax rates circuit breaker
   * @returns Circuit breaker state
   */
  static getTaxCircuitBreakerState() {
    return getTaxCircuitBreakerState();
  }

  /**
   * Reset the tax rates circuit breaker
   */
  static resetTaxCircuitBreaker() {
    resetTaxCircuitBreaker();
  }
}