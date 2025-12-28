import { Server } from "socket.io";

let io;

export function initSocket(server) {
  const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  io = new Server(server, {
    cors: { origin: allowedOrigins,
    credentials: true, },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    // Workers join their personal room for targeted assignments
    socket.on("responder:join", (responderId) => {
      const room = `responder:${responderId}`;
      socket.join(room);
      console.log(`👷 Responder joined room: ${room}`);
    });
  });
}

export function emitEvent(event, data) {
  io.emit(event, data);
  console.log(`🔥 Socket emitted: ${event}`);
}

export function emitToResponder(responderId, event, data) {
  const room = `responder:${responderId}`;
  io.to(room).emit(event, data);
  console.log(`📣 Socket to ${room}: ${event}`);
}
