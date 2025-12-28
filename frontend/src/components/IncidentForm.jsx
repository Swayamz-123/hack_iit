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
      className="bg-[#C5ABD1] rounded-2xl shadow-2xl p-8 mb-6 border border-[#B89BC5]"
    >
      {successMsg && (
        <div className="mb-4 rounded-lg border border-emerald-600/40 bg-emerald-900/30 px-4 py-3 text-xs text-emerald-200 font-semibold">
          {successMsg}
        </div>
      )}
      <h3 className="text-base font-bold capitalize text-[#5a4a6a] mb-6 text-center">
        Report Incident
      </h3>

      {/* Incident Type */}
      <label className="block mb-6">
        <span className="block text-xs font-bold text-[#5a4a6a] mb-3">
          Incident Type
        </span>
        <select
          className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-[#f5efe9] text-xs font-semibold text-[#5a4a6a] focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition"
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
        <span className="block text-xs font-bold text-[#5a4a6a] mb-3">
          Description
        </span>
        <textarea
          placeholder="Describe the incident in detail..."
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full rounded-lg border border-stone-300 px-4 py-3 text-xs resize-none bg-[#f5efe9] text-[#5a4a6a] placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition"
          rows={5}
        />
      </label>

      {/* Severity */}
      <label className="block mb-6">
        <span className="block text-xs font-bold text-[#5a4a6a] mb-3">
          Severity
        </span>
        <select
          className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-[#f5efe9] text-xs font-semibold text-[#5a4a6a] focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition"
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
        <span className="block text-xs font-bold text-[#5a4a6a] mb-3">
          Photo Evidence (Optional)
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleMediaChange}
          className="block w-full text-xs text-[#5a4a6a] file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-500 file:text-white hover:file:bg-teal-600 cursor-pointer bg-[#f5efe9] border border-stone-300 rounded-lg"
        />
        {mediaPreview && (
          <div className="mt-4 rounded-lg overflow-hidden border border-stone-300 shadow-md">
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
        <div className="mb-6 p-4 bg-[#f5efe9] rounded-lg border border-stone-300 text-center">
          <p className="text-xs text-[#5a4a6a] font-semibold animate-pulse">
            📡 Detecting location...
          </p>
        </div>
      )}

      {location && (
        <div className="mb-6">
          <p className="text-xs text-[#5a4a6a] mb-3 font-semibold">
            📍 <span className="text-[#5a4a6a] font-mono bg-[#f5efe9] px-2.5 py-1 rounded border border-stone-300">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          </p>

          <div className="rounded-lg overflow-hidden border border-stone-300 shadow-lg bg-[#f5efe9]">
            <MapPreview lat={location.lat} lng={location.lng} />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!location || uploading}
        className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3 rounded-lg font-bold text-xs shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 active:scale-[0.99] border border-teal-500/30 disabled:from-stone-300 disabled:to-stone-400 disabled:text-stone-500 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100"
      >
        {uploading ? "📤 Uploading..." : "🚨 Report Incident"}
      </button>
    </form>
  );
}
