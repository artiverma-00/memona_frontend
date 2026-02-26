import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiMapPin, FiList } from "react-icons/fi";
import { useMemory } from "../context/MemoryContext";
import MemoryMap from "../components/map/MemoryMap";
import MemoryCard from "../components/memory/MemoryCard";
import SearchBar from "../components/shared/SearchBar";
import Loader from "../components/shared/Loader";

const MapView = () => {
  const { fetchMapLocations, toggleFavorite } = useMemory();
  const [mapMemories, setMapMemories] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [viewMode, setViewMode] = useState("map"); // 'map', 'list'

  // Fetch map-specific memories for the map view
  useEffect(() => {
    const loadMapMemories = async () => {
      setMapLoading(true);
      try {
        const locations = await fetchMapLocations();
        setMapMemories(locations || []);
      } catch (error) {
        console.error("Failed to fetch map locations:", error);
        setMapMemories([]);
      } finally {
        setMapLoading(false);
      }
    };
    loadMapMemories();
  }, [fetchMapLocations]);

  // Filter memories with location
  const normalizeSearchText = (value) => String(value || "").toLowerCase();

  const filteredMemories = searchQuery
    ? mapMemories.filter(
        (m) =>
          normalizeSearchText(m.title).includes(
            normalizeSearchText(searchQuery),
          ) ||
          normalizeSearchText(m.location?.name || "").includes(
            normalizeSearchText(searchQuery),
          ),
      )
    : mapMemories;

  const handleMarkerClick = (memory) => {
    setSelectedMemory(memory);
  };

  // Check loading state for map-specific data
  if (mapLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading map..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Memory Journey Map
          </h1>
          <p className="text-stone-500">
            {filteredMemories.length}{" "}
            {filteredMemories.length === 1 ? "location" : "locations"} across
            your memories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SearchBar
            placeholder="Search locations..."
            onSearch={setSearchQuery}
            className="w-64"
          />

          {/* View Toggle */}
          <div className="flex bg-stone-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("map")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "map"
                  ? "bg-white text-amber-600 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <FiMapPin className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-white text-amber-600 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredMemories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <FiMapPin className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 mb-2">
            No locations yet
          </h3>
          <p className="text-stone-500 max-w-md">
            Add locations to your memories to see them on the map.
          </p>
        </div>
      ) : viewMode === "map" ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <MemoryMap
              memories={filteredMemories}
              onMarkerClick={handleMarkerClick}
              height="600px"
            />
          </div>

          {/* Sidebar - Memory List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-900">
              Memories at this location
            </h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredMemories.map((memory) => (
                <motion.div
                  key={memory._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`
                    p-3 rounded-xl cursor-pointer transition-all
                    ${
                      selectedMemory?._id === memory._id
                        ? "bg-amber-50 ring-2 ring-amber-500"
                        : "bg-white hover:bg-stone-50 border border-stone-100"
                    }
                  `}
                  onClick={() => setSelectedMemory(memory)}
                >
                  <MemoryCard
                    memory={memory}
                    showActions={false}
                    variant="compact"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // List View
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemories.map((memory) => (
            <MemoryCard
              key={memory._id}
              memory={memory}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MapView;
