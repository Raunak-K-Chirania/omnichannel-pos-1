const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../../server/.env") });

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/omnichannel-pos";
console.log("Connecting to URI:", mongoUri);

mongoose.connect(mongoUri)
  .then(async () => {
    console.log("Connected successfully.");

    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log("\nCollections in DB:", collections.map(c => c.name));

    if (collections.some(c => c.name === "products")) {
      const products = await db.collection("products").find({}).toArray();
      console.log("\n--- PRODUCTS IN DB:", products.length, "---");
      products.forEach((p, idx) => {
        console.log(`${idx + 1}. Name: "${p.name}", Category: "${p.category}", isActive: ${p.isActive}`);
      });
    } else {
      console.log("\nNo 'products' collection found.");
    }

    if (collections.some(c => c.name === "users")) {
      const users = await db.collection("users").find({}).toArray();
      console.log("\n--- USERS IN DB:", users.length, "---");
      users.forEach((u, idx) => {
        console.log(`${idx + 1}. Name: "${u.name}", Email: "${u.email}", Role: "${u.role}"`);
      });
    } else {
      console.log("\nNo 'users' collection found.");
    }

    if (collections.some(c => c.name === "stores")) {
      const stores = await db.collection("stores").find({}).toArray();
      console.log("\n--- STORES IN DB:", stores.length, "---");
      stores.forEach((s, idx) => {
        console.log(`${idx + 1}. Name: "${s.name}"`);
      });
    } else {
      console.log("\nNo 'stores' collection found.");
    }

    await mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection failed:", err);
    process.exit(1);
  });
