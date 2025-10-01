declare namespace Cypress {
  interface Chainable {
    task(event: 'db:seed'): Chainable<null>;
  }
}