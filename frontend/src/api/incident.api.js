import api from "./axios";

export const fetchIncidents = () => api.get("/incidents");
export const createIncident = (data) => api.post("/incidents", data);
export const verifyIncident = (incidentId) =>
  api.post("/incidents/verify", { incidentId });
export const updateIncidentStatus = (payload) =>
  api.post("/incidents/status", payload);
export const adminLogin = (data) => api.post("/admin/login", data);
