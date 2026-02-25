import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiCamera,
  FiFilter,
  FiSearch,
  FiImage,
  FiStar,
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMemory } from "../context/MemoryContext";
import { confirmDelete } from "../components/shared/ConfirmToast";
import MemoryCard from "../components/memory/MemoryCard";
import MemoryForm from "../components/memory/MemoryForm";
import SearchBar from "../components/shared/SearchBar";
import Loader from "../components/shared/Loader";

const Photos = () => {
  const {
    memories,
    albums,
    milestones = [],
    loading,
    fetchMemories,
    fetchAlbums,
    fetchMilestones,
    createMemory,
    deleteMemory,
    toggleFavorite,
    updateMemory,
  } = useMemory();

  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.openMemoryForm) {
      setEditingMemory(null);
      setShowMemoryForm(true);
      // Clear state after reading it
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    fetchMemories();
    fetchAlbums();
    fetchMilestones();
  }, [fetchMemories, fetchAlbums, fetchMilestones]);

  const getMemoryAlbumId = (memory) => {
    return (
      memory?.album_id ||
      memory?.albumId ||
      memory?.album?.id ||
      memory?.album?._id ||
      null
    );
  };

  const getAlbumIdFromDescription = (memory) => {
    const description = String(memory?.description || "").trim();
    const match = description.match(/uploaded from album\s+(.+?)(?:$|[.!?])/i);
    if (!match?.[1]) {
      return null;
    }

    const normalizeText = (value) =>
      String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/["'`]/g, "");

    const albumName = normalizeText(match[1]);
    const matchedAlbum = albums.find((album) => {
      const name = normalizeText(album?.name || album?.title || "");
      return (
        Boolean(name) &&
        (name === albumName ||
          name.includes(albumName) ||
          albumName.includes(name))
      );
    });

    return matchedAlbum?._id || matchedAlbum?.id || null;
  };

  // Filter out: Album photos, Milestones, and specific date (Feb 22, 2026)
  const pureMemories = memories.filter((memory) => {
    // Hide if associated with an album
    const albumId =
      getMemoryAlbumId(memory) || getAlbumIdFromDescription(memory);
    if (albumId) return false;

    // Hide milestones (like study, hard work)
    if (memory.isMilestone) return false;

    // Hide specific date: Feb 22, 2026
    const memDate = new Date(memory.date);
    const isFeb22_2026 =
      memDate.getFullYear() === 2026 &&
      memDate.getMonth() === 1 &&
      memDate.getDate() === 22;

    if (isFeb22_2026) return false;

    return true;
  });

  const normalizeSearchText = (value) => String(value || "").toLowerCase();
  const filteredPhotos = searchQuery
    ? pureMemories.filter(
        (m) =>
          normalizeSearchText(m.title).includes(
            normalizeSearchText(searchQuery),
          ) ||
          normalizeSearchText(m.description).includes(
            normalizeSearchText(searchQuery),
          ) ||
          (Array.isArray(m.tags) &&
            m.tags.some((t) =>
              normalizeSearchText(t).includes(normalizeSearchText(searchQuery)),
            )),
      )
    : pureMemories;

  const handleEdit = (memory) => {
    setEditingMemory(memory);
    setShowMemoryForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete(
      "Are you sure you want to delete this memory?",
    );
    if (!confirmed) return;

    await deleteMemory(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading your photos..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Premium Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Personal Gallery
            </h1>
            <p className="text-stone-300 text-base max-w-xl leading-relaxed">
              Every moment is a memory waiting to be preserved. Your independent
              moments, gathered in one place.
            </p>
          </div>
          <div className="flex flex-shrink-0">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 20px rgba(251, 191, 36, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMemoryForm(true)}
              className="px-6 py-3 bg-amber-400 text-stone-900 rounded-xl font-bold text-base hover:bg-amber-300 transition-all flex items-center gap-2.5 shadow-lg"
            >
              <FiPlus className="w-5 h-5" />
              Capture Today
            </motion.button>
          </div>
        </div>

        {/* Dynamic Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] -ml-24 -mb-24" />
      </motion.div>

      {/* Search and Filters Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <FiCamera className="text-amber-600 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Your Library</h2>
            <p className="text-stone-500 text-sm">
              {filteredPhotos.length} Photos total
            </p>
          </div>
        </div>

        <div className="w-full md:w-80">
          <SearchBar
            placeholder="Search your library..."
            onSearch={setSearchQuery}
          />
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="px-1">
        {filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white/50 rounded-3xl border border-dashed border-stone-200">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <FiCamera className="w-10 h-10 text-amber-200" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">
              {searchQuery ? "No matching photos" : "Start your library"}
            </h3>
            <p className="text-stone-500 max-w-xs mx-auto mb-8">
              {searchQuery
                ? "Try searching for something else or clear the filters."
                : "Photos you upload directly (not in an album) will appear here."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowMemoryForm(true)}
                className="btn-gold px-8 py-3"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                Upload First Photo
              </button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {filteredPhotos.map((photo) => (
              <MemoryCard
                key={photo._id}
                memory={photo}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Memory Form Modal */}
      <MemoryForm
        isOpen={showMemoryForm}
        onClose={() => {
          setShowMemoryForm(false);
          setEditingMemory(null);
        }}
        onSubmit={async (data) => {
          let result;
          if (editingMemory) {
            result = await updateMemory(editingMemory._id, data);
            if (result?.success) {
              toast.success("Memory updated successfully!");
            } else {
              toast.error(result?.error || "Failed to update memory");
              return;
            }
          } else {
            result = await createMemory(data);
            if (result?.success) {
              toast.success(
                result.count > 1
                  ? `${result.count} memories created!`
                  : "Memory created successfully!",
              );
            } else {
              toast.error(result?.error || "Failed to create memory");
              return;
            }
          }
          setShowMemoryForm(false);
          setEditingMemory(null);
        }}
        memory={editingMemory}
      />
    </div>
  );
};

export default Photos;
