import SeverityBadge from "./SeverityBadge";

export default function IncidentCard({ incident, admin, onVerify, onResolve }) {
  return (
    <div className="bg-linear-to-br from-slate-900/95 to-indigo-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-6 border border-white/20 border-l-4 border-red-500/80 hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
      {/* Incident Type */}
      <h4 className="text-xl font-bold capitalize bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-3 drop-shadow-sm">
        {incident.type}
      </h4>

      {/* Description */}
      <p className="text-base leading-relaxed text-slate-200/90 mb-4 line-clamp-3">
        {incident.description}
      </p>

      {/* Severity */}
      <div className="mb-4">
        <SeverityBadge level={incident.severity} />
      </div>

      {/* Status & Upvotes */}
      <div className="text-sm text-slate-300 space-y-2 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
        <p className="flex items-center gap-2">
          <span className="font-semibold text-amber-300 min-w-[50px]">Status:</span>
          <span className="capitalize px-2 py-1 bg-white/10 rounded-full text-xs font-medium">
            {incident.status}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <span className="font-semibold text-emerald-300 min-w-[50px]">Upvotes:</span>
          <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-lg text-sm font-bold text-emerald-200">
            {incident.upvotes}
          </span>
        </p>
      </div>

      {/* Admin Actions */}
      {admin && (
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/10">
          {incident.status === "unverified" && (
            <button
              onClick={() => onVerify(incident._id)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] border border-blue-400/30 backdrop-blur-sm"
            >
              Verify Incident
            </button>
          )}

          {incident.status !== "resolved" && (
            <button
              onClick={() => onResolve(incident._id)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] border border-emerald-400/30 backdrop-blur-sm"
            >
              Mark Resolved
            </button>
          )}
        </div>
      )}
    </div>
  );
}
