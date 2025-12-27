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
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Page Header */}
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Admin Dashboard
        </h2>

        {/* Empty State */}
        {incidents.length === 0 && (
          <p className="text-slate-500 text-sm">
            No incidents reported yet.
          </p>
        )}

        {/* Incident List */}
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
      </div>
    </div>
  );
}
