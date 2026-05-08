import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";
import "./config/redis";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    
    // Connect MongoDB
    await connectDB();

    // Start Express Server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {

    console.error("Failed to start server");
    console.error(error);

    process.exit(1);
  }
};

startServer();