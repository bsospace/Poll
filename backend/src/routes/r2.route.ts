import { Router } from "express";
import AuthMiddleware from "../middlewares/auth.middleware";
import { PrismaClient } from "@prisma/client";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";
import { CryptoService } from "../services/crypto.service";
import { R2Service } from "../services/r2.services";
import { R2Controller } from "../controllers/r2.controller";
import multer from "multer";

const router = Router();
const prisma = new PrismaClient();

// Services
const userService = new UserService(prisma);
const authService = new AuthService();
const cryptoService = new CryptoService();
const authMiddleware = new AuthMiddleware(userService, cryptoService, authService);
const r2Service = new R2Service(prisma);

// Controllers
const r2Controller = new R2Controller(r2Service);

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post("/pre-upload", upload.any(), authMiddleware.validateUserOnly,r2Controller.preUpload);
router.get("/images/:relatedTo/:relatedId", authMiddleware.validateUserOnly,  r2Controller.getImages);
router.delete("/image/:key", authMiddleware.validateUserOnly,  r2Controller.deleteImage);

export { router as r2Router };
