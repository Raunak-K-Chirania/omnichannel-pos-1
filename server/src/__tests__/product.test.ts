import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";
import app from "../app";

let token = "";

beforeAll(async () => {

  // Login first
  const login = await request(app)
    .post("/api/auth/login")
    .send({
      email: "admin@test.com",
      password: "123456"
    });

  console.log("LOGIN RESPONSE:", login.body);

  // Save token
  token = login.body.token || login.body.data?.token;

});

describe("Product API", () => {

  it("should create product", async () => {

    const res = await request(app)
      .post("/api/products/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Laptop",
        sku: "LP100",
        price: 50000,
        stock: 10
      });

    console.log("CREATE PRODUCT RESPONSE:", res.body);

    expect(res.statusCode).toBe(201);

    // safer validation
    expect(res.body.success).toBe(true);

  });

  it("should get all products", async () => {

    const res = await request(app)
      .get("/api/products");

    console.log("GET PRODUCTS RESPONSE:", res.body);

    expect(res.statusCode).toBe(200);

    // flexible check
    expect(
      Array.isArray(res.body.products) ||
      Array.isArray(res.body.data)
    ).toBe(true);

  });

});