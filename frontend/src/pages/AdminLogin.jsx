import { useState } from "react";
import { adminLogin } from "../api/incident.api";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [form, setForm] = useState({});
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    await adminLogin(form);
    nav("/admin");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <form
        onSubmit={submit}
        className="bg-white w-full max-w-sm rounded-xl shadow-md
                   p-6 border border-slate-200"
      >
        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          Admin Login
        </h2>

        {/* Email */}
        <label className="block mb-4">
          <span className="text-sm font-medium text-slate-700">
            Email
          </span>
          <input
            type="email"
            placeholder="admin@example.com"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="mt-1 w-full rounded-md border border-slate-300
                       px-3 py-2 text-sm
                       focus:outline-none focus:ring-2
                       focus:ring-blue-500"
            required
          />
        </label>

        {/* Password */}
        <label className="block mb-6">
          <span className="text-sm font-medium text-slate-700">
            Password
          </span>
          <input
            type="password"
            placeholder="••••••••"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="mt-1 w-full rounded-md border border-slate-300
                       px-3 py-2 text-sm
                       focus:outline-none focus:ring-2
                       focus:ring-blue-500"
            required
          />
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white
                     py-2 rounded-md font-medium
                     hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
