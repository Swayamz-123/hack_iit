import { verifyIncident,updateIncidentStatus } from "../api/incident.api";

export default function AdminControls({ refresh }) {
  const verify = async (id) => {
    await verifyIncident(id);
    refresh();
  };

  const resolve = async (id) => {
    await updateIncidentStatus({
      incidentId: id,
      status: "resolved",
    });
    refresh();
  };

  return { verify, resolve };
}
