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
    <div className="min-h-screen bg-[#D1C4D1] flex items-center justify-center p-4 sm:p-8 font-sans antialiased">
      <div className="max-w-6xl w-full bg-[#F2EDE9] rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border-[12] border-white/40">
        <div className="p-8 md:p-16">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#7DA99C] rounded-2xl flex items-center justify-center shadow-sm">
                  <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45"></div>
                </div>
                <span className="text-[#5A5266] font-black text-2xl tracking-tighter uppercase">Em-Grid</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-[#4A4453] tracking-[ -0.02em] leading-none">
                Responder <span className="opacity-40 italic font-medium">Dashboard</span>
              </h1>
              {me && (
                <p className="text-sm text-[#8E8699] mt-2 font-medium">
                  🚔 {me.name} • {me.type.toUpperCase()}
                </p>
              )}
            </div>

            <div className="hidden md:flex flex-col items-end gap-3">
              <div className="text-[#9A8FAB] text-xs font-bold uppercase tracking-widest">Status</div>
              <div className="flex items-center gap-2 text-[#7DA99C] font-bold">
                <span className="w-2 h-2 bg-[#7DA99C] rounded-full animate-pulse"></span>
                System Operational
              </div>
              <button
                onClick={handleLogout}
                className="mt-4 px-4 py-2 rounded-lg text-xs font-bold bg-white text-[#5A5266] border border-white/40 shadow-sm hover:shadow-md transition"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="col-span-1">
              <div className="group relative bg-white/60 p-1 rounded-[2.5rem] transition-all hover:bg-white shadow-lg">
                <div className="p-6 rounded-[2.3rem]">
                  <h3 className="text-xl font-black text-[#4A4453] mb-2">Your Status</h3>
                  <p className="text-sm text-[#8E8699]">Connected as responder. Check assignments and update statuses.</p>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <div className="group relative bg-white/60 p-1 rounded-[2.5rem] transition-all hover:bg-white shadow-lg">
                <div className="p-6 rounded-[2.3rem]">
                  {incidents.length === 0 ? (
                    <div className="rounded-lg border border-[#E6E0DF] bg-white/50 p-8 text-center">
                      <p className="text-sm font-semibold text-[#4A4453]">✓ All caught up!</p>
                      <p className="text-xs text-[#8E8699] mt-2">No new assignments at this time</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {incidents.map((i) => (
                        <IncidentCard key={i._id} incident={i} responder onStatusUpdate={handleStatusUpdate} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
