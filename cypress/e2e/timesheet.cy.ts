describe('Time Tracking', () => {
  beforeEach(() => {
    cy.login('employee@example.com', 'password123');
  });

  it('allows employees to submit time entries', () => {
    cy.visit('/app/timesheet');
    
    // Add new time entry
    cy.get('button').contains('Add Time Entry').click();
    
    // Fill out time entry form
    cy.get('input[name="date"]').type('2025-01-20');
    cy.get('input[name="start_time"]').type('09:00');
    cy.get('input[name="end_time"]').type('17:00');
    cy.get('input[name="break_duration"]').type('00:30');
    cy.get('textarea[name="notes"]').type('Regular work day');
    
    // Submit entry
    cy.get('button').contains('Save Entry').click();
    
    // Verify success message
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Time entry saved successfully');
    
    // Verify entry appears in list
    cy.get('table tbody tr').first().within(() => {
      cy.contains('2025-01-20');
      cy.contains('09:00');
      cy.contains('17:00');
      cy.contains('Regular work day');
    });
  });

  it('validates time entry data', () => {
    cy.visit('/app/timesheet');
    cy.get('button').contains('Add Time Entry').click();
    
    // Try to submit without required fields
    cy.get('button').contains('Save Entry').click();
    
    // Verify validation messages
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.contains('Date is required');
    cy.contains('Start time is required');
  });

  it('allows managers to approve time entries', () => {
    cy.login('manager@example.com', 'password123');
    cy.visit('/app/timesheet/approve');
    
    // Select pending entries
    cy.get('select[name="status-filter"]').select('pending');
    
    // Approve first entry
    cy.get('table tbody tr').first().within(() => {
      cy.get('button').contains('Approve').click();
    });
    
    // Verify status change
    cy.get('table tbody tr').first().should('contain', 'Approved');
  });
});