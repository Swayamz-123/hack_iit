import { useEffect, useState } from "react";
import { fetchIncidents, logoutAdmin } from "../api/incident.api";
import { socket } from "../socket/socket";
import { useNavigate } from "react-router-dom";
import { distanceInMeters } from "../utils/geo";
import AdminControls from "../components/AdminControls";
import MapProvider from "../components/MapProvider";
import { Activity, LogOut, MapPin, Layers, X, CheckCircle, Image as ImageIcon } from "lucide-react";

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const navigate = useNavigate();
  // Advanced Filters
  const [filterType, setFilterType] = useState("all");
  const [timeWindow, setTimeWindow] = useState("all");
  const [radiusKm, setRadiusKm] = useState(0);
  const [center, setCenter] = useState(null);
  const [viewMode, setViewMode] = useState("all");

  const load = async () => {
    const res = await fetchIncidents();
    setIncidents(res.data.data);
  };

  const { verify, resolve, saveNotes } = AdminControls({ refresh: load });

  useEffect(() => {
    load();
    socket.on("incident:update", load);
    socket.on("incident:new", load);
    return () => {
      socket.off("incident:update", load);
      socket.off("incident:new", load);
    };
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

  const filtered = incidents.filter(
    (i) =>
      i.status !== "resolved" &&
      (filterType === "all" || i.type === filterType) &&
      withinTime(i.createdAt) &&
      withinRadius(i)
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
    <div className="min-h-screen bg-[#F5F1EB] font-sans text-[#423D47]" style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* Details Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-5xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">{selectedIncident.type} Report</h3>
                  <p className="text-[10px] font-bold text-[#8E8699] uppercase tracking-widest mt-1">ID: {selectedIncident._id.slice(-8)}</p>
                </div>
                <button onClick={() => setSelectedIncident(null)} className="p-2 bg-[#F5F1EB] rounded-full hover:bg-[#D9D1D1]">
                  <X size={20} />
                </button>
              </div>

              {/* Media Preview */}
              <div className="w-full h-56 bg-[#F5F1EB] rounded-4xl overflow-hidden border border-black/5 flex items-center justify-center">
                {selectedIncident.media?.length > 0 ? (
                  <img src={selectedIncident.media[0]} className="w-full h-full object-cover" alt="Incident Evidence" />
                ) : (
                  <div className="flex flex-col items-center opacity-30">
                    <ImageIcon size={32} />
                    <p className="text-[10px] font-bold uppercase mt-2">No Media Provided</p>
                  </div>
                )}
              </div>

              {/* Map */}
              <div className="w-full h-44 bg-stone-200 rounded-4xl overflow-hidden border border-black/5">
                <MapProvider incidents={[selectedIncident]} center={selectedIncident.location} />
              </div>

              <div className="bg-[#F5F1EB] p-6 rounded-3xl border border-black/5">
                <span className="text-[10px] font-black uppercase opacity-50 block mb-2 tracking-widest">Incident Description</span>
                <p className="text-sm text-[#5A5266] leading-relaxed">{selectedIncident.description}</p>
              </div>

              <div className="flex gap-4">
                {selectedIncident.status !== 'verified' && selectedIncident.status !== 'resolved' && (
                  <button onClick={() => { verify(selectedIncident._id); setSelectedIncident(null); }} className="flex-1 bg-[#7DA99C] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
                    Verify Incident
                  </button>
                )}
                <button onClick={() => { resolve(selectedIncident._id); setSelectedIncident(null); }} className="flex-1 bg-[#423D47] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                  <CheckCircle size={16} /> Resolve Issue
                </button>
                <button onClick={() => setSelectedIncident(null)} className="flex-1 bg-[#F5F1EB] text-[#423D47] py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-black/10">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-400 mx-auto p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#D9D1D1] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#7DA99C] rounded-2xl flex items-center justify-center text-white shadow-sm font-black italic">E</div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Em-Grid</h1>
              <p className="text-[10px] font-bold text-[#8E8699] uppercase tracking-[0.2em] mt-1">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/50 px-4 py-2 rounded-xl border border-black/5 flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] font-bold text-[#8E8699] uppercase">Active Alerts</p>
                <p className="text-sm font-black text-[#7DA99C]">{filtered.length}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-3 bg-white border border-black/5 rounded-2xl text-[#B08991] hover:bg-red-50 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh]">
          {/* Left Column: Map + Filters */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-[#D9D1D1] p-4 rounded-5xl grid grid-cols-2 md:grid-cols-5 gap-3 items-center border border-black/5 shadow-sm">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-[#5A5266] ml-2">Type</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-white/60 border-none rounded-xl text-xs font-bold p-2.5 outline-none">
                  <option value="all">All Types</option>
                  <option value="accident">Accident</option>
                  <option value="medical">Medical</option>
                  <option value="fire">Fire</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-[#5A5266] ml-2">Timeframe</label>
                <select value={timeWindow} onChange={(e) => setTimeWindow(e.target.value)} className="w-full bg-white/60 border-none rounded-xl text-xs font-bold p-2.5 outline-none">
                  <option value="all">All Time</option>
                  <option value="15">Last 15m</option>
                  <option value="60">Last 1h</option>
                  <option value="1440">Last 24h</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-[#5A5266] ml-2">Radius (km)</label>
                <input type="number" min="0" value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} className="w-full bg-white/60 border-none rounded-xl text-xs font-bold p-2.5 focus:ring-0" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-[#5A5266] ml-2">View</label>
                <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="w-full bg-white/60 border-none rounded-xl text-xs font-bold p-2.5 outline-none">
                  <option value="all">Standard</option>
                  <option value="prioritized">Priority Grid</option>
                </select>
              </div>

              <div className="pt-4 flex items-center gap-2">
                <button onClick={useMyLocation} className="flex-1 bg-[#423D47] text-white text-[10px] font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2">
                  <MapPin size={14} /> My Location
                </button>
              </div>
            </div>

            {/* Main Map */}
            <div className="flex-1 bg-white rounded-5xl overflow-hidden border border-[#D9D1D1] relative">
              {!selectedIncident && (
                <MapProvider
                  center={center}
                  incidents={filtered}
                  onPinClick={(incident) => setSelectedIncident(incident)}
                />
              )}
            </div>
          </div>

          {/* Right Column: Live Feed */}
          <div className="lg:col-span-4 flex flex-col bg-white/40 rounded-5xl border border-white/60 p-6 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-xl font-black tracking-tighter">Live Incident Feed</h3>
              <Layers className="text-[#8E8699]" size={20} />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {(viewMode === 'prioritized' ? [...filtered].sort((a,b)=>score(b)-score(a)) : filtered).map((incident) => (
                <div
                  key={incident._id}
                  onClick={() => setCenter(incident.location)}
                  className="bg-white rounded-4xl p-5 border border-black/5 shadow-sm hover:border-[#7DA99C]/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${incident.severity === 'high' ? 'bg-[#B08991]/10 text-[#B08991]' : incident.severity === 'medium' ? 'bg-[#E6B17A]/10 text-[#E6B17A]' : 'bg-[#E6D67A]/10 text-[#E6D67A]'} w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-black/5`}>
                      <MapPin size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-xs uppercase truncate leading-tight">{incident.type}</h4>
                        <span className="text-[10px] font-black text-[#7DA99C]">{incident.upvotes || 0}</span>
                      </div>
                      <p className="text-[10px] text-[#8E8699] font-medium mt-0.5 capitalize">{incident.severity} Severity • {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>

                      <div className="flex gap-2 mt-4">
                        {incident.status !== 'verified' && incident.status !== 'resolved' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); verify(incident._id); }}
                            className="flex-1 bg-[#F5F1EB] text-[#423D47] text-[9px] font-black uppercase py-2.5 rounded-xl hover:bg-[#D9D1D1]"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); resolve(incident._id); }}
                          className="flex-1 bg-[#F5F1EB] text-[#423D47] text-[9px] font-black uppercase py-2.5 rounded-xl hover:bg-[#D9D1D1]"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedIncident(incident); }}
                          className="flex-1 bg-[#423D47] text-white text-[9px] font-black uppercase py-2.5 rounded-xl"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
