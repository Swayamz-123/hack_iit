import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createIncident, uploadMedia } from "../api/incident.api";
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
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!location) {
      alert("Location not available");
      return;
    }

    setUploading(true);
    try {
      const mediaUrls = [];
      
      // Upload media if present
      if (mediaFile) {
        const uploadRes = await uploadMedia(mediaFile);
        if (uploadRes.data.success) {
          mediaUrls.push(uploadRes.data.url);
        }
      }

      await createIncident({
        ...form,
        location,
        deviceId: getDeviceId(),
        media: mediaUrls,
      });
      setSuccessMsg("Incident reported successfully! Redirecting to feed...");
      // 🔁 Redirect to feed after success
      setTimeout(() => navigate("/feed"), 1200);
    } catch (error) {
      alert("Failed to submit incident: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-linear-to-br from-slate-900/95 to-indigo-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8 border border-l-4 border-red-500/80 max-w-2xl mx-auto"
    >
      {successMsg && (
        <div className="mb-4 rounded-lg border border-emerald-600/40 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-200 font-semibold">
          {successMsg}
        </div>
      )}
      <h3 className="text-2xl font-black capitalize bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-8 text-center drop-shadow-2xl">
        Report Incident
      </h3>

      {/* Incident Type */}
      <label className="block mb-6">
        <span className="block text-sm font-bold text-slate-300 mb-3">
          Incident Type
        </span>
        <select
          className="w-full px-4 py-2.5 rounded-lg border border-slate-700/60 bg-slate-900/60 text-sm font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/50 transition"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="accident">🚗 Accident</option>
          <option value="medical">🏥 Medical</option>
          <option value="fire">🔥 Fire</option>
          <option value="other">❓ Other</option>
        </select>
      </label>

      {/* Description */}
      <label className="block mb-6">
        <span className="block text-sm font-bold text-slate-300 mb-3">
          Description
        </span>
        <textarea
          placeholder="Describe the incident in detail..."
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full rounded-lg border border-slate-700/60 px-4 py-3 text-sm resize-none bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/50 transition"
          rows={5}
        />
      </label>

      {/* Severity */}
      <label className="block mb-6">
        <span className="block text-sm font-bold text-slate-300 mb-3">
          Severity
        </span>
        <select
          className="w-full px-4 py-2.5 rounded-lg border border-slate-700/60 bg-slate-900/60 text-sm font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400/50 transition"
          value={form.severity}
          onChange={(e) =>
            setForm({ ...form, severity: e.target.value })
          }
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
      </label>

      {/* Media Upload */}
      <label className="block mb-6">
        <span className="block text-sm font-bold text-slate-300 mb-3">
          Photo Evidence (Optional)
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleMediaChange}
          className="block w-full text-sm text-slate-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer bg-slate-900/60 border border-slate-700/60 rounded-lg"
        />
        {mediaPreview && (
          <div className="mt-4 rounded-lg overflow-hidden border border-slate-700/50 shadow-md">
            <img
              src={mediaPreview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
          </div>
        )}
      </label>

      {/* Location */}
      {loadingLocation && (
        <div className="mb-6 p-4 bg-slate-800/60 rounded-lg border border-slate-700/50 text-center">
          <p className="text-sm text-slate-300 font-semibold animate-pulse">
            📡 Detecting location...
          </p>
        </div>
      )}

      {location && (
        <div className="mb-6">
          <p className="text-xs text-slate-400 mb-3 font-semibold">
            📍 <span className="text-slate-300 font-mono bg-slate-800/60 px-2.5 py-1 rounded">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          </p>

          <div className="rounded-lg overflow-hidden border border-slate-700/50 shadow-lg bg-slate-900/40">
            <MapPreview lat={location.lat} lng={location.lng} />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!location || uploading}
        className="w-full bg-linear-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-bold text-sm shadow-lg hover:from-red-700 hover:to-orange-700 hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 active:scale-[0.99] border border-red-500/30 disabled:from-slate-700/60 disabled:to-slate-800/60 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100"
      >
        {uploading ? "📤 Uploading..." : "🚨 Report Incident"}
      </button>
    </form>
  );
}
