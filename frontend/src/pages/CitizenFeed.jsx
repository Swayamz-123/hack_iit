import { useEffect, useState } from "react";
import { fetchIncidents } from "../api/incident.api";
import { socket } from "../socket/socket";
import IncidentCard from "../components/IncidentCard";
import { useNavigate } from "react-router-dom";

export default function CitizenFeed() {
  const [incidents, setIncidents] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    const res = await fetchIncidents();
    setIncidents(res.data.data);
  };

  useEffect(() => {
    load();
    socket.on("incident:new", load);
    socket.on("incident:update", load);
    return () => {
      socket.off("incident:new", load);
      socket.off("incident:update", load);
    };
  }, []);

  const activeIncidents = incidents.filter(
    (i) => i.status !== "resolved"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-xl">
              Live Incident Feed
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Real‑time updates of active incidents reported by citizens.
            </p>
          </div>

          {/* 🚨 Emergency Button */}
          <button
            onClick={() => navigate("/report")}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2.5 rounded-full font-semibold text-sm shadow-xl hover:from-red-600 hover:to-orange-600 hover:shadow-2xl transition-transform duration-200 active:scale-[0.98]"
          >
            🚨 Report Emergency
          </button>
        </div>

        {/* Empty State */}
        {activeIncidents.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/60 px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-300">
              No active incidents reported.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              New incidents will appear here instantly as they are raised.
            </p>
          </div>
        )}

        {/* Feed */}
        {activeIncidents.length > 0 && (
          <div className="space-y-4">
            {activeIncidents.map((i) => (
              <IncidentCard key={i._id} incident={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
