import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerResponder, meResponder } from "../api/incident.api";
import { socket } from "../socket/socket";

export default function WorkerLogin() {
  const [form, setForm] = useState({ name: "", type: "police", regToken: "" });
  const [location, setLocation] = useState(null);
  const [detecting, setDetecting] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      try {
        await meResponder();
        // If no error, user is logged in
        navigate("/worker", { replace: true });
      } catch {
        // Not logged in, proceed with geolocation
        if (!navigator.geolocation) {
          setDetecting(false);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setDetecting(false);
          },
          () => setDetecting(false)
        );
      }
    };
    checkSession();
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!location) return alert("Location required for assignment radius");
    const res = await registerResponder({ name: form.name, type: form.type, location, token: form.regToken });
    const id = res.data?.data?._id;
    if (id) {
      // Join responder room for targeted events
      socket.emit("responder:join", id);
      localStorage.setItem("responderId", id);
      navigate("/worker", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-slate-800/90 border border-slate-700/70 rounded-lg shadow-2xl px-6 py-8 backdrop-blur-sm">
        <h2 className="text-2xl font-black mb-4 text-center bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">🚔 Responder Login</h2>
        <label className="block mb-4">
          <span className="text-xs font-semibold text-slate-300">Name</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400/50 transition"
            required
          />
        </label>
        <label className="block mb-4">
          <span className="text-xs font-semibold text-slate-300">Registration Code</span>
          <input
            value={form.regToken}
            onChange={(e) => setForm({ ...form, regToken: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400/50 transition"
            placeholder="Enter your code"
            required
          />
        </label>
        <label className="block mb-6">
          <span className="text-xs font-semibold text-slate-300">Responder Type</span>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400/50 transition"
          >
            <option value="police">🚨 Police</option>
            <option value="ambulance">🚑 Ambulance</option>
            <option value="fire">🚒 Fire Brigade</option>
          </select>
        </label>
        <div className="text-xs text-slate-400 mb-6 font-medium">
          📍 {detecting ? "Detecting location..." : location ? `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}` : "Location needed"}
        </div>
        <button type="submit" className="w-full bg-linear-to-r from-emerald-600 to-teal-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-lg hover:from-emerald-700 hover:to-teal-800 hover:shadow-xl transition-all duration-200 active:scale-[0.98] border border-emerald-500/30">
          Login
        </button>
      </form>
    </div>
  );
}
