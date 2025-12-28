import { useEffect, useState } from "react";
import { fetchIncidents, upvoteIncident } from "../api/incident.api";
import { socket } from "../socket/socket";
import { useNavigate } from "react-router-dom";
import IncidentForm from "../components/IncidentForm";
import { getDeviceId } from "../utils/deviceId";
import { distanceInMeters } from "../utils/geo";
import { Activity, X, Info } from "lucide-react"; // Added Info and X icons

export default function CitizenFeed() {
  const [incidents, setIncidents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null); // New state for Details
  const navigate = useNavigate();

  const load = async () => {
    const res = await fetchIncidents();
    setIncidents(res.data.data);
  };

  useEffect(() => {
    load();
    socket.on("incident:new", load);
    socket.on("incident:update", load);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }

    return () => {
      socket.off("incident:new", load);
      socket.off("incident:update", load);
    };
  }, []);

  const activeIncidents = incidents.filter((i) => i.status !== "resolved");

  const handleUpvote = async (incidentId, deviceId) => {
    try {
      await upvoteIncident(incidentId, deviceId);
      load();
    } catch (e) { console.error("Upvote failed", e); }
  };

  const getDistance = (incident) => {
    if (!userLocation || !incident.location) return null;
    const dist = distanceInMeters(userLocation.lat, userLocation.lng, incident.location.lat, incident.location.lng);
    return dist < 1000 ? `${Math.round(dist)} m` : `${(dist / 1000).toFixed(1)} km`;
  };

  const getTimeAgo = (date) => {
    if (!date) return "";
    const diffMins = Math.floor((new Date() - new Date(date)) / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    return diffHours < 24 ? `${diffHours} hr` : `${Math.floor(diffHours / 24)} day`;
  };

  return (
    <div className="min-h-screen bg-[#F5F1EB] font-sans text-[#423D47] relative" style={{ fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Detail Overlay (Modal) */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-[#423D47]">
                    {selectedIncident.type} Report
                  </h3>
                  <p className="text-xs font-bold text-[#8E8699] uppercase tracking-widest mt-1">Incident ID: {selectedIncident._id.slice(-6)}</p>
                </div>
                <button onClick={() => setSelectedIncident(null)} className="p-2 bg-[#F5F1EB] rounded-full hover:bg-[#D9D1D1] transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-[#F5F1EB] rounded-3xl p-6 text-sm leading-relaxed text-[#5A5266] border border-black/5">
                <span className="font-black text-[10px] uppercase block mb-2 opacity-50 tracking-widest">Description</span>
                {selectedIncident.description}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#D9D1D1] p-4 rounded-2xl">
                  <span className="font-black text-[9px] uppercase block mb-1 opacity-60">Distance</span>
                  <p className="font-bold">{getDistance(selectedIncident) || "N/A"}</p>
                </div>
                <div className="bg-[#D9D1D1] p-4 rounded-2xl">
                  <span className="font-black text-[9px] uppercase block mb-1 opacity-60">Reported</span>
                  <p className="font-bold">{getTimeAgo(selectedIncident.createdAt)} ago</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedIncident(null)}
                className="w-full bg-[#423D47] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-10">
        <header className="mb-12 flex items-center gap-4 border-b border-[#D9D1D1] pb-8">
          <div className="w-12 h-12 bg-[#7DA99C] rounded-2xl flex items-center justify-center text-white shadow-sm">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Em-Grid</h1>
            <p className="text-[10px] font-bold text-[#8E8699] uppercase tracking-[0.2em] mt-1">Emergency Protocol System</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#D9D1D1] rounded-[2.5rem] p-8 shadow-sm border border-black/5">
              <h2 className="text-xl font-bold text-[#5A5266] mb-6 tracking-tight">Report an Incident</h2>
              <IncidentForm />
            </div>

            <div className="bg-[#E7E0E0] rounded-4xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#423D47] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">!</div>
                <h3 className="font-bold text-[#423D47]">Recent Alerts</h3>
              </div>
              <p className="text-sm text-[#5A5266] leading-relaxed">
                Stay alert for emergencies nearby. Verification from citizens helps responders prioritize the most critical cases.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/40 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-sm border border-white/60">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-[#423D47] mb-1 tracking-tight">Local Incidents & Verification</h3>
              <p className="text-sm text-[#8E8699] font-medium italic">Recent activity within 1km radius</p>
            </div>

            <div className="mb-8 relative">
              <input
                type="text"
                placeholder="Search grid..."
                className="w-full bg-[#EDE7E1] border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#7DA99C]/50 text-[#423D47] placeholder-[#8E8699]"
              />
              <svg className="absolute left-4 top-3.5 h-5 w-5 text-[#8E8699]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {activeIncidents.length === 0 ? (
                <div className="text-center py-20 text-[#8E8699]">
                  <p className="font-bold uppercase tracking-widest text-xs opacity-50">No active reports</p>
                </div>
              ) : (
                activeIncidents.map((incident) => {
                  const deviceId = getDeviceId();
                  const hasVoted = Array.isArray(incident.voters) && incident.voters.includes(deviceId);
                  return (
                    <div key={incident._id} className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-[#F5F1EB] rounded-2xl shrink-0 overflow-hidden flex items-center justify-center border border-black/5">
                          {incident.media?.[0] ? (
                            <img src={incident.media[0]} alt="Incident" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-[#8E8699] opacity-40 uppercase">No Media</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-[#423D47] text-base capitalize truncate">{incident.type} Emergency</h4>
                            <span className="text-lg font-black text-[#423D47]">{incident.upvotes || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-[#8E8699] mt-1 mb-3">
                            <span>{getTimeAgo(incident.createdAt)} ago</span>
                            <span className="opacity-30">|</span>
                            <span>{getDistance(incident)}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => !hasVoted && handleUpvote(incident._id, deviceId)}
                              disabled={hasVoted}
                              className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                hasVoted ? 'bg-[#7DA99C]/20 text-[#7DA99C]' : 'bg-[#EDE7E1] text-[#423D47]'
                              }`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                              </svg>
                              {hasVoted ? 'Verified' : 'Upvote'}
                            </button>
                            {/* Updated Details Button to trigger setSelectedIncident */}
                            <button 
                              onClick={() => setSelectedIncident(incident)}
                              className="bg-[#423D47] text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}