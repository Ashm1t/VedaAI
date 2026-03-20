import mongoose from "mongoose";
import { config } from "./index.js";

export async function connectDB(): Promise<void> {
  if (!config.mongoUri) {
    console.warn("⚠ MONGODB_URI not set — skipping database connection");
    return;
  }

  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log("✓ MongoDB connected");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("whitelist") || msg.includes("Could not connect")) {
      console.error(
        "✗ MongoDB connection failed — IP not whitelisted in Atlas."
      );
      console.error(
        "  Go to Atlas → Network Access → Add your current IP address."
      );
    } else {
      console.error("✗ MongoDB connection failed:", msg);
    }
    console.warn("  Server will continue without database (API calls that need DB will fail).\n");
  }
}
