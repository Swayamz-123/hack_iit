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
    <div className="min-h-screen bg-[#D1C4D1] flex items-center justify-center p-4 sm:p-8 font-sans antialiased">
      <div className="max-w-6xl w-full bg-[#F2EDE9] rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border-[12] border-white/40">
        <div className="p-8 md:p-16">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#7DA99C] rounded-2xl flex items-center justify-center shadow-sm">
                  <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45"></div>
                </div>
                <span className="text-[#5A5266] font-black text-2xl tracking-tighter uppercase">Em-Grid</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-[#4A4453] tracking-[ -0.02em] leading-none">
                Responder <span className="opacity-40 italic font-medium">Login</span>
              </h1>
            </div>

            <div className="hidden md:block text-right">
              <p className="text-[#9A8FAB] text-xs font-bold uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2 text-[#7DA99C] font-bold">
                <span className="w-2 h-2 bg-[#7DA99C] rounded-full animate-pulse"></span>
                System Operational
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1"></div>

            <div className="md:col-span-2">
              <form onSubmit={submit} className="w-full bg-white/60 p-8 rounded-[2.3rem] shadow-lg border border-white/40">
                <h2 className="text-3xl md:text-4xl font-black mb-6 text-[#4A4453]">Access for Field Responders</h2>

                <label className="block mb-4">
                  <span className="text-xs font-semibold text-[#8E8699]">Name</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-[#E6E0DF] bg-white/70 px-3 py-2 text-sm text-[#4A4453] placeholder-[#BDB4C7] focus:outline-none focus:ring-2 focus:ring-[#7DA99C]/30 transition"
                    required
                  />
                </label>

                <label className="block mb-4">
                  <span className="text-xs font-semibold text-[#8E8699]">Registration Code</span>
                  <input
                    value={form.regToken}
                    onChange={(e) => setForm({ ...form, regToken: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-[#E6E0DF] bg-white/70 px-3 py-2 text-sm text-[#4A4453] placeholder-[#BDB4C7] focus:outline-none focus:ring-2 focus:ring-[#7DA99C]/30 transition"
                    placeholder="Enter your code"
                    required
                  />
                </label>

                <label className="block mb-6">
                  <span className="text-xs font-semibold text-[#8E8699]">Responder Type</span>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-[#E6E0DF] bg-white/70 px-3 py-2 text-sm text-[#4A4453] focus:outline-none focus:ring-2 focus:ring-[#7DA99C]/30 transition"
                  >
                    <option value="police">🚨 Police</option>
                    <option value="ambulance">🚑 Ambulance</option>
                    <option value="fire">🚒 Fire Brigade</option>
                  </select>
                </label>

                <div className="text-sm text-[#8E8699] mb-6 font-medium">
                  📍 {detecting ? "Detecting location..." : location ? `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}` : "Location needed"}
                </div>

                <div className="flex items-center gap-4">
                  <button type="submit" className="flex-1 bg-[#7DA99C] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all">
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
