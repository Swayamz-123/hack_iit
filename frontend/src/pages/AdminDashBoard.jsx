import { useEffect, useState } from "react";
import { fetchIncidents } from "../api/incident.api";
import IncidentCard from "../components/IncidentCard";
import AdminControls from "../components/AdminControls";
import { socket } from "../socket/socket";

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState([]);

  const load = async () => {
    const res = await fetchIncidents();
    setIncidents(res.data.data);
  };

  const { verify, resolve } = AdminControls({ refresh: load });

  useEffect(() => {
    load();
    socket.on("incident:update", load);
    return () => socket.off("incident:update", load);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent drop-shadow-xl">
              Admin Dashboard
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Monitor, verify, and resolve real‑time incident reports.
            </p>
          </div>
          <div className="px-4 py-2 rounded-full bg-slate-900/60 border border-slate-700/70 text-xs font-semibold uppercase tracking-wide">
            Incidents:{" "}
            <span className="ml-1 text-emerald-400">
              {incidents.length}
            </span>
          </div>
        </header>

        {/* Empty State */}
        {incidents.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/60 px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-300">
              No incidents reported yet.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              New incidents will appear here in real time as they are reported.
            </p>
          </div>
        )}

        {/* Incident List */}
        {incidents.length > 0 && (
          <div className="space-y-4">
            {incidents.map((i) => (
              <IncidentCard
                key={i._id}
                incident={i}
                admin
                onVerify={verify}
                onResolve={resolve}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
