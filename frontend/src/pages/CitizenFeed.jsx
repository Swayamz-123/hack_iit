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
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              📡 Live Feed
            </h2>
            <p className="mt-2 text-xs text-slate-400 font-medium">
              Real-time incident updates
            </p>
          </div>

          {/* Report Button */}
          <button
            onClick={() => navigate("/report")}
            className="bg-linear-to-r from-red-600 to-orange-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg hover:from-red-700 hover:to-orange-700 hover:shadow-xl transition-all duration-200 active:scale-[0.98] border border-red-500/30"
          >
            🚨 Report
          </button>
        </div>

        {/* Empty State */}
        {activeIncidents.length === 0 && (
          <div className="mt-10 rounded-lg border border-dashed border-slate-700/50 bg-slate-800/30 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-300">
              No active incidents
            </p>
            <p className="mt-2 text-xs text-slate-500">
              New incidents will appear here instantly
            </p>
          </div>
        )}

        {/* Feed */}
        {activeIncidents.length > 0 && (
          <div className="space-y-3">
            {activeIncidents.map((i) => (
              <IncidentCard key={i._id} incident={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
