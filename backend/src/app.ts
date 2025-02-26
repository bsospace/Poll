import express from "express";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { prisma } from "../prisma/prisma";
import { envConfig } from "./config/config";
import http from "http";
import { socketService } from "./services/socket.service";
import { QueueService } from "./services/queue.service";
import { deleteUnusedImagesCron } from "./crons/deleteUnusedImages";
import cron from "node-cron";

// โหลด Environment Variables
dotenv.config();

// สร้าง Express App
const app = express();
const server = http.createServer(app); // ใช้ HTTP Server แทน Express ปกติ (รองรับ WebSocket)

// CORS Options
const corsOptions = {
  origin: ['http://localhost:5173','http://bobby.posyayee.com:5173','http://localhost:3000','https://vote.posyayee.com'],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Length", "X-Response-Time"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// เชื่อมต่อ Prisma
async function startPrisma() {
  try {
    await prisma.$connect();
    console.log("[INFO] Prisma connected successfully");
  } catch (error) {
    console.error("[ERROR] Error connecting to Prisma:", error);
    process.exit(1);
  }
}


// Home Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Welcome to the Vote API!" });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[ERROR] Global Error:", err);
  res.status(500).json({
    message: "Something went wrong",
    error: err.message || "Internal Server Error",
  });
});

// Graceful Shutdown
const gracefulShutdown = async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  console.log("Prisma disconnected.");
  process.exit(0);
};

// Listen for termination signals
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);


cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Running scheduled task: Delete unused images...");
  await deleteUnusedImagesCron();
});

// Start the cron job
deleteUnusedImagesCron();

console.log("✅ Cron jobs initialized.");

// เริ่มต้น Prisma และ Queue Service
startPrisma().then(() => {
  const queueService = new QueueService(prisma);
  socketService.initialize(server);
  server.listen(envConfig.appPort || 3000, () => {
    console.log(`[INFO] Server running on port http://localhost:${envConfig.appPort}`);
  });
});

export default app;