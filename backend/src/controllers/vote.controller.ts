import { Request, Response } from "express";
import { QueueService } from "../services/queue.service";

export class VoteController {
    private queueService: QueueService;

    constructor(queueService: QueueService) {
        this.queueService = queueService;

        this.vote = this.vote.bind(this);
    }

    public async vote(req: Request, res: Response): Promise<any> {
        try {
            const { optionId, point } = req.body;
            const { pollId } = req.params;

            const user = req.user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized. Please login to vote.",
                });
            }

            const userId = user.id;

            if (!pollId || !optionId || point <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request data. Please provide valid pollId, optionId, and point.",
                });
            }

            // Add vote to queue instead of processing it directly
            await this.queueService.addVoteToQueue({ pollId, optionId, userId, points: point, isGuest: user.guest });

            return res.status(202).json({
                success: true,
                message: "Vote request received. Processing in background.",
            });

        } catch (error) {
            console.error("[ERROR] VoteController:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to queue vote",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}
