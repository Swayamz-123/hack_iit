import { Incident } from "../models/Incident.model.js";

export function getIncidents() {
  return Incident.find().sort({ createdAt: -1 });
}

export function createIncident(data) {
  return Incident.create(data);
}

export function verifyIncident(id) {
  return Incident.findByIdAndUpdate(
    id,
    { $inc: { upvotes: 1 }, $set: { status: "verified" } },
    { new: true }
  );
}

export function updateStatus(id, status, internalNotes) {
  return Incident.findByIdAndUpdate(
    id,
    { status, ...(internalNotes && { internalNotes }) },
    { new: true }
  );
}
