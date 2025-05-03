describe('Benefits Management', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123');
  });

  it('allows adding new benefit plans', () => {
    cy.visit('/app/benefits/plans');
    
    // Add new plan
    cy.get('button').contains('Add Plan').click();
    
    // Fill out plan form
    cy.get('select[name="type"]').select('health');
    cy.get('input[name="name"]').type('Premium Health Plan 2025');
    cy.get('textarea[name="description"]').type('Comprehensive health coverage');
    cy.get('input[name="provider"]').type('Blue Cross');
    cy.get('input[name="plan_year"]').type('2025');
    cy.get('input[name="effective_date"]').type('2025-01-01');
    
    // Submit plan
    cy.get('button').contains('Save Plan').click();
    
    // Verify success
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Benefit plan created successfully');
    
    // Verify plan appears in list
    cy.get('table tbody').should('contain', 'Premium Health Plan 2025');
  });

  it('allows employees to enroll in benefits', () => {
    cy.login('employee@example.com', 'password123');
    cy.visit('/app/benefits/enroll');
    
    // Select a plan
    cy.get('table tbody tr').first().within(() => {
      cy.get('button').contains('Enroll').click();
    });
    
    // Choose coverage level
    cy.get('select[name="coverage_level"]').select('individual');
    
    // Submit enrollment
    cy.get('button').contains('Confirm Enrollment').click();
    
    // Verify success
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Enrollment successful');
  });

  it('calculates correct benefit deductions', () => {
    cy.visit('/app/benefits/deductions');
    
    // Select an employee
    cy.get('select[name="employee"]').select(1);
    
    // Verify deduction calculations
    cy.get('[data-testid="benefit-deductions"]').within(() => {
      cy.get('[data-testid="health-premium"]').should('not.be.empty');
      cy.get('[data-testid="dental-premium"]').should('not.be.empty');
      cy.get('[data-testid="vision-premium"]').should('not.be.empty');
      cy.get('[data-testid="total-deductions"]').should('not.be.empty');
    });
  });
});