import { useEffect, useState } from "react";
import { fetchIncidents, upvoteIncident } from "../api/incident.api";
import { socket } from "../socket/socket";
import { useNavigate } from "react-router-dom";
import IncidentForm from "../components/IncidentForm";
import { getDeviceId } from "../utils/deviceId";
import { distanceInMeters } from "../utils/geo";

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
    
    // Get user location for distance calculation
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
      load(); // Reload to get updated upvote count
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
    <div className="min-h-screen bg-[#D1BADB] p-8">
      <div className="h-[calc(100vh-4rem)] max-w-[85%] mx-auto bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl shadow-xl overflow-hidden flex">
        {/* Left Sidebar - 15% */}
        <div className="w-[15%] bg-stone-50 flex flex-col border-r border-stone-300/50">
          {/* Logo */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L12 22M2 12L22 12"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-gray-800">Em-Grid</h1>
            </div>
          </div>

          {/* Logout Button */}
          <div className="mt-auto p-6">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium py-2 px-4 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Log out
            </button>
          </div>
        </div>

        {/* Middle Section - Form - 55% */}
        <div className="flex-[55] overflow-y-auto bg-stone-50 p-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
              Connecting emergencies to care.
            </h2>
            <IncidentForm />
          </div>
        </div>


        {/* Right Section - Recent Incidents - 30% */}
        <div className="w-[30%] bg-stone-100 border-l border-stone-300/50 overflow-y-auto p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Local Incidents & Verification
            </h3>
            <p className="text-sm text-gray-600">
              Recent accidents within 1km radius
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search incidents..."
              className="w-full px-4 py-2 pl-10 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-700"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Incident Cards */}
          <div className="space-y-4">
            {activeIncidents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No active incidents</p>
              </div>
            ) : (
              activeIncidents.map((incident) => {
                const deviceId = getDeviceId();
                const hasVoted = Array.isArray(incident.voters) && incident.voters.includes(deviceId);
                const distance = getDistance(incident);
                const timeAgo = getTimeAgo(incident.createdAt);

                return (
                  <div
                    key={incident._id}
                    className="bg-white rounded-lg border border-stone-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-20 h-20 bg-stone-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {incident.media && incident.media.length > 0 ? (
                          <img
                            src={incident.media[0]}
                            alt="Incident"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1 capitalize">
                          {incident.type} Emergency
                        </h4>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {incident.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          {timeAgo && <span>{timeAgo} ago</span>}
                          {distance && (
                            <>
                              <span>•</span>
                              <span>{distance}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-800">
                            {incident.upvotes || 0}
                          </span>
                          <button
                            onClick={() => !hasVoted && handleUpvote(incident._id, deviceId)}
                            disabled={hasVoted}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                            Upvote
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
  );
}
