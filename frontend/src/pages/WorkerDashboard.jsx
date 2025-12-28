import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAssignments, meResponder, logoutResponder, updateIncidentStatusResponder } from "../api/incident.api";
import IncidentCard from "../components/IncidentCard";
import MapPreview from "../components/MapReview";
import Logo from "../components/Logo";
import { socket } from "../socket/socket";

export default function WorkerDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [me, setMe] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
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
                <Logo />
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
                        <IncidentCard key={i._id} incident={i} responder onStatusUpdate={handleStatusUpdate} onViewMap={setSelectedIncident} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map View Modal for Responder */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#F2EDE9] rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-black/5">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#F2EDE9] flex items-center justify-between p-6 border-b border-[#D9D1D1]">
              <h2 className="text-2xl font-black text-[#4A4453] capitalize">{selectedIncident.type} Emergency</h2>
              <button
                onClick={() => setSelectedIncident(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#EDE7E1] text-[#4A4453] hover:bg-[#D9D1D1] transition-all text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#8E8699] uppercase tracking-wider">Status:</span>
                <span className={`text-sm font-bold px-4 py-2 rounded-full ${
                  selectedIncident.status === 'verified' ? 'bg-emerald-500/20 text-emerald-700' :
                  selectedIncident.status === 'resolved' ? 'bg-blue-500/20 text-blue-700' :
                  'bg-yellow-500/20 text-yellow-700'
                }`}>
                  {selectedIncident.status.toUpperCase()}
                </span>
              </div>

              {/* Map */}
              {selectedIncident.location?.lat && selectedIncident.location?.lng && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#5A5266] uppercase tracking-wider">Location Map</h3>
                  <div className="rounded-2xl overflow-hidden border border-black/5 shadow-md h-96 bg-white">
                    <MapPreview lat={selectedIncident.location.lat} lng={selectedIncident.location.lng} />
                  </div>
                  <p className="text-sm font-mono text-[#8E8699]">
                    📍 {selectedIncident.location.lat.toFixed(4)}, {selectedIncident.location.lng.toFixed(4)}
                  </p>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#5A5266] uppercase tracking-wider">Description</h3>
                <p className="text-base text-[#4A4453] leading-relaxed bg-[#EDE7E1] p-4 rounded-2xl">
                  {selectedIncident.description}
                </p>
              </div>

              {/* Admin Instructions */}
              {selectedIncident.internalNotes && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#5A5266] uppercase tracking-wider">Admin Instructions</h3>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                    <p className="text-sm text-amber-900">{selectedIncident.internalNotes}</p>
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#5A5266] uppercase tracking-wider">Severity</h3>
                  <div className="bg-[#EDE7E1] p-3 rounded-xl">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      selectedIncident.severity === 'high' ? 'bg-red-500/20 text-red-700' :
                      selectedIncident.severity === 'medium' ? 'bg-orange-500/20 text-orange-700' :
                      'bg-yellow-500/20 text-yellow-700'
                    }`}>
                      {selectedIncident.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#5A5266] uppercase tracking-wider">Upvotes</h3>
                  <div className="bg-emerald-500/10 p-3 rounded-xl">
                    <p className="text-lg font-black text-emerald-700">👍 {selectedIncident.upvotes}</p>
                  </div>
                </div>
              </div>

              {/* Images Gallery */}
              {selectedIncident.media && selectedIncident.media.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#5A5266] uppercase tracking-wider">Evidence</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedIncident.media.map((img, idx) => (
                      <div key={idx} className="rounded-2xl overflow-hidden border border-black/5 shadow-sm">
                        <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-40 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mark as Resolved */}
              {selectedIncident.status === 'verified' && (
                <button
                  onClick={async () => {
                    await handleStatusUpdate(selectedIncident._id, 'resolved');
                    setSelectedIncident(null);
                  }}
                  className="w-full bg-[#7DA99C] hover:bg-[#6A9488] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-md"
                >
                  ✓ Mark as Resolved
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedIncident(null)}
                className="w-full bg-[#EDE7E1] hover:bg-[#D9D1D1] text-[#4A4453] py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
