import { useEffect, useState } from "react";
import { fetchIncidents, upvoteIncident } from "../api/incident.api";
import { socket } from "../socket/socket";
import { useNavigate } from "react-router-dom";
import IncidentForm from "../components/IncidentForm";
import { getDeviceId } from "../utils/deviceId";
import { distanceInMeters } from "../utils/geo";
import { Activity } from "lucide-react";

export default function CitizenFeed() {
  const [incidents, setIncidents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
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
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {}
      );
    }

    return () => {
      socket.off("incident:new", load);
      socket.off("incident:update", load);
    };
  }, []);

  const activeIncidents = incidents.filter(
    (i) => i.status !== "resolved"
  );

  const handleUpvote = async (incidentId, deviceId) => {
    try {
      await upvoteIncident(incidentId, deviceId);
      load();
    } catch (e) {
      console.error("Upvote failed", e);
    }
  };

  const getDistance = (incident) => {
    if (!userLocation || !incident.location) return null;
    const dist = distanceInMeters(
      userLocation.lat,
      userLocation.lng,
      incident.location.lat,
      incident.location.lng
    );
    if (dist < 1000) return `${Math.round(dist)} m`;
    return `${(dist / 1000).toFixed(1)} km`;
  };

  const getTimeAgo = (date) => {
    if (!date) return "";
    const now = new Date();
    const incidentDate = new Date(date);
    const diffMs = now - incidentDate;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day`;
  };

  return (
    <div className="min-h-screen bg-[#F5F1EB] font-sans text-[#423D47]" style={{ fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif' }}>
      <div className="max-w-7xl mx-auto p-4 md:p-10">
        
        {/* Simplified Branding Header */}
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
          
          {/* Left Column - 60% */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#D9D1D1] rounded-[2.5rem] p-8 shadow-sm border border-black/5">
              <h2 className="text-xl font-bold text-[#5A5266] mb-6 tracking-tight">Report an Incident</h2>
              <IncidentForm />
            </div>

            <div className="bg-[#E7E0E0] rounded-[2rem] p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#423D47] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">!</div>
                <h3 className="font-bold text-[#423D47]">Recent Alerts</h3>
              </div>
              <p className="text-sm text-[#5A5266] leading-relaxed">
                Stay alert for emergencies nearby. Verification from citizens helps responders prioritize the most critical cases.
              </p>
            </div>
          </div>

          {/* Right Column - 40% */}
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
                        <div className="w-20 h-20 bg-[#F5F1EB] rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center border border-black/5">
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
                            <button className="bg-[#423D47] text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
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