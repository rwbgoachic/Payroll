describe('Employee Portal', () => {
  beforeEach(() => {
    cy.login('employee@example.com', 'password123');
  });

  describe('Dashboard', () => {
    it('shows employee information', () => {
      cy.visit('/employee');
      
      // Verify personal info section
      cy.get('[data-testid="personal-info"]').within(() => {
        cy.get('[data-testid="employee-name"]').should('not.be.empty');
        cy.get('[data-testid="employee-id"]').should('not.be.empty');
        cy.get('[data-testid="department"]').should('not.be.empty');
        cy.get('[data-testid="position"]').should('not.be.empty');
      });
      
      // Verify quick actions
      cy.get('[data-testid="quick-actions"]').should('be.visible');
    });

    it('displays recent pay information', () => {
      cy.visit('/employee');
      
      // Check recent paycheck
      cy.get('[data-testid="recent-pay"]').within(() => {
        cy.get('[data-testid="pay-date"]').should('not.be.empty');
        cy.get('[data-testid="gross-pay"]').should('not.be.empty');
        cy.get('[data-testid="net-pay"]').should('not.be.empty');
      });
    });
  });

  describe('Pay History', () => {
    it('shows pay history with details', () => {
      cy.visit('/employee/pay-history');
      
      // Verify pay history table
      cy.get('table tbody tr').should('have.length.at.least', 1);
      
      // Check pay stub details
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="pay-stub-details"]').within(() => {
        cy.get('[data-testid="earnings"]').should('be.visible');
        cy.get('[data-testid="taxes"]').should('be.visible');
        cy.get('[data-testid="deductions"]').should('be.visible');
      });
    });

    it('allows downloading pay stubs', () => {
      cy.visit('/employee/pay-history');
      
      // Click download button for first pay stub
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[aria-label="Download pay stub"]').click();
      });
      
      // Verify download started
      cy.get('[data-testid="download-status"]')
        .should('be.visible')
        .and('contain', 'Download started');
    });
  });

  describe('Benefits', () => {
    it('shows current benefits enrollment', () => {
      cy.visit('/employee/benefits');
      
      // Verify benefits sections
      cy.get('[data-testid="health-benefits"]').should('be.visible');
      cy.get('[data-testid="dental-benefits"]').should('be.visible');
      cy.get('[data-testid="vision-benefits"]').should('be.visible');
      
      // Check coverage details
      cy.get('[data-testid="coverage-details"]').within(() => {
        cy.get('[data-testid="coverage-level"]').should('not.be.empty');
        cy.get('[data-testid="coverage-cost"]').should('not.be.empty');
      });
    });

    it('allows updating beneficiaries', () => {
      cy.visit('/employee/benefits/beneficiaries');
      
      // Add new beneficiary
      cy.get('button').contains('Add Beneficiary').click();
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="relationship"]').type('Spouse');
      cy.get('input[name="percentage"]').type('100');
      
      // Save changes
      cy.get('button').contains('Save').click();
      
      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain', 'Beneficiary added successfully');
    });
  });

  describe('Time Off', () => {
    it('shows time off balances', () => {
      cy.visit('/employee/time-off');
      
      // Verify balances
      cy.get('[data-testid="vacation-balance"]').should('not.be.empty');
      cy.get('[data-testid="sick-balance"]').should('not.be.empty');
      cy.get('[data-testid="personal-balance"]').should('not.be.empty');
    });

    it('allows requesting time off', () => {
      cy.visit('/employee/time-off');
      
      // Submit time off request
      cy.get('button').contains('Request Time Off').click();
      cy.get('input[name="start_date"]').type('2025-06-01');
      cy.get('input[name="end_date"]').type('2025-06-05');
      cy.get('select[name="type"]').select('vacation');
      cy.get('textarea[name="notes"]').type('Summer vacation');
      
      // Submit request
      cy.get('button').contains('Submit Request').click();
      
      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain', 'Time off request submitted');
    });
  });
});