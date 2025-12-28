import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerResponder } from "../api/incident.api";
import { socket } from "../socket/socket";

export default function WorkerLogin() {
  const [form, setForm] = useState({ name: "", type: "police", regToken: "" });
  const [location, setLocation] = useState(null);
  const [detecting, setDetecting] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);

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
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-slate-900/80 border border-slate-700/70 rounded-2xl shadow-2xl px-6 py-7">
        <h2 className="text-2xl font-black mb-4 text-center bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Responder Login</h2>
        <label className="block mb-4">
          <span className="text-xs font-semibold text-slate-300">Name</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
            required
          />
        </label>
        <label className="block mb-4">
          <span className="text-xs font-semibold text-slate-300">Registration Code</span>
          <input
            value={form.regToken}
            onChange={(e) => setForm({ ...form, regToken: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
            placeholder="Enter responder code"
            required
          />
        </label>
        <label className="block mb-4">
          <span className="text-xs font-semibold text-slate-300">Type</span>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
          >
            <option value="police">Police</option>
            <option value="ambulance">Ambulance</option>
            <option value="fire">Fire Brigade</option>
          </select>
        </label>
        <div className="text-xs text-slate-400 mb-4">
          {detecting ? "Detecting your location..." : location ? `Location set: ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}` : "Location unavailable"}
        </div>
        <button type="submit" className="w-full bg-linear-to-r from-emerald-500 to-teal-600 text-white py-2.5 rounded-xl font-semibold text-sm">Enter Portal</button>
      </form>
    </div>
  );
}
