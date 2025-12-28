import { useEffect, useState } from "react";
import SeverityBadge from "./SeverityBadge";
import MapPreview from "./MapReview";
import { getDeviceId } from "../utils/deviceId";
import { upvoteIncident } from "../api/incident.api";

export default function IncidentCard({ incident, admin, responder, onVerify, onResolve, onSaveNotes, onStatusUpdate, onViewMap }) {
  const [notes, setNotes] = useState(incident.internalNotes || "");
  const [hasVoted, setHasVoted] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const isControl = admin || responder; // Use light/beige theme for admin/responder views

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
  const containerClass = isControl
    ? "bg-[#F2EDE9] border border-[#E6E0DF] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-6 mb-6"
    : "bg-linear-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-6 border  border-l-4 border-red-500/60 hover:shadow-2xl hover:border-slate-600/80 transition-all duration-300";

  const headingClass = isControl
    ? "text-lg font-black capitalize text-[#4A4453] mb-3"
    : "text-lg font-black capitalize bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-3";

  const descClass = isControl
    ? "text-sm leading-relaxed text-[#5A5266] mb-4"
    : "text-sm leading-relaxed text-slate-300 mb-4 line-clamp-3";

  const stampClass = isControl
    ? "text-xs text-[#8E8699] mb-3 font-medium"
    : "text-xs text-slate-500 mb-3 font-medium";

  const statusBoxClass = isControl
    ? "text-sm text-[#5A5266] space-y-3 bg-white/70 p-4 rounded-xl border border-[#E6E0DF]"
    : "text-sm text-slate-300 space-y-3 bg-slate-800/60 p-4 rounded-lg border border-slate-700/50";

  const statusPill = (status) => {
    if (!isControl) {
      return status === 'verified'
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        : status === 'resolved'
        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
    return status === 'verified'
      ? 'bg-[#E2F3ED] text-[#2F8A5D] border-[#B7E3CC]'
      : status === 'resolved'
      ? 'bg-[#E3ECFF] text-[#2F5B99] border-[#C5D9FF]'
      : 'bg-[#FFF6DF] text-[#9A6B00] border-[#F4DEA5]';
  };

  const upvoteBadgeClass = isControl
    ? "px-3 py-1.5 bg-[#E2F3ED] border border-[#B7E3CC] rounded-lg text-xs font-bold text-[#2F8A5D]"
    : "px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-300";

  return (
    <div className={containerClass}>
      {/* Incident Type */}
      <h4 className={headingClass}>{incident.type}</h4>

      {/* Description */}
      <p className={descClass}>{incident.description}</p>

      {/* Media Gallery */}
      {incident?.media && incident.media.length > 0 && (
        <div className={`mb-4 rounded-lg overflow-hidden border ${isControl ? 'border-[#E6E0DF]' : 'border-slate-700/50'} shadow-md`}>
          <img
            src={incident.media[0]}
            alt="Incident evidence"
            className="w-full h-48 object-cover cursor-pointer hover:opacity-85 transition"
            onClick={() => window.open(incident.media[0], '_blank')}
          />
          {incident.media.length > 1 && (
            <div className={`${isControl ? 'bg-[#F5F1EB]' : 'bg-slate-800/80'} px-3 py-1 text-xs ${isControl ? 'text-[#5A5266]' : 'text-slate-400'} text-center font-medium`}>
              +{incident.media.length - 1} more photo(s)
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      {incident?.createdAt && (
        <p className={stampClass}>
          📅 {new Date(incident.createdAt).toLocaleString()}
        </p>
      )}

      {/* Severity */}
      <div className="mb-4">
        <SeverityBadge level={incident.severity} />
      </div>

      {/* Status & Upvotes */}
      <div className={statusBoxClass}>
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isControl ? 'text-[#8E8699]' : 'text-slate-400'}`}>Status:</span>
            <span className={`capitalize px-3 py-1.5 rounded-full text-xs font-semibold border ${statusPill(incident.status)}`}>
              {incident.status}
            </span>
          </div>
          <span className={upvoteBadgeClass}>
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
          <div className={`flex items-center gap-2 text-xs ${isControl ? 'text-[#8E8699]' : 'text-slate-400'}`}>
            <span className="font-semibold">📍 Location:</span>
            <span className={`font-mono px-3 py-1.5 rounded-lg border ${isControl ? 'bg-white/70 border-[#E6E0DF] text-[#5A5266]' : 'bg-slate-800/60 border-slate-700/50 text-slate-300'}`}>
              {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
            </span>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      {admin && (
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-[#E6E0DF]">
          {incident.status === "unverified" && (
            <button
              onClick={() => onVerify(incident._id)}
              className={`${isControl ? 'bg-[#7DA99C] text-white border-[#6A9585]' : 'bg-linear-to-r from-blue-600 to-blue-700 text-white border-blue-500/30'} px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-200 active:scale-[0.99]`}
            >
              ✓ Verify
            </button>
          )}

          {incident.status !== "resolved" && (
            <button
              onClick={() => onResolve(incident._id)}
              className={`${isControl ? 'bg-[#423D47] text-white border-[#2F2A33]' : 'bg-linear-to-r from-emerald-600 to-teal-700 text-white border-emerald-500/30'} px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-200 active:scale-[0.99]`}
            >
              ✓ Resolve
            </button>
          )}

          {/* Internal Notes */}
          <div className="w-full mt-4">
            <label className={`block text-xs font-semibold mb-2 ${isControl ? 'text-[#5A5266]' : 'text-slate-300'}`}>Instructions for responders</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add brief instructions or notes..."
              className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none ${isControl ? 'border-[#E6E0DF] bg-white text-[#423D47] placeholder-[#B0A7B5] focus:ring-2 focus:ring-[#7DA99C]/50 focus:border-[#7DA99C]' : 'border-slate-700/70 bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400/50'}`}
              rows={3}
            />
            <div className="mt-2">
              <button
                onClick={() => onSaveNotes && onSaveNotes(incident._id, notes, incident.status)}
                className={`${isControl ? 'bg-[#7DA99C] text-white border-[#6A9585]' : 'bg-amber-600 text-white border-amber-500/30'} px-4 py-2 rounded-lg text-xs font-bold shadow-md transition hover:brightness-95`}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display Admin Notes for Responders */}
      {responder && incident?.internalNotes && (
        <div className="mt-6 bg-[#FFF6DF] border border-[#F4DEA5] rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-[#9A6B00] mb-1">📋 Admin Instructions:</p>
          <p className="text-sm text-[#5A5266]">{incident.internalNotes}</p>
        </div>
      )}

      {/* Responder Mark Resolved Button & View Map */}
      {responder && incident.status === "verified" && (
        <div className="flex gap-3 mt-6 pt-6 border-t border-[#E6E0DF]">
          <button
            onClick={() => onStatusUpdate?.(incident._id, "resolved")}
            className="flex-1 px-6 py-2.5 rounded-lg text-sm font-bold bg-[#7DA99C] text-white shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-200 active:scale-[0.99] border border-[#6A9585]"
          >
            ✓ Mark Resolved
          </button>
          {incident.location?.lat && incident.location?.lng && (
            <button
              onClick={() => onViewMap?.(incident)}
              className="px-6 py-2.5 rounded-lg text-sm font-bold bg-[#423D47] text-white shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-200 active:scale-[0.99] border border-[#2F2A33]"
            >
              🗺️ View Map
            </button>
          )}
        </div>
      )}
    </div>
  );
}
