import { PollService } from "../services/poll.service";

import { Request, Response, NextFunction } from "express";
import { R2Service } from "../services/r2.services";

export class PollController {

  private pollService: PollService;
  private r2Service: R2Service;
  constructor(pollService: PollService, r2Service: R2Service) {

    this.pollService = pollService;
    this.r2Service = r2Service;
    this.getPoll = this.getPoll.bind(this);
    this.getPolls = this.getPolls.bind(this);
    this.myPolls = this.myPolls.bind(this);
    this.publicPolls = this.publicPolls.bind(this);
    this.myVotedPolls = this.myVotedPolls.bind(this);
    this.createPollByEventId = this.createPollByEventId.bind(this);
    this.getPollResults = this.getPollResults.bind(this);
  }

  /**
   * Get all polls with pagination
   * @param req - Request
   * @param res - Response
   * @param next - nextFunction
   * @returns - JSON
   */

  public async getPolls(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const search = req.query.search as string;
      const logs = req.query.logs === "true";

      const polls = await this.pollService.getPolls(
        page,
        pageSize,
        search,
        logs
      );

      return res.status(200).json({
        message: "Polls fetched successfully",
        data: polls,
        meta: {
          page: page,
          pageSize: pageSize,
          totalPages: Math.ceil(polls.totalCount / pageSize) || 1,
          totalCount: polls.totalCount,
          search,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch polls",
        error: error,
      });
    }
  }

  /**
   * Get all polls user has participated in
   * @param req - Request
   * @param res - Response
   * @param next - NextFunction
   * @returns - JSON
   */
  public async myPolls(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const user = req.user;

      // Check if user exists
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found",
          error: "User not found",
        });
      }

      // Fetch polls
      const polls = await this.pollService.myPolls(user.id, user.guest);

      res.status(200).json({
        message: "Polls fetched successfully",
        data: polls,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch polls",
        error: error,
      });
    }
  }

  /**
   * Get all polls user has voted ins
   * @param req - Request
   * @param res - Response
   * @param next - NextFunction
   * @returns - JSON
   */

  public async myVotedPolls(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const user = req.user;

      // Check if user exists
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found",
          error: "User not found",
        });
      }

      // Fetch polls
      const polls = await this.pollService.myVotedPolls(user.id, user.guest);

      res.status(200).json({
        message: "Polls fetched successfully",
        data: polls,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch polls",
        error: error,
      });
    }
  }

  public async publicPolls(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const search = req.query.search as string;
      const logs = req.query.logs === "true";

      const polls = await this.pollService.publicPolls(
        page,
        pageSize,
        search,
        logs
      );

      res.status(200).json({
        message: "Polls fetched successfully",
        data: { polls },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch polls",
        error: error,
      });
    }
  }

  /**
   * Get a poll by ID
   * @param req - Request
   * @param res - Response
   * @param next - NextFunction
   * @returns - JSON
   */

  public getPoll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const { pollId } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found",
          error: "User not found",
        });
      }

      // Check if user or guest can vote on poll
      const canGetPoll = await this.pollService.userCanVote(
        pollId,
        user.id,
        user.guest
      );

      // If user cannot vote on poll
      if (!canGetPoll) {
        return res.status(403).json({
          success: false,
          message: "You cannot vote on this poll",
          error: "You cannot vote on this poll",
        });
      }

      const polls = await this.pollService.getPoll(pollId, user.id, user.guest);

      if (!polls) {
        return res.status(404).json({
          success: false,
          message: "Failed to fetch polls",
          error: "Polls not found",
        });
      }

      const userVotedResults = await this.pollService.getUserVotedResults(
        pollId,
        user.id,
        user.guest
      );
      const pollParticipantCount =
        await this.pollService.getPollPaticipantCount(pollId);
      const getRemainingPoints = await this.pollService.getRemainingPoints(
        pollId,
        user.id,
        user.guest
      );

      res.status(200).json({
        message: "Polls fetched successfully",
        data: {
          poll: polls,
          userVotedResults,
          pollParticipantCount,
          remainingPoints: getRemainingPoints,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public async createPollByEventId(req: Request, res: Response): Promise<any> {
    try {
      const eventId = req.params.eventId;
      const user = req.user;
      const { polls } = req.body;

      console.log("Polls", polls);

      JSON.stringify(polls);


      if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      if (!polls || !Array.isArray(polls)) {
        return res.status(400).json({ success: false, message: "Invalid polls data" });
      }

      const createdPolls = await this.pollService.createPollByEventId(polls, eventId, user.id);

      return res.status(200).json({
        success: true,
        message: "Poll created successfully",
        data: createdPolls,
      });
    } catch (error) {
      console.error("[ERROR] createPollByEventId:", error);
      return res.status(500).json({ message: "Something went wrong", error });
    }
  }

  public async uploadFile(req: Request, res: Response): Promise<any> {
    try {
      const { pollName, pollDescription } = req.body;
      const files = req.files as Express.Multer.File[];
    } catch (error) {

    }
  }

  public async getPollResults(req: Request, res: Response): Promise<any> {
    try {
      const { pollId } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const pollResults = await this.pollService.result(pollId, user.id, user.guest);

      return res.status(200).json({
        success: true,
        message: "Poll results fetched successfully",
        data: pollResults,
      });
    } catch (error) {
      console.error("[ERROR] getPollResults:", error);
      return res.status(500).json({ message: "Something went wrong", error });
    }
  }
}
