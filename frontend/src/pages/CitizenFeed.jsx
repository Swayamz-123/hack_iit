import { useEffect, useState } from "react";
import { fetchIncidents, upvoteIncident } from "../api/incident.api";
import { socket } from "../socket/socket";
import { useNavigate } from "react-router-dom";
import IncidentForm from "../components/IncidentForm";
import MapPreview from "../components/MapReview";
import { getDeviceId } from "../utils/deviceId";
import { distanceInMeters } from "../utils/geo";
import { Activity } from "lucide-react";

export default function CitizenFeed() {
  const [incidents, setIncidents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
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

  const getDistanceInMeters = (incident) => {
    if (!userLocation || !incident.location) return null;
    return distanceInMeters(
      userLocation.lat,
      userLocation.lng,
      incident.location.lat,
      incident.location.lng
    );
  };

  const getDistance = (incident) => {
    const dist = getDistanceInMeters(incident);
    if (dist === null) return null;
    if (dist < 1000) return `${Math.round(dist)} m`;
    return `${(dist / 1000).toFixed(1)} km`;
  };

  const canUpvote = (incident) => {
    if (!userLocation) return false;
    const dist = getDistanceInMeters(incident);
    return dist !== null && dist <= 2000; // 2km = 2000m
  };

  const activeIncidents = incidents.filter((i) => {
    if (i.status === "resolved") return false;
    // If no location, show all incidents
    if (!userLocation) return true;
    // If location available, filter by 15km radius
    const dist = getDistanceInMeters(i);
    return dist !== null && dist <= 15000; // 15km = 15000m
  });

  const handleUpvote = async (incidentId, deviceId) => {
    try {
      await upvoteIncident(incidentId, deviceId);
      load();
    } catch (e) {
      console.error("Upvote failed", e);
    }
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

          {/* Right Column - 40% */}
          <div className="lg:col-span-5 bg-white/40 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-sm border border-white/60">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-[#423D47] mb-1 tracking-tight">Local Incidents & Verification</h3>
              <p className="text-sm text-[#8E8699] font-medium italic">
                {userLocation ? "Recent activity within 15km radius" : "All incidents (location not enabled)"}
              </p>
              {userLocation && (
                <p className="text-xs text-[#7DA99C] mt-2 font-bold">✓ Location enabled • Upvotes available within 2km</p>
              )}
              {!userLocation && (
                <p className="text-xs text-[#B08991] mt-2 font-bold">⚠ Enable location to upvote incidents</p>
              )}
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
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-[#423D47] text-base capitalize truncate">{incident.type} Emergency</h4>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              incident.status === 'verified' ? 'bg-emerald-500/20 text-emerald-700' :
                              incident.status === 'resolved' ? 'bg-blue-500/20 text-blue-700' :
                              'bg-yellow-500/20 text-yellow-700'
                            }`}>
                              {incident.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-[#8E8699] mt-1 mb-3">
                            <span>{getTimeAgo(incident.createdAt)} ago</span>
                            <span className="opacity-30">|</span>
                            <span>{getDistance(incident)}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => !hasVoted && canUpvote(incident) && handleUpvote(incident._id, deviceId)}
                              disabled={hasVoted || !canUpvote(incident)}
                              title={!canUpvote(incident) ? "Upvotes only available within 2km" : ""}
                              className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                hasVoted ? 'bg-[#7DA99C]/20 text-[#7DA99C]' : 
                                !canUpvote(incident) ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' :
                                'bg-[#EDE7E1] text-[#423D47]'
                              }`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                              </svg>
                              {hasVoted ? `✓ Voted (${incident.upvotes})` : 
                               !canUpvote(incident) ? `📍 Too far (${incident.upvotes})` :
                               `👍 Upvote (${incident.upvotes})`}
                            </button>
                            <button 
                              onClick={() => setSelectedIncident(incident)}
                              className="bg-[#423D47] text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#5A5266] transition-all"
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

        {/* Modal Popup */}
        {selectedIncident && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#F5F1EB] rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-black/5">
              {/* Modal Header */}
              <div className="sticky top-0 bg-[#F5F1EB] flex items-center justify-between p-6 border-b border-[#D9D1D1]">
                <h2 className="text-2xl font-black text-[#423D47] capitalize">{selectedIncident.type} Emergency</h2>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#EDE7E1] text-[#423D47] hover:bg-[#D9D1D1] transition-all text-xl font-bold"
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

                {/* Images Gallery */}
                {selectedIncident.media && selectedIncident.media.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#5A5266] uppercase tracking-wider">Evidence</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedIncident.media.map((img, idx) => (
                        <div key={idx} className="rounded-2xl overflow-hidden border border-black/5 shadow-sm">
                          <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#5A5266] uppercase tracking-wider">Description</h3>
                  <p className="text-base text-[#423D47] leading-relaxed bg-[#EDE7E1] p-4 rounded-2xl">
                    {selectedIncident.description}
                  </p>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#5A5266] uppercase tracking-wider">Location</h3>
                  <div className="bg-[#EDE7E1] p-4 rounded-2xl">
                    <p className="text-sm font-mono text-[#423D47]">
                      📍 {selectedIncident.location?.lat?.toFixed(4)}, {selectedIncident.location?.lng?.toFixed(4)}
                    </p>
                    {userLocation && (
                      <p className="text-xs text-[#8E8699] mt-2">
                        Distance: {getDistance(selectedIncident)}
                      </p>
                    )}
                  </div>
                  {selectedIncident.location?.lat && selectedIncident.location?.lng && (
                    <div className="rounded-2xl overflow-hidden border border-black/5 shadow-sm h-64">
                      <MapPreview lat={selectedIncident.location.lat} lng={selectedIncident.location.lng} />
                    </div>
                  )}
                </div>

                {/* Severity & Details */}
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
                      <p className="text-2xl font-black text-emerald-700">👍 {selectedIncident.upvotes}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="bg-[#E7E0E0] p-4 rounded-2xl">
                  <p className="text-xs text-[#8E8699] font-bold">
                    📅 Reported {getTimeAgo(selectedIncident.createdAt)} ago
                  </p>
                  <p className="text-xs text-[#8E8699] font-bold mt-1">
                    {new Date(selectedIncident.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Upvote Button */}
                <div className="pt-4 border-t border-[#D9D1D1]">
                  {!Array.isArray(selectedIncident.voters) || !selectedIncident.voters.includes(getDeviceId()) ? (
                    <button
                      onClick={async () => {
                        await handleUpvote(selectedIncident._id, getDeviceId());
                        setSelectedIncident(null);
                      }}
                      className="w-full bg-[#7DA99C] hover:bg-[#6A9488] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-md"
                    >
                      👍 Upvote This Incident
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-[#7DA99C]/20 text-[#7DA99C] py-4 rounded-2xl font-black text-sm uppercase tracking-wider cursor-not-allowed opacity-60"
                    >
                      ✓ Already Upvoted
                    </button>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="w-full bg-[#EDE7E1] hover:bg-[#D9D1D1] text-[#423D47] py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}