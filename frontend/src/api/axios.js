import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true, // 🔑 IMPORTANT (cookie auth)
});

export default api;
