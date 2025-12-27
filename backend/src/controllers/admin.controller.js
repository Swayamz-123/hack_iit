import { signAdminToken } from "../utils/jwt.js";

export function loginAdmin(req, res) {
  const { email, password } = req.body;

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signAdminToken();

  // 🍪 SET COOKIE (THIS WAS MISSING)
  res.cookie("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true only in production HTTPS
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
  });

  return res.json({ success: true, message: "Admin logged in" });
}
