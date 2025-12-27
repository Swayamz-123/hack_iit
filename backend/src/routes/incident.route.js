import { Router } from "express";
import * as ctrl from "../controllers/incident.controller.js";
import { adminAuth } from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/", ctrl.create);
router.get("/", ctrl.list);
router.post("/verify", adminAuth, ctrl.verify);
router.post("/status", adminAuth, ctrl.updateStatus);

export default router;
