import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";
import app from "../app";

let token = "";

beforeAll(async () => {
  const login = await request(app)
    .post("/api/auth/login")
    .send({
      email: "admin@test.com",
      password: "123456",
    });

  console.log("LOGIN RESPONSE:", login.body);

  token = login.body.token;
});

describe("Inventory Logic", () => {
  it("should reduce stock after order", async () => {

    // CREATE PRODUCT
    const created = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Phone",
        sku: "PH100",
        category: "electronics",
        store: "6a02c472537281fa6fcb0832",
        variants: [
          {
            name: "Default",
            sku: "PH100-B",
            price: 20000,
            stock: 10,
          },
        ],
      });

    console.log("PRODUCT RESPONSE:", created.body);

    const productId =
      created.body.product?._id ||
      created.body.data?._id;

    // CREATE ORDER
    const order = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId,
        quantity: 2,
      });

    console.log("ORDER RESPONSE:", order.body);

    expect(order.statusCode).toBe(201);

    // FETCH UPDATED PRODUCT
    const updated = await request(app)
      .get(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${token}`);

    console.log("UPDATED PRODUCT:", updated.body);

    const product =
      updated.body.product || updated.body.data;

    expect(product.variants[0].stock).toBe(8);
  });
});