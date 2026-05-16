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

describe("Product API", () => {
  it("should create product", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Laptop",
        sku: "LP100",
        category: "electronics",
        store: "6a02c472537281fa6fcb0832",
        variants: [
          {
            name: "Default",
            sku: "LP100-B",
            price: 50000,
            stock: 10,
          },
        ],
      });

    console.log("CREATE PRODUCT RESPONSE:", res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    expect(
      res.body.product?.name || res.body.data?.name
    ).toBe("Laptop");
  });

  it("should get all products", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${token}`);

    console.log("GET PRODUCTS RESPONSE:", res.body);

    expect(res.statusCode).toBe(200);

    expect(
      Array.isArray(res.body.products) ||
      Array.isArray(res.body.data)
    ).toBe(true);
  });
});