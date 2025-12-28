import api from "./axios";

export const fetchIncidents = () => api.get("/incidents");
export const createIncident = (data) => api.post("/incidents", data);
export const verifyIncident = (incidentId) =>
  api.post("/incidents/verify", { incidentId });
export const updateIncidentStatus = (payload) =>
  api.post("/incidents/status", payload);
export const adminLogin = (data) => api.post("/admin/login", data);
export const checkAdmin = () => api.get("/admin/me");
export const logoutAdmin = () => api.post("/admin/logout");
export const uploadMedia = (file) => {
  const formData = new FormData();
  formData.append("media", file);
  return api.post("/incidents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Responder APIs
export const registerResponder = (payload) => api.post("/responders/register", payload);
export const meResponder = () => api.get("/responders/me");
export const fetchAssignments = () => api.get("/responders/assignments");
export const updateIncidentStatusResponder = (incidentId, status) => api.post("/incidents/status", { incidentId, status });
export const logoutResponder = () => api.post("/responders/logout");
