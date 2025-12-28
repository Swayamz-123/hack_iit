import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkAdmin } from "../api/incident.api";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState({ loading: true, ok: false });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await checkAdmin();
        if (!mounted) return;
        setStatus({ loading: false, ok: !!res.data?.success });
      } catch {
        if (!mounted) return;
        setStatus({ loading: false, ok: false });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (status.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700/70 text-sm">
          Checking admin session...
        </div>
      </div>
    );
  }

  if (!status.ok) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
