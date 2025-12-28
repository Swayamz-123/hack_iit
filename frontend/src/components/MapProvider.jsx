import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "../utils/fixLeafletIcon";

const createIcon = (color) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.2);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

const icons = {
  high: createIcon("#B08991"),
  medium: createIcon("#E6B17A"),
  low: createIcon("#E6D67A"),
};

function MapViewHandler({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 16, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function MapProvider({ center, incidents, onPinClick }) {
  const defaultPos = incidents?.[0]?.location || { lat: 20.5937, lng: 78.9629 };

  return (
    <MapContainer
      center={[defaultPos.lat, defaultPos.lng]}
      zoom={13}
      className="w-full h-full"
      style={{ minHeight: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapViewHandler center={center} />
      {(incidents || []).map((incident) => (
        <Marker
          key={incident._id}
          position={[incident?.location?.lat, incident?.location?.lng]}
          icon={icons[incident.severity] || icons.low}
          eventHandlers={{ click: () => onPinClick && onPinClick(incident) }}
        >
          <Popup>
            <div className="font-sans text-xs font-bold">
              {incident.type} Emergency
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
