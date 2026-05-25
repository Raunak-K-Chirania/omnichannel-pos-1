import Store from "../models/Store";
import User from "../models/User";
import Product from "../models/Product";
import Inventory from "../models/Inventory";

export const seedDatabase = async () => {
  try {
    console.log("Checking database default seed data...");

    // 1. Resolve or Create default Store
    let store = await Store.findOne({ name: "OmniPOS Flagship Store" });
    if (!store) {
      // Fallback: if any store exists, use the first one, otherwise create the flagship store
      store = await Store.findOne({});
      if (!store) {
        store = await Store.create({
          name: "OmniPOS Flagship Store",
          location: "New York, NY",
          isActive: true,
        });
        console.log(`Default store created: ${store.name}`);
      } else {
        console.log(`Using existing store: ${store.name}`);
      }
    } else {
      console.log(`Found flagship store: ${store.name}`);
    }

    // 2. Create default Users if they don't exist
    const defaultUsers = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        role: "admin" as const,
        store: store._id,
      },
      {
        name: "Manager User",
        email: "manager@example.com",
        password: "password123",
        role: "manager" as const,
        store: store._id,
      },
      {
        name: "Cashier User",
        email: "cashier@example.com",
        password: "password123",
        role: "cashier" as const,
        store: store._id,
      },
    ];

    for (const u of defaultUsers) {
      const userExists = await User.findOne({ email: u.email });
      if (!userExists) {
        await User.create(u);
        console.log(`Default user created: ${u.email}`);
      }
    }

    // 3. Create default Products & Inventory if they don't exist
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
      const productExists = await Product.findOne({ name: productInfo.name });
      if (!productExists) {
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
    }

    console.log("Database seed check and update complete.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
