import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../app";

describe("Inventory Logic", () => {

  it("should reduce stock after order", async () => {

    const order = await request(app)
      .post("/api/orders")
      .send({
        productId: "PRODUCT_ID",
        quantity: 2
      });

    expect(order.statusCode).toBe(201);

    const product = await request(app)
      .get("/api/products/PRODUCT_ID");

    expect(product.body.product.stock).toBe(8);
  });

});