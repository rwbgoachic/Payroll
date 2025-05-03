import { faker } from '@faker-js/faker';

describe('Admin Interface', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123');
  });

  describe('Company Settings', () => {
    it('allows updating company information', () => {
      cy.visit('/app/settings');
      
      // Update company info
      cy.get('input[name="companyName"]').clear().type('Updated Company Name');
      cy.get('input[name="address"]').clear().type('123 New Street');
      cy.get('input[name="city"]').clear().type('New City');
      cy.get('select[name="state"]').select('CA');
      cy.get('input[name="zipCode"]').clear().type('12345');
      
      // Save changes
      cy.get('button').contains('Save Changes').click();
      
      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain', 'Company information updated successfully');
    });

    it('validates required fields', () => {
      cy.visit('/app/settings');
      
      // Clear required fields
      cy.get('input[name="companyName"]').clear();
      cy.get('input[name="ein"]').clear();
      
      // Try to save
      cy.get('button').contains('Save Changes').click();
      
      // Verify validation messages
      cy.contains('Company name is required');
      cy.contains('EIN is required');
    });
  });

  describe('User Management', () => {
    it('can create new users', () => {
      cy.visit('/app/settings/users');
      
      // Click add user button
      cy.get('button').contains('Add User').click();
      
      // Fill out user form
      const email = faker.internet.email();
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type(email);
      cy.get('select[name="role"]').select('employee');
      
      // Submit form
      cy.get('button').contains('Create User').click();
      
      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain', 'User created successfully');
      
      // Verify user appears in list
      cy.get('table tbody').should('contain', email);
    });

    it('can modify user roles', () => {
      cy.visit('/app/settings/users');
      
      // Find first user and click edit
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[aria-label="Edit user"]').click();
      });
      
      // Change role
      cy.get('select[name="role"]').select('manager');
      
      // Save changes
      cy.get('button').contains('Save Changes').click();
      
      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain', 'User updated successfully');
    });
  });

  describe('System Tests', () => {
    it('can run system tests', () => {
      cy.visit('/app/settings/tests');
      
      // Start tests
      cy.get('button').contains('Run All Tests').click();
      
      // Verify test execution
      cy.get('[data-testid="test-status"]').should('contain', 'Running');
      
      // Wait for completion
      cy.get('[data-testid="test-results"]', { timeout: 30000 })
        .should('be.visible');
      
      // Verify test results displayed
      cy.get('[data-testid="test-summary"]')
        .should('contain', 'Tests completed');
    });

    it('shows detailed test results', () => {
      cy.visit('/app/settings/tests');
      cy.get('button').contains('Run All Tests').click();
      
      // Wait for completion
      cy.get('[data-testid="test-results"]', { timeout: 30000 })
        .should('be.visible');
      
      // Verify individual test results
      cy.get('[data-testid="test-case"]').should('have.length.at.least', 1);
      cy.get('[data-testid="test-case"]').first().within(() => {
        cy.get('[data-testid="test-name"]').should('not.be.empty');
        cy.get('[data-testid="test-status"]').should('be.visible');
        cy.get('[data-testid="test-duration"]').should('be.visible');
      });
    });
  });
});