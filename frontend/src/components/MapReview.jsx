import { MapContainer, TileLayer, Marker } from "react-leaflet";

export default function MapPreview({ lat, lng }) {
  if (!lat || !lng) return null;

  return (
    <div className="w-full rounded-lg overflow-hidden border border-slate-200">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        className="w-full"
        style={{ height: "300px" }} // Leaflet requires explicit height
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  );
}
