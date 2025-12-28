import { useState } from "react";
import SeverityBadge from "./SeverityBadge";
import MapPreview from "./MapReview";

export default function IncidentCard({ incident, admin, onVerify, onResolve, onSaveNotes }) {
  const [notes, setNotes] = useState(incident.internalNotes || "");
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

      {/* Media Gallery */}
      {incident?.media && incident.media.length > 0 && (
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-700/50">
          <img
            src={incident.media[0]}
            alt="Incident evidence"
            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
            onClick={() => window.open(incident.media[0], '_blank')}
          />
          {incident.media.length > 1 && (
            <div className="bg-slate-800/60 px-3 py-1 text-xs text-slate-300 text-center">
              +{incident.media.length - 1} more photo(s)
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      {incident?.createdAt && (
        <p className="text-xs text-slate-400 mb-3">
          Reported: {new Date(incident.createdAt).toLocaleString()}
        </p>
      )}

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

      {/* Location preview for admins */}
      {admin && incident?.location?.lat && incident?.location?.lng && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="font-semibold text-emerald-300">Location:</span>
            <span className="font-mono bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700/60">
              {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
            </span>
          </div>

          <MapPreview lat={incident.location.lat} lng={incident.location.lng} />
        </div>
      )}

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

          {/* Internal Notes */}
          <div className="w-full mt-4">
            <label className="block text-xs font-semibold text-slate-300 mb-2">Internal Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add responder notes..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/70 focus:border-amber-400 transition"
              rows={3}
            />
            <div className="mt-2">
              <button
                onClick={() => onSaveNotes && onSaveNotes(incident._id, notes, incident.status)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md border border-amber-400/30"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
