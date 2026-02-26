import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { FiMapPin, FiX, FiCalendar, FiNavigation } from "react-icons/fi";

// Fix for marker icons in Vite/React-Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Component to handle map center changes
function MapCenterHandler({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], zoom, { animate: true });
    }
  }, [center, zoom, map]);

  return null;
}

const MemoryMap = ({
  memories = [],
  onMarkerClick,
  center = { lat: 20.5937, lng: 78.9629 }, // Default: India center
  zoom = 5,
  height = "400px",
}) => {
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Normalize memories to handle different data formats from various API endpoints
  // Server /memories/map returns: id, title, created_at, location_lat, location_lng, media_thumbnail
  // Server /memories returns: _id, title, date, location.coordinates.lat/lng, media[]
  const normalizeMemories = (mems) => {
    return mems.map((m) => ({
      _id: m._id || m.id,
      id: m.id || m._id,
      title: m.title,
      date: m.date || m.created_at,
      location: m.location?.coordinates
        ? m.location
        : {
            name: m.location_name || "",
            coordinates:
              m.location_lat != null && m.location_lng != null
                ? { lat: Number(m.location_lat), lng: Number(m.location_lng) }
                : null,
          },
      media:
        m.media ||
        (m.media_thumbnail ? [{ type: "image", url: m.media_thumbnail }] : []),
      description: m.description || "",
    }));
  };

  const normalizedMemories = normalizeMemories(memories);

  // Filter memories with location data - check both normalized and original formats
  const memoriesWithLocation = normalizedMemories.filter(
    (m) =>
      m.location?.coordinates?.lat != null &&
      m.location?.coordinates?.lng != null,
  );

  // Calculate center based on memories if no center provided
  const mapCenter =
    memoriesWithLocation.length > 0
      ? {
          lat: memoriesWithLocation[0].location.coordinates.lat,
          lng: memoriesWithLocation[0].location.coordinates.lng,
        }
      : center;

  const handleMarkerClick = (memory) => {
    setSelectedMemory(memory);
    onMarkerClick?.(memory);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle map ready event
  const handleMapReady = () => {
    setMapReady(true);
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-stone-100"
      style={{ height }}
    >
      {/* Real Leaflet Map */}
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        whenReady={handleMapReady}
      >
        {/* Carto Light - Premium, reliable tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Map center handler */}
        <MapCenterHandler center={mapCenter} zoom={zoom} />

        {/* Markers for each memory with location */}
        {memoriesWithLocation.map((memory) => (
          <Marker
            key={memory._id}
            position={[
              memory.location.coordinates.lat,
              memory.location.coordinates.lng,
            ]}
            eventHandlers={{
              click: () => handleMarkerClick(memory),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                {memory.media?.[0]?.type === "image" && (
                  <img
                    src={memory.media[0].url}
                    alt={memory.title}
                    className="w-full h-24 object-cover rounded-t-md mb-2"
                  />
                )}
                <h3 className="font-semibold text-stone-900 text-sm mb-1">
                  {memory.title}
                </h3>
                <p className="text-xs text-stone-500 mb-1">
                  {formatDate(memory.date)}
                </p>
                {memory.location?.name && (
                  <p className="text-xs text-stone-600 flex items-center gap-1 mb-2">
                    <FiMapPin className="w-3 h-3" />
                    {memory.location.name}
                  </p>
                )}
                <Link
                  to={`/memories/${memory._id}`}
                  className="text-xs font-medium text-amber-600 hover:underline"
                >
                  View Memory →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Custom Overlay - Selected Memory Card */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-4 right-4 z-[1000] w-72 bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => setSelectedMemory(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-stone-100 transition-colors z-10 shadow-sm"
            >
              <FiX className="w-4 h-4 text-stone-600" />
            </button>

            {selectedMemory.media?.[0]?.type === "image" && (
              <img
                src={selectedMemory.media[0].url}
                alt={selectedMemory.title}
                className="w-full h-32 object-cover"
              />
            )}

            <div className="p-3">
              <h4 className="font-semibold text-stone-900 mb-1 line-clamp-1">
                {selectedMemory.title}
              </h4>
              <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
                <FiCalendar className="w-3 h-3" />
                {formatDate(selectedMemory.date)}
              </p>
              {selectedMemory.location?.name && (
                <p className="text-xs text-stone-600 flex items-center gap-1 mb-3">
                  <FiMapPin className="w-3 h-3" />
                  {selectedMemory.location.name}
                </p>
              )}
              <Link
                to={`/memories/${selectedMemory._id}`}
                className="text-xs font-medium text-amber-600 hover:underline"
              >
                View Memory →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-xs text-stone-600 shadow-sm">
        {memoriesWithLocation.length}{" "}
        {memoriesWithLocation.length === 1 ? "location" : "locations"}
      </div>

      {/* Map Controls Info */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-xs text-stone-600 shadow-sm flex items-center gap-2">
          <FiNavigation className="w-3 h-3" />
          Scroll to zoom
        </div>
      </div>

      {/* Empty State Overlay */}
      {memoriesWithLocation.length === 0 && mapReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50/90 z-[1000]">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-3">
            <FiMapPin className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 mb-1">
            No memories with locations
          </h3>
          <p className="text-sm text-stone-500 max-w-xs text-center">
            Add locations to your memories to see them on the map.
          </p>
        </div>
      )}
    </div>
  );
};

export default MemoryMap;
