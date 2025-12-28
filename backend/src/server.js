import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocket } from "./socket/socket.js";

dotenv.config();

const server = http.createServer(app);

connectDB();
initSocket(server);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
