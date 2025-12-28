import { MapContainer, TileLayer, Marker } from "react-leaflet";

export default function MapPreview({ lat, lng }) {
  if (!lat || !lng) return null;

  return (
    <div className="w-full rounded-2xl overflow-hidden border-2 border-slate-700/50 shadow-2xl bg-linear-to-br from-slate-800/30 to-indigo-900/30 backdrop-blur-sm">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        className="w-full h-75 rounded-xl"
        style={{ height: "300px" }} // Leaflet requires explicit height
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          position={[lat, lng]} 
          className="animate-bounce scale-125"
        />
      </MapContainer>
    </div>
  );
}
