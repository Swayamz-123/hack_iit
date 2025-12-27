import { Incident } from "../models/Incident.model.js";
import * as service from "../services/incident.service.js";
import { emitEvent } from "../socket/socket.js";
import { isDuplicate } from "../utils/deduplication.js";

export async function create(req, res) {
  const incoming = req.body;

  const recent = await Incident.find({
    type: incoming.type,
    status: { $ne: "resolved" },
    createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
  });

  for (const incident of recent) {
    if (isDuplicate(incident, incoming)) {
      incident.upvotes += 1;
      await incident.save();

      emitEvent("incident:update", incident);

      return res.json({
        success: true,
        message: "Duplicate detected, confidence increased",
        data: incident,
      });
    }
  }

  const newIncident = await service.createIncident(incoming);
  emitEvent("incident:new", newIncident);

  res.json({ success: true, data: newIncident });
}

export async function list(req, res) {
  const incidents = await service.getIncidents();
  res.json({ success: true, data: incidents });
}

export async function verify(req, res) {
  const updated = await service.verifyIncident(req.body.incidentId);
  emitEvent("incident:update", updated);
  res.json({ success: true, data: updated });
}

export async function updateStatus(req, res) {
  const updated = await service.updateStatus(
    req.body.incidentId,
    req.body.status,
    req.body.internalNotes
  );
  emitEvent("incident:update", updated);
  res.json({ success: true, data: updated });
}
