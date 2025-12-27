import SeverityBadge from "./SeverityBadge";

export default function IncidentCard({ incident, admin, onVerify, onResolve }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-slate-200">
      {/* Incident Type */}
      <h4 className="text-lg font-semibold capitalize text-slate-800 mb-1">
        {incident.type}
      </h4>

      {/* Description */}
      <p className="text-sm text-slate-600 mb-2">
        {incident.description}
      </p>

      {/* Severity */}
      <div className="mb-2">
        <SeverityBadge level={incident.severity} />
      </div>

      {/* Status & Upvotes */}
      <div className="text-sm text-slate-700 space-y-1">
        <p>
          <span className="font-medium">Status:</span>{" "}
          <span className="capitalize">{incident.status}</span>
        </p>
        <p>
          <span className="font-medium">Upvotes:</span>{" "}
          {incident.upvotes}
        </p>
      </div>

      {/* Admin Actions */}
      {admin && (
        <div className="flex gap-2 mt-4">
          {incident.status === "unverified" && (
            <button
              onClick={() => onVerify(incident._id)}
              className="px-3 py-1.5 rounded-md text-sm font-medium
                         bg-blue-600 text-white hover:bg-blue-700
                         transition"
            >
              Verify
            </button>
          )}

          {incident.status !== "resolved" && (
            <button
              onClick={() => onResolve(incident._id)}
              className="px-3 py-1.5 rounded-md text-sm font-medium
                         bg-green-600 text-white hover:bg-green-700
                         transition"
            >
              Resolve
            </button>
          )}
        </div>
      )}
    </div>
  );
}
