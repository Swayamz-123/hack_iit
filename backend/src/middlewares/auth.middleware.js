import { verifyAdminToken } from "../utils/jwt.js";

export function adminAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.admin_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    verifyAdminToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}
