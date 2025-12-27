
import { distanceInMeters } from "./geo.js";

export function isDuplicate(existing, incoming) {
  const distance = distanceInMeters(
    existing.location.lat,
    existing.location.lng,
    incoming.location.lat,
    incoming.location.lng
  );

  const timeDiff =
    Math.abs(new Date(existing.createdAt) - new Date()) / 60000;

  return distance < 200 && timeDiff < 15;
}
