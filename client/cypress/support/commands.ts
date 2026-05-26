/// <reference types="cypress" />
/// <reference path="./index.d.ts" />

Cypress.Commands.add("login", () => {
  cy.clearLocalStorage();
  cy.visit("/login");

  cy.get('input[type="email"]').type("admin@example.com");
  cy.get('input[type="password"]').type("password123");

  cy.get('button[type="submit"]').click();

  // Wait for authentication and redirect to dashboard to complete
  cy.contains("Terminal Active:", { timeout: 10000 });
});

Cypress.Commands.add("loginAsCashier", () => {
  cy.clearLocalStorage();
  cy.visit("/login");

  cy.get('input[type="email"]').type("cashier@example.com");
  cy.get('input[type="password"]').type("password123");

  cy.get('button[type="submit"]').click();

  // Wait for authentication and redirect to dashboard to complete
  cy.contains("Terminal Active:", { timeout: 10000 });
});