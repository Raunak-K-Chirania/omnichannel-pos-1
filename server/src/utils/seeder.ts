import Store from "../models/Store";
import User from "../models/User";
import Product from "../models/Product";
import Inventory from "../models/Inventory";

export const seedDatabase = async () => {
  try {
    // Check if Store already exists to prevent duplicate seeding
    const storeCount = await Store.countDocuments();
    if (storeCount > 0) {
      console.log("Database already initialized. Skipping seeding.");
      return;
    }

    console.log("Database is empty. Starting database seeding...");

    // 1. Create a default Store
    const store = await Store.create({
      name: "PulseKart Flagship Store",
      location: "New York, NY",
      isActive: true,
    });
    console.log(`Default store created: ${store.name}`);

    // 2. Create default Users
    const users = await User.create([
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
        store: store._id,
      },
      {
        name: "Manager User",
        email: "manager@example.com",
        password: "password123",
        role: "manager",
        store: store._id,
      },
      {
        name: "Cashier User",
        email: "cashier@example.com",
        password: "password123",
        role: "cashier",
        store: store._id,
      },
    ]);
    console.log(`Default users created: ${users.map((u) => u.email).join(", ")}`);

    // 3. Create default Products
    const productsData = [
      {
        name: "Classic Denim Jacket",
        category: "Apparel",
        description: "Timeless classic denim jacket with premium wash.",
        store: store._id,
        isActive: true,
        variants: [
          { size: "M", color: "Blue", sku: "APP-DEN-JAC-M-BLU", price: 79.99, stock: 25 },
          { size: "L", color: "Blue", sku: "APP-DEN-JAC-L-BLU", price: 79.99, stock: 15 },
        ],
      },
      {
        name: "Wireless ANC Headphones",
        category: "Electronics",
        description: "High-fidelity sound with active noise cancellation.",
        store: store._id,
        isActive: true,
        variants: [
          { size: "One Size", color: "Black", sku: "ELE-WIR-HP-OS-BLK", price: 149.99, stock: 30 },
          { size: "One Size", color: "White", sku: "ELE-WIR-HP-OS-WHT", price: 149.99, stock: 10 },
        ],
      },
      {
        name: "Leather Minimalist Wallet",
        category: "Accessories",
        description: "Genuine leather slim wallet with RFID blocking.",
        store: store._id,
        isActive: true,
        variants: [
          { size: "One Size", color: "Brown", sku: "ACC-LTH-WAL-OS-BRN", price: 34.99, stock: 50 },
        ],
      },
    ];

    for (const productInfo of productsData) {
      const product = await Product.create(productInfo);
      console.log(`Product created: ${product.name}`);

      // 4. Create matching Inventory records for each variant
      for (const variant of product.variants) {
        await Inventory.create({
          product: product._id,
          store: store._id,
          sku: variant.sku,
          quantity: variant.stock,
          reorderPoint: 10,
        });
        console.log(`Inventory created for SKU: ${variant.sku}`);
      }
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
