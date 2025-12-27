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
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Live Incident Feed
          </h2>

          {/* 🚨 Emergency Button */}
          <button
            onClick={() => navigate("/report")}
            className="bg-red-600 text-white px-5 py-2
                       rounded-full font-semibold
                       hover:bg-red-700 transition"
          >
            🚨 Report Emergency
          </button>
        </div>

        {/* Empty State */}
        {activeIncidents.length === 0 && (
          <p className="text-sm text-slate-500">
            No active incidents reported.
          </p>
        )}

        {/* Feed */}
        <div className="space-y-4">
          {activeIncidents.map((i) => (
            <IncidentCard key={i._id} incident={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
