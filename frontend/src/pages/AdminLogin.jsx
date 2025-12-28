import { useState, useEffect } from "react";
import { adminLogin, checkAdmin } from "../api/incident.api";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      try {
        await checkAdmin();
        // If no error, user is logged in
        nav("/admin", { replace: true });
      } catch {
        // Not logged in, stay on login page
        setLoading(false);
      }
    };
    checkSession();
  }, [nav]);

  if (loading) return <div className="min-h-screen bg-[#D1C4D1] flex items-center justify-center text-[#5A5266] font-sans antialiased">Loading...</div>;

  const submit = async (e) => {
    e.preventDefault();
    await adminLogin(form);
    nav("/admin");
  };

  return (
    <div className="min-h-screen bg-[#D1C4D1] flex items-center justify-center p-4 sm:p-8 font-sans antialiased">
      <div className="w-full max-w-md bg-[#F2EDE9] rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border-[12] border-white/40">
        <div className="p-8 md:p-12">
          {/* Logo and Name */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#7DA99C] rounded-2xl flex items-center justify-center shadow-sm">
              <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45"></div>
            </div>
            <span className="text-[#5A5266] font-black text-2xl tracking-tighter uppercase">Em-Grid</span>
          </div>

          <form onSubmit={submit}>
            {/* Title */}
            <h2 className="text-3xl font-black mb-2 text-[#4A4453] tracking-tight">
              Admin Login
            </h2>
            <p className="text-xs text-[#9A8FAB] mb-8 font-medium">
              Incident verification & management
            </p>

            {/* Email */}
            <label className="block mb-5">
              <span className="text-xs font-bold text-[#5A5266] mb-2 block uppercase tracking-wider">
                Email
              </span>
              <input
                type="email"
                placeholder="admin@example.com"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-sm text-[#4A4453] placeholder-[#9A8FAB] focus:outline-none focus:ring-2 focus:ring-[#7DA99C]/40 focus:border-[#7DA99C]/50 transition font-medium"
                required
              />
            </label>

            {/* Password */}
            <label className="block mb-8">
              <span className="text-xs font-bold text-[#5A5266] mb-2 block uppercase tracking-wider">
                Password
              </span>
              <input
                type="password"
                placeholder="••••••••"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-sm text-[#4A4453] placeholder-[#9A8FAB] focus:outline-none focus:ring-2 focus:ring-[#7DA99C]/40 focus:border-[#7DA99C]/50 transition font-medium"
                required
              />
            </label>

            {/* Submit */}
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
