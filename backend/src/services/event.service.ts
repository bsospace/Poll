import { PrismaClient, Prisma } from "@prisma/client";
import { DataLog, IEvent } from "../interface";

export class EventService {
    constructor(private prisma: PrismaClient) {
        this.prisma = prisma;
    }

    public async getEvents(
        page: number = 1,
        pageSize: number = 10,
        userId: string,
        search?: string,
        logs?: boolean
    ): Promise<{ events: IEvent[]; totalCount: number } | null> {
        try {
            // คำนวณ Offset สำหรับ Pagination
            const skip = (page - 1) * pageSize;
            const take = pageSize;

            // ค้นหา Event ตามเงื่อนไขที่ระบุ และกรองเฉพาะที่ยังไม่ถูกลบ (deletedAt: null)
            const whereCondition: Prisma.EventWhereInput = {
                deletedAt: null,
                ...(search && {
                    name: { contains: search, mode: Prisma.QueryMode.insensitive },
                }),
                OR: [
                    { userId },
                ],
            };

            // ดึง Events พร้อมกำหนด Fields ที่ต้องการ
            const events = await this.prisma.event.findMany({
                where: whereCondition,
                skip,
                take,
                orderBy: { createdAt: "desc" },
            });

            // นับจำนวนทั้งหมดของ Events
            const totalCount = await this.prisma.event.count({ where: whereCondition });

            const formattedEvents = events.map((event) => {
                // แปลง `null` เป็น `undefined` เพื่อให้ตรงกับ `Partial<IEvent>`
                return {
                    ...event,
                    description: event.description ?? undefined,
                    dataLogs: logs ? (event.dataLogs as unknown as DataLog[]) : undefined,
                };
            }); // แปลง `null` เป็น `undefined` เพื่อให้ตรงกับ `Partial<IEvent>`

            return { events: formattedEvents, totalCount };
        } catch (error) {
            console.error("[ERROR] getEvents:", error);
            return null;
        }
    }

    public async getEventById(eventId: string, userId: string): Promise<Partial<IEvent> | null> {
        try {
            // ค้นหา Event ด้วย ID ที่ระบุ
            const event = await this.prisma.event.findFirst({
                where: { id: eventId, deletedAt: null, userId },
                include: {
                    polls: {
                        include: { options: true },
                    },
                    whitelist: {
                        include: { user: true }
                    },
                    guests: true,
                },
            });

            if (!event) {
                console.error("[ERROR] getEventById: Event not found");
                return null;
            }

            // แปลง `null` เป็น `undefined` เพื่อให้ตรงกับ `Partial<IEvent>`
            const formattedEvent: Partial<IEvent> = {
                ...event,
                description: event.description ?? undefined,
                polls: event.polls.map(poll => ({
                    ...poll,
                    description: poll.description ?? undefined,
                    banner: poll.banner ?? undefined,
                    options: poll.options.map(option => ({
                        ...option,
                        banner: option.banner ?? undefined,
                        description: option.description ?? undefined,
                    })),
                })),
                whitelist: event.whitelist.map(w => ({
                    ...w,
                    user: {
                        ...w.user,
                        avatar: w.user.avatar ?? undefined,
                    },
                })),
            };

            return formattedEvent;
        } catch (error) {
            console.error("[ERROR] getEventById:", error);
            return null;
        }
    }

    public async createEvent(userId: string, eventData: {
        name: string;
        description?: string;
        whitelist?: { email: string; point: number }[];
        guest?: { id: string; name: string; key: string; point: number }[];
    }): Promise<IEvent | null> {
        try {
            const { name, description, whitelist = [], guest = [] } = eventData;
    
            const newEvent = await this.prisma.event.create({
                data: {
                    name,
                    description,
                    owner: { connect: { id: userId } },
                    whitelist: {
                        create: whitelist.map(user => ({
                            point: user.point, // Keep the point field
                            user: {
                                connectOrCreate: {
                                    where: { email: user.email }, // Check if user exists
                                    create: { email: user.email, firstName: "", lastName: "" } // Create new user if not found
                                }
                            }
                        })),
                    },
                    guests: {
                        create: guest.map(g => ({
                            name: g.name,
                            key: g.key,
                            point: g.point,
                        })),
                    },
                },
                include: {
                    whitelist: {
                        include: { user: true }, // Ensure user data is returned
                    },
                    guests: true,
                },
            });
    
            return {
                ...newEvent,
                description: newEvent.description ?? undefined,
                whitelist: newEvent.whitelist.map(w => ({
                    ...w,
                    user: {
                        ...w.user,
                        avatar: w.user.avatar ?? undefined,
                    },
                })),
            };
        } catch (error) {
            console.error("[ERROR] createEvent:", error);
            return null;
        }
    }    
}
