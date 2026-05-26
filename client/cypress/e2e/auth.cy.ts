/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe("Authentication", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("loads login page", () => {
    cy.contains("Access Terminal");
  });

  it("shows error for invalid credentials", () => {
    cy.get('input[type="email"]').type("wrong@test.com");
    cy.get('input[type="password"]').type("wrongpass");

    cy.get('button[type="submit"]').click();

    cy.contains("Invalid credentials");
  });

  it("redirects valid user to dashboard", () => {
    cy.get('input[type="email"]').type("admin@example.com");
    cy.get('input[type="password"]').type("password123");

    cy.get('button[type="submit"]').click();

    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  it("logout redirects to login", () => {
    cy.login();

    cy.get('button[title="Log Out"]').click();

    cy.url().should("include", "/login");
  });
});