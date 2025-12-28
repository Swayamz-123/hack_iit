import { verifyResponderToken } from "../utils/jwt.js";

export function responderAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.responder_token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const payload = verifyResponderToken(token);
    req.responderId = payload.responderId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}
