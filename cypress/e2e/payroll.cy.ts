describe('Payroll Processing', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123');
  });

  it('processes a payroll run successfully', () => {
    cy.visit('/app/payroll');
    
    // Start new payroll run
    cy.get('button').contains('Run Payroll').click();
    
    // Verify payroll period selection
    cy.get('select[name="payroll-period"]').should('exist');
    cy.get('select[name="payroll-period"]').select(1);
    
    // Verify employee list
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    
    // Check calculations
    cy.get('[data-testid="total-gross-pay"]').should('not.be.empty');
    cy.get('[data-testid="total-taxes"]').should('not.be.empty');
    cy.get('[data-testid="total-deductions"]').should('not.be.empty');
    cy.get('[data-testid="total-net-pay"]').should('not.be.empty');
    
    // Submit payroll
    cy.get('button').contains('Submit Payroll').click();
    
    // Verify success message
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Payroll processed successfully');
  });

  it('validates payroll data before submission', () => {
    cy.visit('/app/payroll');
    
    // Try to submit without selecting period
    cy.get('button').contains('Run Payroll').click();
    cy.get('button').contains('Submit Payroll').click();
    
    // Verify error message
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Please select a payroll period');
  });

  it('shows detailed employee calculations', () => {
    cy.visit('/app/payroll');
    cy.get('button').contains('Run Payroll').click();
    
    // Select first employee
    cy.get('table tbody tr').first().click();
    
    // Verify calculation details
    cy.get('[data-testid="employee-details"]').within(() => {
      cy.get('[data-testid="regular-pay"]').should('exist');
      cy.get('[data-testid="overtime-pay"]').should('exist');
      cy.get('[data-testid="federal-tax"]').should('exist');
      cy.get('[data-testid="state-tax"]').should('exist');
      cy.get('[data-testid="social-security"]').should('exist');
      cy.get('[data-testid="medicare"]').should('exist');
      cy.get('[data-testid="deductions"]').should('exist');
      cy.get('[data-testid="net-pay"]').should('exist');
    });
  });
});