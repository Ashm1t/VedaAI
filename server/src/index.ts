import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import { Server as SocketIOServer } from "socket.io";
import { config } from "./config/index.js";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import questionPaperRoutes from "./routes/questionPaperRoutes.js";
import { initRedis } from "./config/redis.js";
import { startWorker } from "./jobs/generationWorker.js";
import fs from "fs";

// Ensure directories exist
fs.mkdirSync(config.uploadsDir, { recursive: true });
fs.mkdirSync(config.outputDir, { recursive: true });

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
  },
});

// Store io instance for access from services
let ioInstance: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

ioInstance = io;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: ["http://localhost:3000", "http://127.0.0.1:3000"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/assignments", assignmentRoutes);
app.use("/api/question-papers", questionPaperRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start
async function start() {
  // Connect to MongoDB (if configured)
  await connectDB();

  // Connect to Redis and start BullMQ worker (if configured)
  await initRedis();
  startWorker();

  server.listen(config.port, () => {
    console.log(`\n✓ VedaAI server running on http://localhost:${config.port}`);
    console.log(`  Health: http://localhost:${config.port}/api/health`);
    console.log(
      `  MongoDB: ${config.mongoUri ? "configured" : "not configured"}`
    );
    console.log(
      `  Redis: ${config.redisUrl ? "configured" : "not configured"}`
    );
    console.log(
      `  Gemini: ${config.geminiApiKey ? "configured" : "not configured"}\n`
    );
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
