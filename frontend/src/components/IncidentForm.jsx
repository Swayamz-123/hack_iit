import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createIncident } from "../api/incident.api";
import MapPreview from "./MapReview";
import { getDeviceId } from "../utils/deviceId";

export default function IncidentForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "accident",
    description: "",
    severity: "low",
  });

  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoadingLocation(false);
      },
      () => {
        alert("Location permission denied");
        setLoadingLocation(false);
      }
    );
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (!location) {
      alert("Location not available");
      return;
    }

    await createIncident({
      ...form,
      location,
      deviceId: getDeviceId(),
    });

    // 🔁 Redirect to feed after success
    navigate("/");
  };

  return (
    <form
      onSubmit={submit}
      className="bg-linear-to-br from-slate-900/95 to-indigo-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8 border border-white/20 border-l-4 border-red-500/80 max-w-2xl mx-auto"
    >
      <h3 className="text-2xl font-black capitalize bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-8 text-center drop-shadow-2xl">
        Report Incident
      </h3>

      {/* Incident Type */}
      <label className="block mb-6">
        <span className="block text-base font-bold text-amber-300 mb-3 tracking-wide">
          Incident Type
        </span>
        <select
          className="w-full px-5 py-3 rounded-xl border-2 border-slate-700/50 bg-white/10 backdrop-blur-sm text-lg font-semibold text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400/80 transition-all duration-300 hover:border-blue-400/50 hover:shadow-xl"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="accident">🚗 Accident</option>
          <option value="medical">🏥 Medical Emergency</option>
          <option value="fire">🔥 Fire</option>
          <option value="other">❓ Other</option>
        </select>
      </label>

      {/* Description */}
      <label className="block mb-6">
        <span className="block text-base font-bold text-amber-300 mb-3 tracking-wide">
          Description
        </span>
        <textarea
          placeholder="Describe what happened in detail..."
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="mt-1 w-full rounded-xl border-2 border-slate-700/50 px-5 py-4 text-base resize-none h-32 bg-white/10 backdrop-blur-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400/80 transition-all duration-300 hover:border-blue-400/50 hover:shadow-xl min-h-[120px]"
        />
      </label>

      {/* Severity */}
      <label className="block mb-8">
        <span className="block text-base font-bold text-amber-300 mb-3 tracking-wide">
          Severity Level
        </span>
        <select
          className="w-full px-5 py-3 rounded-xl border-2 border-slate-700/50 bg-white/10 backdrop-blur-sm text-lg font-semibold text-slate-100 focus:outline-none focus:ring-4 focus:ring-orange-500/50 focus:border-orange-400/80 transition-all duration-300 hover:border-orange-400/50 hover:shadow-xl"
          value={form.severity}
          onChange={(e) =>
            setForm({ ...form, severity: e.target.value })
          }
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High Priority</option>
        </select>
      </label>

      {/* Location */}
      {loadingLocation && (
        <div className="mb-6 p-6 bg-slate-800/50 rounded-2xl border-2 border-yellow-500/30 text-center">
          <p className="text-lg text-amber-300 font-semibold animate-pulse">
            📡 Detecting your location...
          </p>
        </div>
      )}

      {location && (
        <div className="mb-8">
          <p className="text-base text-emerald-300 mb-4 font-semibold bg-emerald-500/20 p-3 rounded-xl border border-emerald-400/30">
            📍 Location Locked: 
            <span className="ml-2 bg-black/20 px-3 py-1 rounded-lg text-sm font-mono">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </p>

          <div className="rounded-2xl overflow-hidden border-2 border-slate-700/50 shadow-2xl bg-white/5 backdrop-blur-md">
            <MapPreview lat={location.lat} lng={location.lng} />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!location}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-2xl font-black text-lg shadow-2xl hover:from-red-600 hover:to-orange-600 hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] border-2 border-red-400/50 backdrop-blur-sm disabled:from-slate-700/50 disabled:to-slate-800/50 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 disabled:transform-none"
      >
        🚨 Submit Incident Report
      </button>
    </form>
  );
}
