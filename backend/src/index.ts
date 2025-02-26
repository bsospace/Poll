import app from "./app";
import { authRouters } from "./routes/auth.routes";
import { eventRouters } from "./routes/event.routes";
import { pollRouters } from "./routes/poll.routes";
import { r2Router } from "./routes/r2.route";


// Routes for events
app.use("/api/v1/events", eventRouters);
app.use("/api/v1/polls", pollRouters);
app.use("/api/v1/auth", authRouters);
app.use("/api/v1/r2", r2Router);