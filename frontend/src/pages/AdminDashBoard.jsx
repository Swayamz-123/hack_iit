import { useEffect, useState } from "react";
import { fetchIncidents } from "../api/incident.api";
import IncidentCard from "../components/IncidentCard";
import AdminControls from "../components/AdminControls";
import { useNavigate } from "react-router-dom";
import { distanceInMeters } from "../utils/geo";
import { socket } from "../socket/socket";
import { logoutAdmin } from "../api/incident.api";

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState([]);
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("all");
  const [timeWindow, setTimeWindow] = useState("all"); // minutes: 15,60,360,1440 or 'all'
  const [radiusKm, setRadiusKm] = useState(0); // 0 = no radius filter
  const [center, setCenter] = useState(null); // {lat,lng}
  const [viewMode, setViewMode] = useState("all"); // 'all' | 'prioritized'

  const load = async () => {
    const res = await fetchIncidents();
    setIncidents(res.data.data);
  };

  const { verify, resolve, saveNotes } = AdminControls({ refresh: load });

  useEffect(() => {
    load();
    socket.on("incident:update", load);
    return () => socket.off("incident:update", load);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } finally {
      navigate("/admin/login", { replace: true });
    }
  };
  const useMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("Location permission denied")
    );
  };

  const withinTime = (createdAt) => {
    if (timeWindow === "all") return true;
    const diffMin = (Date.now() - new Date(createdAt).getTime()) / 60000;
    return diffMin <= Number(timeWindow);
  };

  const withinRadius = (incident) => {
    if (!center || !radiusKm || radiusKm <= 0) return true;
    if (!incident?.location?.lat || !incident?.location?.lng) return false;
    const d = distanceInMeters(center.lat, center.lng, incident.location.lat, incident.location.lng);
    return d <= radiusKm * 1000;
  };

  const typeMatches = (incident) =>
    filterType === "all" ? true : incident.type === filterType;

  const filtered = incidents.filter(
    (i) => typeMatches(i) && withinTime(i.createdAt) && withinRadius(i)
  );

  const score = (i) => {
    const sev = i.severity === "high" ? 3 : i.severity === "medium" ? 2 : 1;
    const up = Number(i.upvotes || 0);
    const recencyMin = (Date.now() - new Date(i.createdAt).getTime()) / 60000;
    const recencyWeight = Math.max(0, 120 - recencyMin) / 120; // 0..1 for last 2h
    return sev * 3 + up * 1 + recencyWeight * 2;
  };

  const prioritized = [...filtered].sort((a, b) => score(b) - score(a));

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h2>
            <p className="mt-2 text-xs text-slate-400 font-medium">
              Monitor, verify, and resolve incidents in real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/70 text-xs font-semibold text-slate-300">
              Active: <span className="text-emerald-400 font-bold">{filtered.length}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-slate-200 border border-slate-600/50 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700/60">
          <div>
            <label className="block text-xs text-slate-400 mb-2 font-semibold">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/60 text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Types</option>
              <option value="accident">Accident</option>
              <option value="medical">Medical</option>
              <option value="fire">Fire</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2 font-semibold">Time Window</label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/60 text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Time</option>
              <option value="15">Last 15 min</option>
              <option value="60">Last 1 hour</option>
              <option value="360">Last 6 hours</option>
              <option value="1440">Last 24 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2 font-semibold">Radius (km)</label>
            <input
              type="number"
              min="0"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/60 text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={useMyLocation}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border border-blue-500/30 transition"
            >
              📍 Location
            </button>
            {center && (
              <span className="text-[11px] text-slate-400">
                Center: {center.lat.toFixed(3)}, {center.lng.toFixed(3)}
              </span>
            )}
          </div>
        </div>

        {/* View Mode */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-2">View:</span>
          <button
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
              viewMode === "all"
                ? "bg-blue-700/80 text-white border-blue-500/50"
                : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-300"
            }`}
          >
            📋 All
          </button>
          <button
            onClick={() => setViewMode("prioritized")}
            className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
              viewMode === "prioritized"
                ? "bg-orange-700/80 text-white border-orange-500/50"
                : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-300"
            }`}
          >
            ⭐ Priority
          </button>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="mt-12 rounded-lg border border-dashed border-slate-700/50 bg-slate-800/30 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-300">
              No incidents match the filters
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Adjust your filters or wait for new incidents
            </p>
          </div>
        )}

        {/* Incident List */}
        {filtered.length > 0 && (
          <div className="space-y-3">
            {(viewMode === "prioritized" ? prioritized : filtered).map((i) => (
              <IncidentCard
                key={i._id}
                incident={i}
                admin
                onVerify={verify}
                onResolve={resolve}
                onSaveNotes={(id, notes, status) => saveNotes(id, notes, status)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
