import { supabase } from '../../src/lib/supabase';

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
  });
});

Cypress.Commands.add('logout', () => {
  cy.window().then(async (win) => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    win.location.href = '/';
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}