/// <reference types="cypress" />

describe("Concurrency checkouts", () => {
  beforeEach(() => {
    cy.login();
  });

  it("sends two simultaneous checkout requests for the same product with limited stock", () => {
    // 1. Get the authenticated user info from local storage
    cy.window().then((win) => {
      const userString = win.localStorage.getItem("user");
      expect(userString).to.not.be.null;
      const user = JSON.parse(userString!);
      const token = user.token;
      const storeId = user.store;

      // 2. Get products to confirm route works
      cy.request({
        method: "GET",
        url: "/api/products",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((productsResponse) => {
        expect(productsResponse.status).to.equal(200);

        // Create a new product with stock = 1 to test concurrency isolation
        const uniqueId = Date.now();
        const testSku = `CONCUR-${uniqueId}`;
        const productPayload = {
          name: `Concurrency Test Product ${uniqueId}`,
          category: "Apparel",
          description: "Testing concurrent order checkouts",
          store: storeId,
          variants: [
            {
              size: "M",
              color: "Red",
              sku: testSku,
              price: 10.00,
              stock: 1, // limited stock
            },
          ],
        };

        cy.request({
          method: "POST",
          url: "/api/products",
          body: productPayload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((newProductResponse) => {
          const product = newProductResponse.body;

          // 3. Send two simultaneous checkout requests for this SKU
          const orderPayload = {
            store: storeId,
            paymentMethod: "cash",
            items: [
              {
                productId: product._id,
                sku: testSku,
                name: product.name,
                quantity: 1,
                unitPrice: 10.00,
                discount: 0,
              },
            ],
          };

          // Send two requests concurrently
          const req1 = cy.request({
            method: "POST",
            url: "/api/orders",
            body: orderPayload,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            failOnStatusCode: false,
          });

          const req2 = cy.request({
            method: "POST",
            url: "/api/orders",
            body: orderPayload,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            failOnStatusCode: false,
          });

          // Wait for both requests and assert results
          req1.then((res1) => {
            req2.then((res2) => {
              // Verify that one request succeeded (201) and the other failed (400)
              const statusCodes = [res1.status, res2.status];
              expect(statusCodes).to.include(201);
              expect(statusCodes).to.include(400);

              // 4. Verify that inventory quantity never goes below zero
              cy.request({
                method: "GET",
                url: `/api/inventory?store=${storeId}`,
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }).then((inventoryResponse) => {
                const inventory = inventoryResponse.body.data;
                const item = inventory.find((i: any) => i.sku === testSku);
                expect(item).to.not.be.undefined;
                expect(item.quantity).to.equal(0); // must be exactly 0, not negative
              });
            });
          });
        });
      });
    });
  });
});
