import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAssignments, meResponder, logoutResponder, updateIncidentStatusResponder } from "../api/incident.api";
import IncidentCard from "../components/IncidentCard";
import { socket } from "../socket/socket";

export default function WorkerDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [me, setMe] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    const res = await fetchAssignments();
    setIncidents(res.data.data);
  };

  useEffect(() => {
    (async () => {
      const meRes = await meResponder();
      setMe(meRes.data.data);
      const id = meRes.data?.data?._id;
      if (id) socket.emit("responder:join", id);
    })();
    load();
    socket.on("assignment:new", (incident) => {
      // Append or update
      setIncidents((prev) => {
        const idx = prev.findIndex((p) => p._id === incident._id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = incident;
          return next;
        }
        return [incident, ...prev];
      });
    });
    return () => socket.off("assignment:new");
  }, []);

  const handleStatusUpdate = async (incidentId, status) => {
    try {
      await updateIncidentStatusResponder(incidentId, status);
      load(); // Reload assignments
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutResponder();
    } finally {
      localStorage.removeItem("responderId");
      navigate("/worker/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Responder Dashboard</h2>
            {me && (
              <p className="text-xs text-slate-400 mt-2">{me.name} • {me.type}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-800/70 text-white border border-slate-600 hover:bg-slate-700"
          >
            Logout
          </button>
        </header>
        {incidents.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6 text-center">No assignments yet.</div>
        ) : (
          <div className="space-y-4">
            {incidents.map((i) => (
              <IncidentCard key={i._id} incident={i} responder onStatusUpdate={handleStatusUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
