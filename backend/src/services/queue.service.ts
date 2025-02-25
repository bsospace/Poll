import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";
import { socketService } from "./socket.service";
import { envConfig } from "../config/config";

class QueueService {
    private voteQueue: Queue;
    private redis: Redis;
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.redis = new Redis({
            host: envConfig.redis.host,
            port: envConfig.redis.port,
            password: envConfig.redis.password,
            maxRetriesPerRequest: null,
        });

        this.voteQueue = new Queue("vote-queue", {
            connection: this.redis,
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: false,
                attempts: 3,
                backoff: { type: "exponential", delay: 5000 },
            },
        });

        this.prisma = prisma;
        this.initializeWorker();
    }

    public async addVoteToQueue(voteData: { pollId: string; userId: string; optionId: string; points: number, isGuest: boolean }) {
        console.log("[DEBUG] Adding vote to queue:", voteData);
        await this.voteQueue.add("new-vote", voteData, {
            jobId: `vote:${voteData.pollId}:${voteData.userId}`,
        });

        const jobCount = await this.voteQueue.getJobCounts();
        console.log("[DEBUG] Job count in queue:", jobCount);
    }

    private initializeWorker() {
        new Worker(
            "vote-queue",
            async (job) => {
                console.log("[INFO] Worker received job:", job.id, job.data);

                try {
                    console.log("[DEBUG] Checking if job can be processed...");

                    const { pollId, userId, optionId, points, isGuest } = job.data;
                    const userVoteKey = `vote:${pollId}:${userId}`;

                    if(isGuest){
                        const guest = await this.prisma.guest.findUnique({
                            where: { id: userId },
                            select: { point: true },
                        });

                        console.log(`[DEBUG] Guest:`, guest);
                        if (!guest) throw new Error(`Guest ID ${userId} not found or deleted.`);
                        if (guest.point < points) throw new Error(`Guest ${userId} does not have enough points.`);
                    }

                    if (!isGuest) {
                        const whitelistUser = await this.prisma.whitelistUser.findFirst({
                            where: { userId },
                            include: { user: true },
                        });

                        console.log(`[DEBUG] Whitelist user:`, whitelistUser);
                        if (!whitelistUser) throw new Error(`User ID ${userId} not found or deleted.`);
                        if (whitelistUser.point < points) throw new Error(`User ${userId} does not have enough points.`);
                    }

                    console.log(`[DEBUG] Processing vote for ${userId} on poll ${pollId}`);

                    const result = await this.prisma.$transaction(async (tx) => {

                        const poll = await tx.poll.findUnique({ where: { id: pollId } });
                        if (!poll) throw new Error(`Poll ID ${pollId} not found or deleted.`);

                        console.log(`[DEBUG] Creating vote record`);
                        const vote = await tx.vote.create({
                            data: {
                                pollId,
                                userId: isGuest ? null : userId,
                                guestId: isGuest ? userId : null,
                                optionId,
                                point: points,
                            },
                        });

                        console.log(`[DEBUG] Updating poll option ${optionId} with ${points} points`);

                        if (isGuest) {
                            await tx.guest.updateMany({
                                where: { id: userId },
                                data: { point: { decrement: points } },
                            });
                        } else {
                            await tx.whitelistUser.updateMany({
                                where: { userId: userId },
                                data: { point: { decrement: points } },
                            });
                        }

                        return vote;
                    });

                    console.log("[INFO] Vote successfully processed:", result);
                    await this.redis.set(userVoteKey, "true", "EX", 3600);
                    socketService.emitVoteUpdate(pollId, optionId);
                } catch (error) {
                    console.error(`[ERROR] Failed to process job ${job.id}:`, error);
                }
            },
            { connection: this.redis, concurrency: 5 }
        ).on("failed", async (job, err) => {
            if (!job) {
                console.error(`[ERROR] Job is undefined:`, err);
                return;
            }
            console.error(`[ERROR] Job ${job.id} failed:`, err);
            await this.prisma.failedJob.create({
                data: {
                    jobId: job.id as string,
                    queueName: job.queueName,
                    data: job.data,
                    error: err instanceof Error ? err.message : "Unknown error",
                },
            });
        });

        console.log("[INFO] Vote Queue Worker is running...");
    }
}

export { QueueService };
