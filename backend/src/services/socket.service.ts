import { Server } from "socket.io";
import http from "http";

class SocketService {
  private io: Server | null = null;

  public initialize(server: http.Server) {
    this.io = new Server(server, { cors: { origin: "*" } });

    this.io.on("connection", (socket) => {
      console.log(`[INFO] User connected: ${socket.id}`);

      socket.on("disconnect", () => {
        console.log(`[INFO] User disconnected: ${socket.id}`);
      });
    });

    console.log("[INFO] WebSocket Server is running...");
  }

  public emitVoteUpdate(pollId: string, choice: string) {
    if (this.io) {
      this.io.emit("voteUpdate", { pollId, choice });
      console.log(`[INFO] Sent vote update: pollId=${pollId}, choice=${choice}`);
    }
  }
}

// ใช้เป็น singleton
export const socketService = new SocketService();
