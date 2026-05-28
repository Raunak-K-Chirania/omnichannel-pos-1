import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import Product from "../src/models/Product";
import Store from "../src/models/Store";
import User from "../src/models/User";
import Inventory from "../src/models/Inventory";
import generateToken from "../src/utils/generateToken";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/omnichannel-pos-test";

describe("Checkout Concurrency and Race Conditions", () => {
  let token: string;
  let storeId: string;
  let productId: string;
  let testSku: string;

  beforeAll(async () => {
    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
    }

    // Set JWT secret if not set
    process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret_for_vitest";

    // Clean test database collections
    await Store.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});
    await Inventory.deleteMany({});

    // Create test store
    const store = await Store.create({
      name: "Test Store Concurrency",
      location: "Concurrency Lab",
      isActive: true,
    });
    storeId = store._id.toString();

    // Create cashier user
    const cashierId = new mongoose.Types.ObjectId();
    await User.create({
      _id: cashierId,
      name: "Cashier Test",
      email: "cashier_test@example.com",
      password: "password123",
      role: "cashier",
      store: store._id,
    });

    token = generateToken(cashierId, "cashier");

    // Create test product with stock = 3
    testSku = "CONCUR-VITEST-SKU";
    const product = await Product.create({
      name: "Concurrency Test item",
      category: "Electronics",
      description: "Testing Vitest concurrent requests",
      store: store._id,
      isActive: true,
      variants: [
        {
          size: "One Size",
          color: "Green",
          sku: testSku,
          price: 50.00,
          stock: 3, // stock is exactly 3
        },
      ],
    });
    productId = product._id.toString();

    // Initialize inventory record for the variant
    await Inventory.create({
      product: product._id,
      store: store._id,
      sku: testSku,
      quantity: 3,
      reorderPoint: 1,
    });
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  it("should handle multiple concurrent orders, decrementing stock correctly and rejecting when stock is insufficient", async () => {
    // Send 5 concurrent order creation requests, each requesting 1 quantity
    // Since stock is 3, only 3 should succeed, and 2 should fail
    const orderPayload = {
      store: storeId,
      paymentMethod: "cash",
      items: [
        {
          productId: productId,
          sku: testSku,
          name: "Concurrency Test item",
          quantity: 1,
          unitPrice: 50.00,
          discount: 0,
        },
      ],
    };

    const reqPromises = Array.from({ length: 5 }).map(() =>
      request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send(orderPayload)
    );

    const responses = await Promise.all(reqPromises);

    const successResponses = responses.filter((res) => res.status === 201);
    const failResponses = responses.filter((res) => res.status === 400);

    // Verify 3 succeeded and 2 failed
    expect(successResponses.length).toBe(3);
    expect(failResponses.length).toBe(2);

    // Verify stock in database is exactly 0
    const dbProduct = await Product.findById(productId);
    const variant = dbProduct?.variants.find((v) => v.sku === testSku);
    expect(variant?.stock).toBe(0);

    // Verify inventory quantity is exactly 0
    const dbInventory = await Inventory.findOne({ sku: testSku, store: storeId });
    expect(dbInventory?.quantity).toBe(0);
  });
});
