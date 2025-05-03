declare module '@paysurity/admin-ui/tax-service' {
  /**
   * Calculate payroll taxes for a given gross pay amount and state code
   * @param grossPay The gross pay amount
   * @param stateCode The state code (e.g., 'CA', 'NY')
   * @returns An object containing the calculated taxes
   */
  export function calculatePayrollTaxes(
    grossPay: number,
    stateCode: string
  ): Promise<{
    federal: number;
    state: number;
    social: number;
    medicare: number;
    total: number;
  }>;
}