import { Router } from "express";
import { Responder } from "../models/Responder.model.js";
import { responderAuth } from "../middlewares/responder.middleware.js";
import { signResponderToken } from "../utils/jwt.js";
import { Incident } from "../models/Incident.model.js";
import { distanceInMeters } from "../utils/geo.js";
import { emitToResponder } from "../socket/socket.js";

const router = Router();

// Register/login responder (hack-friendly, no password)
router.post("/register", async (req, res) => {
  const { name, type, location, token: regToken } = req.body;
  if (!name || !type || !location?.lat || !location?.lng) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }
  // Simple shared secret check to prevent public registrations
  if (
    !process.env.RESPONDER_REG_TOKEN ||
    regToken !== process.env.RESPONDER_REG_TOKEN
  ) {
    return res.status(401).json({ success: false, message: "Invalid registration token" });
  }
  const responder = await Responder.create({ name, type, location });
  const authToken = signResponderToken(responder._id.toString());
  res.cookie("responder_token", authToken, {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV==="production",
    maxAge: 24 * 60 * 60 * 1000,
  });

  // Retro-assign verified incidents near this responder
  try {
    const incidents = await Incident.find({ status: "verified" });
    const needsType = (incidentType) => {
      if (responder.type === "fire") return incidentType === "fire";
      // police or ambulance get all incident types
      return true;
    };

    const nearby = incidents.filter(
      (i) =>
        needsType(i.type) &&
        i.location?.lat != null &&
        i.location?.lng != null &&
        distanceInMeters(location.lat, location.lng, i.location.lat, i.location.lng) <=
          10 * 1000
    );

    for (const incident of nearby) {
      const already = (incident.assignedTo || []).some((id) => id.toString() === responder._id.toString());
      if (!already) {
        incident.assignedTo = [...(incident.assignedTo || []), responder._id];
        await incident.save();
      }
    }
    console.log(`✅ Responder ${responder.name} (${responder.type}) assigned to ${nearby.length} incidents`);
  } catch (e) {
    console.error("Retro-assign error:", e.message);
  }

  res.json({ success: true, data: responder });
});

router.get("/me", responderAuth, async (req, res) => {
  const me = await Responder.findById(req.responderId);
  res.json({ success: true, data: me });
});

router.post("/logout", responderAuth, (req, res) => {
  res.clearCookie("responder_token", {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV==="production",
  });
  res.json({ success: true, message: "Responder logged out" });
});

// Assigned incidents for this responder
router.get("/assignments", responderAuth, async (req, res) => {
  const incidents = await Incident.find({ assignedTo: req.responderId })
    .sort({ createdAt: -1 });
  res.json({ success: true, data: incidents });
});

// Nearby responders (utility)
router.post("/nearby", async (req, res) => {
  const { types, center, radiusKm = 10 } = req.body;
  const list = await Responder.find({ type: { $in: types } });
  const filtered = list.filter((r) =>
    distanceInMeters(center.lat, center.lng, r.location.lat, r.location.lng) <= radiusKm * 1000
  );
  res.json({ success: true, data: filtered });
});

export default router;
