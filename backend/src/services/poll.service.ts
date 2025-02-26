import { PrismaClient } from "@prisma/client";
import { DataLog, IPoll } from "../interface";

export class PollService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Get all polls with pagination
     * @param page - number
     * @param pageSize - number
     * @param search - string
     * @param logs - boolean
     */
    public async getPolls(page: number = 1, pageSize: number = 10, search?: string, logs?: boolean) {
        try {
            const skip = (page - 1) * pageSize;

            const whereCondition = {
                deletedAt: null,
                ...(search && { name: { contains: search, mode: "insensitive" } }),
            };

            const [polls, totalCount] = await Promise.all([
                this.prisma.poll.findMany({
                    where: whereCondition,
                    skip,
                    take: pageSize,
                    orderBy: { createdAt: "desc" },
                }),
                this.prisma.poll.count({ where: whereCondition }),
            ]);

            return {
                polls: this.formatPolls(polls, logs),
                totalCount,
            };
        } catch (error) {
            console.error("[ERROR] getPolls:", error);
            throw new Error("Failed to fetch polls");
        }
    }

    /**
     * Get all polls where user is a participant or guest
     */
    public async myPolls(userId: string, isGuest: boolean, logs?: boolean): Promise<{ polls: IPoll[] }> {
        try {
            const event = await this.prisma.event.findFirst({
                where: isGuest
                    ? { guests: { some: { id: userId, deletedAt: null } } }
                    : { whitelist: { some: { userId: userId, deletedAt: null } } },
            });

            if (!event) return { polls: [] };

            const rawPolls = await this.prisma.poll.findMany({
                where: { eventId: event.id, deletedAt: null, isVoteEnd: false },
                include: { event: true },
            });

            return { polls: this.formatPolls(rawPolls, logs) };
        } catch (error) {
            console.error("[ERROR] myPolls:", error);
            throw new Error("Failed to fetch polls");
        }
    }

    /**
     * Get all polls where user has voted
     */
    public async myVotedPolls(userId: string, isGuest: boolean, logs?: boolean): Promise<{ polls: IPoll[] }> {
        try {
            const rawPolls = await this.prisma.poll.findMany({
                where: {
                    deletedAt: null,
                    isVoteEnd: true,
                    votes: { some: { userId: userId, deletedAt: null } },
                },
                include: { votes: true, event: true },
            });

            return { polls: this.formatPolls(rawPolls, logs) };
        } catch (error) {
            console.error("[ERROR] myVotedPolls:", error);
            throw new Error("Failed to fetch voted polls");
        }
    }

    /**
     * Get all public polls
     */
    public async publicPolls(page: number = 1, pageSize?: number, search?: string, logs?: boolean) {
        try {
            const skip = pageSize ? (page - 1) * pageSize : undefined;
            const take = pageSize || undefined;

            const whereCondition = {
                deletedAt: null,
                isPublic: true,
                isVoteEnd: false,
                ...(search && { name: { contains: search, mode: "insensitive" } }),
            };

            const polls = await this.prisma.poll.findMany({
                where: whereCondition,
                skip,
                take,
                orderBy: { createdAt: "desc" },
                include: { event: true },
            });

            return this.formatPolls(polls, logs);
        } catch (error) {
            console.error("[ERROR] publicPolls:", error);
            throw new Error("Failed to fetch public polls");
        }
    }

    /**
     * Get a single poll by ID
     */
    public async getPoll(pollId: string, userId: string, isGuest: boolean) {
        try {
            const poll = await this.prisma.poll.findFirst({
                where: { id: pollId, deletedAt: null },
                include: {
                    options: true,
                    event: {
                        include: {
                            whitelist: isGuest ? undefined : { where: { userId: userId, deletedAt: null } },
                            guests: isGuest ? { where: { id: userId, deletedAt: null } } : undefined,
                        },
                    },
                    voteRestrict: true,
                },
            });

            if (!poll) {
                console.warn(`[WARN] Poll with ID ${pollId} not found.`);
                return null;
            }

            return this.formatPoll(poll);
        } catch (error) {
            console.error("[ERROR] getPoll:", error);
            throw new Error("Failed to fetch poll");
        }
    }

    public async getUserVotedResults(pollId: string, userId: string, isGuest: boolean) {
        try {
            const poll = await this.prisma.poll.findFirst({
                where: { id: pollId, deletedAt: null },
                include: {
                    options: true,
                    event: {
                        include: {
                            whitelist: isGuest ? undefined : { where: { userId: userId, deletedAt: null } },
                            guests: isGuest ? { where: { id: userId, deletedAt: null } } : undefined,
                        },
                    },
                    votes: {
                        where: isGuest ? { guestId: userId, deletedAt: null } : { userId: userId, deletedAt: null },
                    },
                },
            });

            if (!poll) {
                console.warn(`[WARN] Poll with ID ${pollId} not found.`);
                return null;
            }

            return poll.votes.map(vote => ({
                optionId: vote.optionId,
                userId: isGuest ? vote.guestId : vote.userId,
                point: vote.point,
            }));

        } catch (error) {
            console.error("[ERROR] getUserVotedResults:", error);
            throw new Error("Failed to fetch poll");
        }
    }

    public async getRemainingPoints(pollId: string, userId: string, isGuest: boolean) {
        try {

            let point = 0;
            const poll = await this.prisma.poll.findFirst({
                where: { id: pollId, deletedAt: null },
                include: {
                    event: {
                        include: {
                            whitelist: isGuest ? undefined : { where: { userId: userId, deletedAt: null } },
                            guests: isGuest ? { where: { id: userId, deletedAt: null } } : undefined,
                        },
                    },
                },
            });

            if (!poll) {
                console.warn(`[WARN] Poll with ID ${pollId} not found.`);
                return null;
            }

            if (isGuest) {
                const guest = poll.event?.guests.find(guest => guest.id === userId);
                point = guest?.point ?? 0;
            }

            if (!isGuest) {
                const whitelist = poll.event?.whitelist.find(whitelist => whitelist.userId === userId);
                point = whitelist?.point ?? 0;
            }

            if (poll.isPublic) {
                point = 1;
            }

            return point;
        } catch (error) {
            console.error("[ERROR] getRemainingPoints:", error);
            throw new Error("Failed to fetch poll");
        }
    }

    public async getPollPaticipantCount(pollId: string) {
        try {
            const poll = await this.prisma.poll.findFirst({
                where: { id: pollId, deletedAt: null },
                include: {
                    event: {
                        include: {
                            guests: true,
                            whitelist: true,
                        },
                    },
                },
            });

            if (!poll) {
                console.warn(`[WARN] Poll with ID ${pollId} not found.`);
                return null;
            }

            const guests = poll.event?.guests ?? [];
            const whitelist = poll.event?.whitelist ?? [];

            return guests.length + whitelist.length;

        } catch (error) {
            console.error("[ERROR] getPollVotedCount:", error);
            throw new Error("Failed to fetch poll");
        }
    }

    /**
     * Check if user can vote
     */
    public async userCanVote(pollId: string, userId: string, isGuest: boolean): Promise<boolean> {
        try {
            // Check if the poll exists and is public
            const canVote = await this.prisma.poll.findFirst({
                where: {
                    id: pollId,
                    deletedAt: null,
                    OR: [
                        { isPublic: true },
                        {
                            isPublic: false,
                            isVoteEnd: false,
                            event: {
                                ...(isGuest
                                    ? { guests: { some: { id: userId, deletedAt: null } } }
                                    : { whitelist: { some: { userId: userId, deletedAt: null } } }
                                )
                            }
                        }
                    ]
                }
            });

            return Boolean(canVote);
        } catch (error) {
            console.error("[ERROR] userCanVote:", error);
            throw error; // Preserve original error details
        }
    }

    /**
     * 🛠 Helper function to format poll results
     */
    private formatPolls(polls: any[], logs?: boolean): IPoll[] {
        return polls.map(poll => this.formatPoll(poll, logs));
    }

    private formatPoll(poll: any, logs?: boolean): IPoll {
        return {
            ...poll,
            description: poll.description ?? undefined,
            banner: poll.banner ?? undefined,
            dataLogs: logs ? (poll.dataLogs as unknown as DataLog[] | null) ?? undefined : undefined,
            options: poll.options?.map((option: { description: string; banner: string; }) => ({
                ...option,
                description: option.description ?? undefined,
                banner: option.banner ?? undefined,
            })) ?? [],
            event: poll.event
                ? {
                    ...poll.event,
                    description: poll.event.description ?? undefined,
                    dataLogs: (poll.event.dataLogs as unknown as DataLog[] | null) ?? undefined,
                }
                : undefined,
        };
    }

    public async createPollByEventId(
      polls: IPoll[],
      eventId: string,
      userId: string,
      files: Express.multer.File[]
    ): Promise<any> {
        try {
            return await this.prisma.$transaction(async (prisma) => {
                // Step 1: Create Polls
                const createdPolls = await prisma.poll.createMany({
                    data: polls.map((poll) => ({
                        eventId: eventId,
                        userId: userId,
                        question: poll.question,
                        description: poll.description,
                        isPublic: eventId != null ? false : poll.isPublic,
                        canEdit: poll.canEdit,
                        isVoteEnd: false, // Default vote end status
                        banner: poll.banner,
                        publishedAt: poll.publishedAt ? new Date(poll.publishedAt) : null,
                        startVoteAt: new Date(poll.startVoteAt),
                        endVoteAt: new Date(poll.endVoteAt),
                    })),
                });

                // Step 2: Fetch created polls to get their IDs
                const createdPollsData = await prisma.poll.findMany({
                    where: { eventId: eventId, userId: userId },
                });

                // Step 3: Add options and vote restrictions using Promise.all
                await Promise.all(
                    polls.map(async (poll) => {
                        const relatedPoll = createdPollsData.find(
                            (p) => p.question === poll.question
                        );

                        if (!relatedPoll) {
                            throw new Error(`Poll not found for question: ${poll.question}`);
                        }

                        // Create options
                        const createdOptions = await prisma.option.createMany({
                            data: (poll.options || []).map((option) => ({
                                pollId: relatedPoll.id,
                                text: option.text,
                                banner: option.banner,
                                description: option.description,
                            })),
                        });

                        // Step 4: Add vote restrictions
                        await Promise.all(
                            (poll.voteRestrict || []).map(async (restriction) => {
                                const option = await prisma.option.findFirst({
                                    where: {
                                        pollId: relatedPoll.id,
                                        text: restriction.option?.text, // Ensure option text matches
                                    },
                                });

                                if (option) {
                                    await prisma.voteRestriction.create({
                                        data: {
                                            pollId: relatedPoll.id,
                                            optionId: option.id,
                                            userId: restriction?.userId || null,
                                            guestId: restriction?.guestId || null,
                                        },
                                    });
                                }
                            })
                        );
                    })
                );

                return createdPolls;
            });
        } catch (error) {
            console.error("Error creating polls:", error);
            throw new Error(
                `Failed to create polls for event ${eventId}: ${error}`
            );
        }
    }

    
}