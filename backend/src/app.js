import express from "express";
import cors from "cors";
import incidentRoutes from "./routes/incident.route.js";
import adminRoutes from "./routes/admin.route.js"
import responderRoutes from "./routes/responder.route.js"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
dotenv.config()
const app = express();
app.use(cookieParser())
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({
        origin: allowedOrigins,
        credentials: true,
}));
app.use(express.json());

app.use("/api/incidents", incidentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/responders", responderRoutes);

export default app;
