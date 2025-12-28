import { Router } from "express";
import { loginAdmin } from "../controllers/admin.controller.js";
import { adminAuth } from "../middlewares/auth.middleware.js";

const router = Router();
router.post("/login", loginAdmin);
router.get("/me", adminAuth, (req, res) => {
	res.json({ success: true });
});
router.post("/logout", adminAuth, (req, res) => {
	// Clear cookie with matching options used at login
	res.clearCookie("admin_token", {
		httpOnly: true,
		sameSite: "none",
		secure: process.env.NODE_ENV==="production",
	});
	res.json({ success: true, message: "Logged out" });
});

export default router;
