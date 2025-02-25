import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { EventService } from "../services/event.service";
import { PrismaClient } from "@prisma/client";
import {
  createEventValidator,
  getAllEventValidator,
  getEventByIdValidator,
} from "../utils/validators/event.util";
import { validateRequest } from "../middlewares/validate.middleware";
import { PollController } from "../controllers/poll.controller";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";
import { CryptoService } from "../services/crypto.service";
import AuthMiddleware from "../middlewares/auth.middleware";
import { PollService } from "../services/poll.service";
import multer from "multer";

const router = Router();

const prisma = new PrismaClient();
const eventService = new EventService(prisma);

const pollService = new PollService(prisma);

const userService = new UserService(prisma);

const authService = new AuthService();
const cryptoService = new CryptoService();

const authMiddleware = new AuthMiddleware(
  userService,
  cryptoService,
  authService
);

// ตั้งค่า storage ของ Multer เพื่ออัปโหลดไฟล์ไปยัง folder 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // ตั้งให้ไฟล์ไปอยู่ใน folder 'uploads'
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // ใช้ชื่อไฟล์เดิม
  },
});

const upload = multer({ storage: storage });

const eventController = new EventController(eventService);
const pollController = new PollController(pollService);

router.get(
  "/",
  getAllEventValidator(),
  authMiddleware.validateMulti,
  validateRequest,
  eventController.getEvents
);

router.get(
  "/:eventId",
  getEventByIdValidator(),
  authMiddleware.validateMulti,
  validateRequest,
  eventController.getEvent
);

router.post(
  "/:eventId/polls/create",
  getEventByIdValidator(),
  authMiddleware.validateUserOnly,
  validateRequest,
  pollController.createPollByEventId
);

router.post(
  "/upload",
  authMiddleware.validateUserOnly,
  upload.any(),
  pollController.uploadFile
);

router.post(
  "/create",
  createEventValidator(),
  authMiddleware.validateUserOnly,
  validateRequest,
  eventController.createEvent
);

export { router as eventRouters };
