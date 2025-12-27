import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createIncident } from "../api/incident.api";
import MapPreview from "./MapReview";

export default function IncidentForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "accident",
    description: "",
    severity: "low",
  });

  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoadingLocation(false);
      },
      () => {
        alert("Location permission denied");
        setLoadingLocation(false);
      }
    );
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (!location) {
      alert("Location not available");
      return;
    }

    await createIncident({
      ...form,
      location,
    });

    // 🔁 Redirect to feed after success
    navigate("/");
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-xl shadow-md p-6 mb-6 border border-slate-200"
    >
      <h3 className="text-xl font-semibold text-slate-800 mb-4">
        Report Incident
      </h3>

      {/* Incident Type */}
      <label className="block mb-3">
        <span className="text-sm font-medium text-slate-700">
          Incident Type
        </span>
        <select
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="accident">Accident</option>
          <option value="medical">Medical</option>
          <option value="fire">Fire</option>
          <option value="other">Other</option>
        </select>
      </label>

      {/* Description */}
      <label className="block mb-3">
        <span className="text-sm font-medium text-slate-700">
          Description
        </span>
        <textarea
          placeholder="Describe what happened"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2
                     text-sm resize-none h-24
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      {/* Severity */}
      <label className="block mb-4">
        <span className="text-sm font-medium text-slate-700">
          Severity
        </span>
        <select
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.severity}
          onChange={(e) =>
            setForm({ ...form, severity: e.target.value })
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      {/* Location */}
      {loadingLocation && (
        <p className="text-sm text-slate-500 mb-3">
          Detecting location…
        </p>
      )}

      {location && (
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-2">
            📍 Location detected:{" "}
            <span className="font-medium">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </p>

          <div className="rounded-lg overflow-hidden border border-slate-200">
            <MapPreview lat={location.lat} lng={location.lng} />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!location}
        className="w-full bg-blue-600 text-white py-2 rounded-md font-medium
                   hover:bg-blue-700 transition
                   disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        Submit Incident
      </button>
    </form>
  );
}
