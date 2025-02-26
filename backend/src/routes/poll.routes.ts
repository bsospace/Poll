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
import { QueueService } from "../services/queue.service";
import { VoteController } from "../controllers/vote.controller";
import { R2Service } from '../services/r2.services';

const router = Router();


const prisma = new PrismaClient();
const r2Service = new R2Service(prisma);
const pollService = new PollService(prisma, r2Service);

const pollController = new PollController(pollService, r2Service);

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

const queueService = new QueueService(prisma);
const voteController = new VoteController(queueService, pollService);

router.get('/my-polls', authMiddleware.validateMulti, pollController.myPolls);
router.get('/public-polls', authMiddleware.validateMulti, pollController.publicPolls);
router.get('/my-voted-polls', authMiddleware.validateMulti, pollController.myVotedPolls);
router.get('/:pollId', getPollByIdValidator(), authMiddleware.validateMulti, pollController.getPoll);
router.post('/:pollId/vote', authMiddleware.validateMulti, voteController.vote);

export {
    router as pollRouters
}