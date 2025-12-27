import express from "express";
import cors from "cors";
import incidentRoutes from "./routes/incident.route.js";
import adminRoutes from "./routes/admin.route.js"
import cookieParser from "cookie-parser"
const app = express();
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173", // Vite
    credentials: true,
}));
app.use(express.json());

app.use("/api/incidents", incidentRoutes);
app.use("/api/admin", adminRoutes);

export default app;
