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
      <div className="w-full max-w-md bg-[#F2EDE9] rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border-[12] border-white/40">
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#7DA99C] rounded-2xl flex items-center justify-center shadow-sm">
              <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45"></div>
            </div>
            <span className="text-[#5A5266] font-black text-2xl tracking-tighter uppercase">Em-Grid</span>
          </div>

          <form onSubmit={submit}>
            <h2 className="text-3xl font-black mb-2 text-[#4A4453] tracking-tight">Responder Login</h2>
            <p className="text-xs text-[#9A8FAB] mb-8 font-medium">Access assignments and update statuses from the field</p>

            <label className="block mb-5">
              <span className="text-xs font-bold text-[#5A5266] mb-2 block uppercase tracking-wider">Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-sm text-[#4A4453] placeholder-[#9A8FAB] focus:outline-none focus:ring-2 focus:ring-[#7DA99C]/40 focus:border-[#7DA99C]/50 transition font-medium"
                required
              />
            </label>

            <label className="block mb-5">
              <span className="text-xs font-bold text-[#5A5266] mb-2 block uppercase tracking-wider">Registration Code</span>
              <input
                value={form.regToken}
                onChange={(e) => setForm({ ...form, regToken: e.target.value })}
                className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-sm text-[#4A4453] placeholder-[#9A8FAB] focus:outline-none focus:ring-2 focus:ring-[#7DA99C]/40 focus:border-[#7DA99C]/50 transition font-medium"
                placeholder="Enter your code"
                required
              />
            </label>

            <label className="block mb-8">
              <span className="text-xs font-bold text-[#5A5266] mb-2 block uppercase tracking-wider">Responder Type</span>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-sm text-[#4A4453] focus:outline-none focus:ring-2 focus:ring-[#7DA99C]/40 focus:border-[#7DA99C]/50 transition font-medium"
              >
                <option value="police">🚨 Police</option>
                <option value="ambulance">🚑 Ambulance</option>
                <option value="fire">🚒 Fire Brigade</option>
              </select>
            </label>

            <div className="text-xs text-[#9A8FAB] mb-6 font-medium">📍 {detecting ? "Detecting location..." : location ? `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}` : "Location needed"}</div>

            <button
              type="submit"
              className="w-full bg-[#8A94BB] hover:bg-[#7A84AB] text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
