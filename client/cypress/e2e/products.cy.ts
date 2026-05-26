/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe("Products", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/products");
  });

  it("shows product list", () => {
    cy.contains("Product Catalog");
  });

  it("filters products", () => {
    cy.get('input[placeholder*="Filter"]').type("Denim");

    cy.contains("Denim");
  });

  it("manager can create product", () => {
    cy.contains("Add New Product").click();

    cy.get('input[placeholder*="Vintage"]').type("Test Product");
    cy.get('input[placeholder*="Apparel"]').type("Apparel");
    cy.get('input[type="number"]').eq(0).clear().type("100");

    cy.contains("Create Catalog Item").click();

    cy.contains("Test Product");
  });

  it("cashier cannot see create product button", () => {
    cy.loginAsCashier();

    cy.visit("/products");

    cy.contains("Add New Product").should("not.exist");
  });
});