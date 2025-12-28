import { useEffect, useState } from "react";
import SeverityBadge from "./SeverityBadge";
import MapPreview from "./MapReview";
import { getDeviceId } from "../utils/deviceId";
import { upvoteIncident } from "../api/incident.api";

export default function IncidentCard({ incident, admin, responder, onVerify, onResolve, onSaveNotes, onStatusUpdate, onViewMap }) {
  const [notes, setNotes] = useState(incident.internalNotes || "");
  const [hasVoted, setHasVoted] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);

  useEffect(() => {
    const deviceId = getDeviceId();
    const voted = Array.isArray(incident.voters) && incident.voters.includes(deviceId);
    setHasVoted(voted);
  }, [incident]);

  const handleUpvote = async () => {
    if (hasVoted || upvoteLoading) return;
    const deviceId = getDeviceId();
    setUpvoteLoading(true);
    try {
      const res = await upvoteIncident(incident._id, deviceId);
      const updated = res.data?.data;
      if (updated) {
        setHasVoted(true);
      }
    } catch (e) {
      console.error("Upvote failed", e);
    } finally {
      setUpvoteLoading(false);
    }
  };
  return (
    <div className="bg-linear-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-6 border  border-l-4 border-red-500/60 hover:shadow-2xl hover:border-slate-600/80 transition-all duration-300">
      {/* Incident Type */}
      <h4 className="text-lg font-black capitalize bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-3">
        {incident.type}
      </h4>

      {/* Description */}
      <p className="text-sm leading-relaxed text-slate-300 mb-4 line-clamp-3">
        {incident.description}
      </p>

      {/* Media Gallery */}
      {incident?.media && incident.media.length > 0 && (
        <div className="mb-4 rounded-lg overflow-hidden border border-slate-700/50 shadow-md">
          <img
            src={incident.media[0]}
            alt="Incident evidence"
            className="w-full h-48 object-cover cursor-pointer hover:opacity-85 transition"
            onClick={() => window.open(incident.media[0], '_blank')}
          />
          {incident.media.length > 1 && (
            <div className="bg-slate-800/80 px-3 py-1 text-xs text-slate-400 text-center font-medium">
              +{incident.media.length - 1} more photo(s)
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      {incident?.createdAt && (
        <p className="text-xs text-slate-500 mb-3 font-medium">
          📅 {new Date(incident.createdAt).toLocaleString()}
        </p>
      )}

      {/* Severity */}
      <div className="mb-4">
        <SeverityBadge level={incident.severity} />
      </div>

      {/* Status & Upvotes */}
      <div className="text-sm text-slate-300 space-y-3 bg-slate-800/60 p-4 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Status:</span>
            <span className={`capitalize px-3 py-1.5 rounded-full text-xs font-semibold border ${
              incident.status === 'verified' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
              incident.status === 'resolved' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
              'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
            }`}>
              {incident.status}
            </span>
          </div>
          <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-300">
            👍 {incident.upvotes}
          </span>
        </div>
        
        {!admin && !responder && (
          <button
            onClick={handleUpvote}
            disabled={hasVoted || upvoteLoading}
            className="w-full px-4 py-2.5 rounded-lg text-xs font-bold bg-linear-to-r from-emerald-600 to-teal-700 text-white border border-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-lg"
          >
            {hasVoted ? "✓ Upvoted" : upvoteLoading ? "Upvoting..." : "👍 Upvote"}
          </button>
        )}
      </div>

      {/* Location - coordinates only for list view */}
      {(admin || responder) && incident?.location?.lat && incident?.location?.lng && (
        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold">📍 Location:</span>
            <span className="font-mono bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-300">
              {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
            </span>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      {admin && (
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-700/50">
          {incident.status === "unverified" && (
            <button
              onClick={() => onVerify(incident._id)}
              className="px-5 py-2.5 rounded-lg text-sm font-bold bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 active:scale-[0.99] border border-blue-500/30"
            >
              ✓ Verify
            </button>
          )}

          {incident.status !== "resolved" && (
            <button
              onClick={() => onResolve(incident._id)}
              className="px-5 py-2.5 rounded-lg text-sm font-bold bg-linear-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-700 hover:to-teal-800 shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 active:scale-[0.99] border border-emerald-500/30"
            >
              ✓ Resolve
            </button>
          )}

          {/* Internal Notes */}
          <div className="w-full mt-4">
            <label className="block text-xs font-semibold text-slate-300 mb-2">Instructions for responders</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add brief instructions or notes..."
              className="w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400/50 transition"
              rows={3}
            />
            <div className="mt-2">
              <button
                onClick={() => onSaveNotes && onSaveNotes(incident._id, notes, incident.status)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md border border-amber-500/30 transition"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display Admin Notes for Responders */}
      {responder && incident?.internalNotes && (
        <div className="mt-6 bg-amber-900/25 border border-amber-600/40 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-amber-400 mb-1">📋 Admin Instructions:</p>
          <p className="text-sm text-slate-200">{incident.internalNotes}</p>
        </div>
      )}

      {/* Responder Mark Resolved Button & View Map */}
      {responder && incident.status === "verified" && (
        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-700/50">
          <button
            onClick={() => onStatusUpdate?.(incident._id, "resolved")}
            className="flex-1 px-6 py-2.5 rounded-lg text-sm font-bold bg-linear-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-700 hover:to-teal-800 shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 active:scale-[0.99] border border-emerald-500/30"
          >
            ✓ Mark Resolved
          </button>
          {incident.location?.lat && incident.location?.lng && (
            <button
              onClick={() => onViewMap?.(incident)}
              className="px-6 py-2.5 rounded-lg text-sm font-bold bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 active:scale-[0.99] border border-blue-500/30"
            >
              🗺️ View Map
            </button>
          )}
        </div>
      )}
    </div>
  );
}
