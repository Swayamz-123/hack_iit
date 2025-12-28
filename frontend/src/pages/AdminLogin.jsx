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

  if (loading) return <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center text-slate-300">Loading...</div>;

  const submit = async (e) => {
    e.preventDefault();
    await adminLogin(form);
    nav("/admin");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-slate-800/90 border border-slate-700/70 rounded-lg shadow-2xl px-6 py-8 backdrop-blur-sm"
      >
        {/* Title */}
        <h2 className="text-2xl font-black mb-2 text-center bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
          🔐 Admin Login
        </h2>
        <p className="text-xs text-slate-400 mb-6 text-center font-medium">
          Incident verification & management
        </p>

        {/* Email */}
        <label className="block mb-4">
          <span className="text-xs font-semibold text-slate-300">
            Email
          </span>
          <input
            type="email"
            placeholder="admin@example.com"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/50 transition"
            required
          />
        </label>

        {/* Password */}
        <label className="block mb-6">
          <span className="text-xs font-semibold text-slate-300">
            Password
          </span>
          <input
            type="password"
            placeholder="••••••••"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-400 transition"
            required
          />
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-linear-to-r from-red-600 to-orange-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-lg hover:from-red-700 hover:to-orange-700 hover:shadow-xl transition-all duration-200 active:scale-[0.98] border border-red-500/30"
        >
          Login
        </button>
      </form>
    </div>
  );
}
