import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createIncident, uploadMedia } from "../api/incident.api";
import MapPreview from "./MapReview";
import { getDeviceId } from "../utils/deviceId";
import { Upload } from "lucide-react";
// trigger redeploy
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
      setSuccessMsg("Protocol submitted. Syncing to local grid...");
      setTimeout(() => navigate("/feed"), 1200);
    } catch (error) {
      alert("Failed to submit: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6" style={{ fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif' }}>
      {successMsg && (
        <div className="bg-[#7DA99C]/20 text-[#5A877A] p-4 rounded-2xl text-xs font-bold border border-[#7DA99C]/30">
          ✓ {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-black text-[#5A5266] uppercase tracking-wider mb-2 ml-2">Category</label>
          <select
            className="w-full bg-white/50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-[#5A5266] focus:ring-2 focus:ring-[#7DA99C]/40 appearance-none shadow-inner"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="accident">Accident</option>
            <option value="medical">Medical</option>
            <option value="fire">Fire Alert</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-black text-[#5A5266] uppercase tracking-wider mb-2 ml-2">Priority Level</label>
          <select
            className="w-full bg-white/50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-[#5A5266] focus:ring-2 focus:ring-[#7DA99C]/40 appearance-none shadow-inner"
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
          >
            <option value="low">Standard</option>
            <option value="medium">Urgent</option>
            <option value="high">Critical</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-black text-[#5A5266] uppercase tracking-wider mb-2 ml-2">Description</label>
        <textarea
          placeholder="Detailed situation description..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-3xl border-none px-5 py-4 text-sm bg-white/50 text-[#5A5266] placeholder-[#8E8699]/60 focus:ring-2 focus:ring-[#7DA99C]/40 min-h-30 resize-none shadow-inner"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <label className="block text-[11px] font-black text-[#5A5266] uppercase tracking-wider ml-2">Attachments</label>
            <div className="relative group">
                <input
                    type="file"
                    onChange={handleMediaChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="bg-white/50 border-2 border-dashed border-[#B8B0B0] rounded-2xl h-32 flex flex-col items-center justify-center transition-all">
                    {mediaPreview ? (
                        <img src={mediaPreview} className="h-full w-full object-cover rounded-2xl" />
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Upload size={20} className="text-[#8E8699]" />
                            <span className="text-[10px] font-black text-[#8E8699] uppercase">Add Photo / File</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <label className="block text-[11px] font-black text-[#5A5266] uppercase tracking-wider ml-2">GPS Sync</label>
            <div className="bg-white/50 rounded-2xl h-32 overflow-hidden border border-black/5 shadow-inner flex items-center justify-center">
                {loadingLocation ? (
                    <div className="text-center animate-pulse">
                        <span className="text-[10px] font-black text-[#7DA99C] uppercase tracking-tighter">Locating...</span>
                    </div>
                ) : (
                    <MapPreview lat={location.lat} lng={location.lng} />
                )}
            </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!location || uploading}
        className="w-full bg-[#7DA99C] hover:bg-[#6A9488] text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#7DA99C]/30 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {uploading ? "Transmitting..." : "Submit Protocol"}
      </button>
    </form>
  );
}