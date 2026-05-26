/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe("POS Page", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/pos");
  });

  it("loads POS page", () => {
    cy.contains("Product Catalog");
  });

  it("searches products", () => {
    cy.get('input[placeholder*="Search"]').type("Denim");

    cy.contains("Denim", { timeout: 10000 });
  });

  it("adds item to cart", () => {
    cy.contains("Add to Cart").first().click();

    cy.contains("Order Total");
  });

  it("removes item from cart", () => {
    cy.contains("Add to Cart").first().click();

    cy.get('button[title="Remove Item"]').first().click();

    cy.contains("Cart is empty");
  });

  it("checkout creates order", () => {
    cy.contains("Add to Cart").first().click();

    cy.contains("Complete Checkout").click();

    cy.contains("Checkout successful", { timeout: 10000 });
  });

  it("clears cart after checkout", () => {
    cy.contains("Add to Cart").first().click();

    cy.contains("Complete Checkout").click();

    cy.contains("Cart is empty", { timeout: 10000 });
  });
});