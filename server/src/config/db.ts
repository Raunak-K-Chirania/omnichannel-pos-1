import mongoose from "mongoose";
import { seedDatabase } from "../utils/seeder";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/omnichannel-pos";

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected");

    // Seed the database with default data if empty
    await seedDatabase();
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;