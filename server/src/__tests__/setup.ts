import mongoose from "mongoose";
import dotenv from "dotenv";
import { beforeAll, afterAll } from "vitest";

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
});

afterAll(async () => {
  await mongoose.connection.close();
});