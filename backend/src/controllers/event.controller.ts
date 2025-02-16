import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { EventService } from "../services/event.service";

export class EventController {

    private eventService: EventService;

    constructor(
        eventService: EventService
    ) {
        // Constructor
        this.eventService = eventService;

        this.getEvents = this.getEvents.bind(this);
        this.getEvent = this.getEvent.bind(this);
    }

    async createEvent(req: Request, res: Response) {
        // Create an event
    }

    public async getEvent(req: Request, res: Response): Promise<any> {
        try {

            const eventId = req.params.eventId;

            const event = await this.eventService.getEventById(eventId);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: "Event not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Event fetched successfully",
                data: event,
            });
        }
        catch (error) {
            console.error("[ERROR] getEvents:", error);
            return res.status(500).json({
                message: "Something went wrong",
                error: error || error,
            });
        }
    }

    /**
     * Get all events with pagination
     * @param req - Request
     * @param res - Response
     * @returns - JSON
     */

    public async getEvents(req: Request, res: Response): Promise<any> {

        try {
            const page = Number(req.query.page) || 1;
            const pageSize = Number(req.query.pageSize) || 10;
            const search = req.query.search as string;
            const logs = req.query.logs === "true";

            const events = await this.eventService.getEvents(page, pageSize, search, logs);

            return res.status(200).json({
                success: true,
                message: "Events fetched successfully",
                data: events,
                meta: {
                    page,
                    pageSize,
                    search,
                    totalPages: events ? Math.ceil(events.totalCount / pageSize) || 1 : 1,
                }
            });

            // Calculate Offset for Pagination
        } catch (error) {
            console.error("[ERROR] getEvents:", error);
            return res.status(500).json({
                message: "Something went wrong",
                error: error || error,
            });

        }
    }

    async updateEvent(req: Request, res: Response) {
        // Update an event
    }

    async deleteEvent(req: Request, res: Response) {
        // Delete an event
    }
}