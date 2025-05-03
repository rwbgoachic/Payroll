import { faker } from '@faker-js/faker';

describe('Payroll Disbursement Flow', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123');
  });

  it('processes payroll with wallet disbursement', () => {
    // Mock the wallet balance to be sufficient
    cy.intercept('GET', '**/employer_wallets*', {
      statusCode: 200,
      body: {
        id: '1',
        company_id: '1',
        balance: 1000000, // Large balance to ensure wallet transfer
        currency: 'USD',
        updated_at: new Date().toISOString()
      }
    }).as('getWallet');

    // Mock the wallet transfer
    cy.intercept('POST', '**/rpc/transfer_funds', {
      statusCode: 200,
      body: {
        transaction_id: `WALLET-${Date.now()}`
      }
    }).as('transferFunds');

    // Visit the payroll page
    cy.visit('/app/payroll');
    
    // Start new payroll run
    cy.get('button').contains('Run Payroll').click();
    
    // Select a payroll period
    cy.get('select[name="payroll-period"]').select(1);
    
    // Verify employee list is loaded
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    
    // Submit payroll
    cy.get('button').contains('Submit Payroll').click();
    
    // Wait for the wallet check and transfer
    cy.wait('@getWallet');
    cy.wait('@transferFunds');
    
    // Verify success message
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Payroll processed successfully');
    
    // Verify disbursement method is shown as wallet
    cy.contains('Disbursement Method: Wallet Transfer').should('be.visible');
  });

  it('processes payroll with ACH disbursement when wallet balance is insufficient', () => {
    // Mock the wallet balance to be insufficient
    cy.intercept('GET', '**/employer_wallets*', {
      statusCode: 200,
      body: {
        id: '1',
        company_id: '1',
        balance: 100, // Small balance to force ACH transfer
        currency: 'USD',
        updated_at: new Date().toISOString()
      }
    }).as('getWallet');

    // Mock the Helcim API call
    cy.intercept('POST', '**/helcim_transactions*', {
      statusCode: 200,
      body: {
        transaction_id: `ACH-${Date.now()}`,
        status: 'approved'
      }
    }).as('achTransfer');

    // Visit the payroll page
    cy.visit('/app/payroll');
    
    // Start new payroll run
    cy.get('button').contains('Run Payroll').click();
    
    // Select a payroll period
    cy.get('select[name="payroll-period"]').select(1);
    
    // Verify employee list is loaded
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    
    // Submit payroll
    cy.get('button').contains('Submit Payroll').click();
    
    // Wait for the wallet check and ACH transfer
    cy.wait('@getWallet');
    cy.wait('@achTransfer');
    
    // Verify success message
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Payroll processed successfully');
    
    // Verify disbursement method is shown as ACH
    cy.contains('Disbursement Method: ACH Transfer').should('be.visible');
  });

  it('handles errors during disbursement gracefully', () => {
    // Mock the wallet balance check to fail
    cy.intercept('GET', '**/employer_wallets*', {
      statusCode: 500,
      body: {
        error: 'Database error'
      }
    }).as('getWalletError');

    // Visit the payroll page
    cy.visit('/app/payroll');
    
    // Start new payroll run
    cy.get('button').contains('Run Payroll').click();
    
    // Select a payroll period
    cy.get('select[name="payroll-period"]').select(1);
    
    // Verify employee list is loaded
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    
    // Submit payroll
    cy.get('button').contains('Submit Payroll').click();
    
    // Wait for the wallet check to fail
    cy.wait('@getWalletError');
    
    // Verify error message
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Error processing payroll');
    
    // Verify there's a way to retry
    cy.get('button').contains('Retry').should('be.visible');
  });
});