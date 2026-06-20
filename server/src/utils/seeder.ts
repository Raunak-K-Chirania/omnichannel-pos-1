import Store from "../models/Store";
import User from "../models/User";
import Product from "../models/Product";
import Inventory from "../models/Inventory";

export const seedDatabase = async () => {
  try {
    console.log("Seeder started...");

    // =====================================================
    // 1. FIND OR CREATE DEFAULT STORE
    // =====================================================

    let store = await Store.findOne({
      name: "Omnichannel POS Flagship Store",
    });

    if (!store) {
      // If any store exists, use it and update its name
      store = await Store.findOne({});

      if (store) {
        store.name = "Omnichannel POS Flagship Store";
        store.currency = "USD";
        await store.save();
        console.log(`Updated existing store name to: ${store.name}`);
      } else {
        // Otherwise create default flagship store
        store = await Store.create({
          name: "Omnichannel POS Flagship Store",
          location: "New York, NY",
          isActive: true,
          currency: "USD",
        });

        console.log(`Default store created: ${store.name}`);
      }
    } else {
      console.log(`Found flagship store: ${store.name}`);
    }

    // Seed a secondary Indian store with INR currency out of the box
    let indianStore = await Store.findOne({
      name: "Omnichannel POS Mumbai Hub",
    });

    if (!indianStore) {
      indianStore = await Store.create({
        name: "Omnichannel POS Mumbai Hub",
        location: "Mumbai, MH, India",
        isActive: true,
        currency: "INR",
      });
      console.log(`Indian store created: ${indianStore.name}`);
    } else {
      console.log(`Found Indian store: ${indianStore.name}`);
    }

    // =====================================================
    // 2. CREATE DEFAULT USERS
    // =====================================================

    const defaultUsers = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password:
          process.env.DEFAULT_PASSWORD || "password123",
        role: "admin" as const,
        store: store._id,
      },
      {
        name: "Manager User",
        email: "manager@example.com",
        password:
          process.env.DEFAULT_PASSWORD || "password123",
        role: "manager" as const,
        store: store._id,
      },
      {
        name: "Cashier User",
        email: "cashier@example.com",
        password:
          process.env.DEFAULT_PASSWORD || "password123",
        role: "cashier" as const,
        store: store._id,
      },
    ];

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({
        email: userData.email,
      });

      if (!existingUser) {
        await User.create(userData);

        console.log(
          `Default user created: ${userData.email}`
        );
      } else {
        console.log(
          `User already exists: ${userData.email}`
        );
      }
    }

    // =====================================================
    // 3. CREATE DEFAULT PRODUCTS
    // =====================================================

    const productsData = [
      {
        name: "Classic Denim Jacket",
        category: "Apparel",
        description:
          "Timeless classic denim jacket with premium wash.",
        store: store._id,
        isActive: true,
        variants: [
          {
            size: "M",
            color: "Blue",
            sku: "APP-DEN-JAC-M-BLU",
            price: 79.99,
            stock: 25,
          },
          {
            size: "L",
            color: "Blue",
            sku: "APP-DEN-JAC-L-BLU",
            price: 79.99,
            stock: 15,
          },
        ],
      },
      {
        name: "Wireless ANC Headphones",
        category: "Electronics",
        description:
          "High-fidelity sound with active noise cancellation.",
        store: store._id,
        isActive: true,
        variants: [
          {
            size: "One Size",
            color: "Black",
            sku: "ELE-WIR-HP-OS-BLK",
            price: 149.99,
            stock: 30,
          },
          {
            size: "One Size",
            color: "White",
            sku: "ELE-WIR-HP-OS-WHT",
            price: 149.99,
            stock: 10,
          },
        ],
      },
      {
        name: "Leather Minimalist Wallet",
        category: "Accessories",
        description:
          "Genuine leather slim wallet with RFID blocking.",
        store: store._id,
        isActive: true,
        variants: [
          {
            size: "One Size",
            color: "Brown",
            sku: "ACC-LTH-WAL-OS-BRN",
            price: 34.99,
            stock: 50,
          },
        ],
      },
    ];

    for (const productData of productsData) {
      let product = await Product.findOne({
        name: productData.name,
      });

      // Create product if not exists
      if (!product) {
        product = await Product.create(productData);

        console.log(`Product created: ${product.name}`);
      } else {
        console.log(
          `Product already exists: ${product.name}`
        );
      }

      // =====================================================
      // 4. CREATE INVENTORY FOR EACH VARIANT
      // =====================================================

      for (const variant of product.variants) {
        const existingInventory =
          await Inventory.findOne({
            sku: variant.sku,
          });

        if (!existingInventory) {
          await Inventory.create({
            product: product._id,
            store: store._id,
            sku: variant.sku,
            quantity: variant.stock,
            reorderPoint: 10,
          });

          console.log(
            `Inventory created for SKU: ${variant.sku}`
          );
        } else {
          console.log(
            `Inventory already exists for SKU: ${variant.sku}`
          );
        }
      }
    }

    // =====================================================
    // 5. FINAL DATABASE STATS
    // =====================================================

    const totalStores = await Store.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalInventory = await Inventory.countDocuments();

    console.log("=================================");
    console.log("Database seeding complete");
    console.log(`Stores: ${totalStores}`);
    console.log(`Users: ${totalUsers}`);
    console.log(`Products: ${totalProducts}`);
    console.log(`Inventory Records: ${totalInventory}`);
    console.log("=================================");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};