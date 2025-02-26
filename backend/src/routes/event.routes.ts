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
import { upload } from "../utils/multerConfig.util";

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
  upload.any(),
  pollController.createPollByEventId
);

router.post(
  "/upload",
  authMiddleware.validateUserOnly,
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
