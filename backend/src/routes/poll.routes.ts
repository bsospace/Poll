import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { PollService } from "../services/poll.service";
import { PollController } from "../controllers/poll.controller";
import { getAllPollValidator, getPollByIdValidator } from "../utils/validators/poll.util";
import { validateRequest } from "../middlewares/validate.middleware";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";
import { CryptoService } from "../services/crypto.service";
import AuthMiddleware from "../middlewares/auth.middleware";

const router = Router();


const prisma = new PrismaClient();
const pollService = new PollService(prisma)

const pollController = new PollController(pollService);

const userService = new UserService(
    prisma
);

const authService = new AuthService();
const cryptoService = new CryptoService();

const authMiddleware = new AuthMiddleware(
    userService,
    cryptoService,
    authService
)

router.get('/my-polls', authMiddleware.validateMulti, pollController.myPolls);
router.get('/public-polls', authMiddleware.validateMulti, pollController.publicPolls);
router.get('/my-voted-polls', authMiddleware.validateMulti, pollController.myVotedPolls);
router.get('/:pollId', getPollByIdValidator(), authMiddleware.validateMulti, pollController.getPoll);

export {
    router as pollRouters
}