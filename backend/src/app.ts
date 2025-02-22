import express from "express";
import { Request, Response } from "express-serve-static-core";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import { envConfig } from "./config/config";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// CORS options
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Length", "X-Response-Time"],
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 204, // Status for preflight response
};

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors(corsOptions)); // Enable CORS for all routes
app.use(helmet()); // Add security-related HTTP headers
app.use(morgan(
  process.env.NODE_ENV === "production" ? "combined" : "dev"
)); // Log HTTP requests in development mode


const prisma = new PrismaClient();
// Connect to Prisma
async function startPrisma() {
  try {
    await prisma.$connect();
    console.log("[INFO] Prisma connected successfully");
  } catch (error) {
    console.error("[ERROR] Error connecting to Prisma:", error);
    process.exit(1); // Exit process with error code if Prisma connection fails
  }
}

// Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Vote API!",
  }); // Send a JSON response with status code 200
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err);
  res.status(500).json({
    message: "Something went wrong",
    error: err.message || err,
  });
});


// Graceful shutdown
const gracefulShutdown = () => {
  console.log("Shutting down gracefully...");
  prisma.$disconnect().then(() => {
    console.log("Prisma disconnected.");
    process.exit(0);
  });
};

// Listen for termination signals
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Start the app
startPrisma().then(() => {
  app.listen(envConfig.appPort || 3000, () => {
    console.log(`[INFO] Server running on port http://localhost:${envConfig.appPort}`);
  });
});

export default app;