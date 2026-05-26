/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(): Chainable<void>;
    loginAsCashier(): Chainable<void>;
  }
}