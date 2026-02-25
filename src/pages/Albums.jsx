import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiImage } from "react-icons/fi";
import { toast } from "react-toastify";
import { useMemory } from "../context/MemoryContext";
import { confirmDelete } from "../components/shared/ConfirmToast";
import AlbumCard from "../components/album/AlbumCard";
import AlbumForm from "../components/album/AlbumForm";
import SearchBar from "../components/shared/SearchBar";
import Loader from "../components/shared/Loader";

const Albums = () => {
  const {
    albums,
    memories,
    loading,
    fetchAlbums,
    fetchMemories,
    createAlbum,
    updateAlbum,
    deleteAlbum,
  } = useMemory();
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAlbums();
    fetchMemories();
  }, [fetchAlbums, fetchMemories]);

  const albumMemoryCounts = memories.reduce((accumulator, memory) => {
    const albumId =
      memory?.album_id ||
      memory?.albumId ||
      memory?.album?.id ||
      memory?.album?._id ||
      null;

    if (!albumId) {
      return accumulator;
    }

    accumulator[albumId] = (accumulator[albumId] || 0) + 1;
    return accumulator;
  }, {});

  const normalizeSearchText = (value) => String(value || "").toLowerCase();

  const filteredAlbums = searchQuery
    ? albums.filter(
        (a) =>
          normalizeSearchText(a.name).includes(
            normalizeSearchText(searchQuery),
          ) ||
          normalizeSearchText(a.description).includes(
            normalizeSearchText(searchQuery),
          ) ||
          (Array.isArray(a.tags)
            ? a.tags.some((t) =>
                normalizeSearchText(t).includes(
                  normalizeSearchText(searchQuery),
                ),
              )
            : false),
      )
    : albums;

  const handleEdit = (album) => {
    setEditingAlbum(album);
    setShowAlbumForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete(
      "Are you sure you want to delete this album?",
    );
    if (!confirmed) return;

    const result = await deleteAlbum(id);
    if (result?.success) {
      toast.success("Album deleted successfully!");
    } else {
      toast.error(result?.error || "Failed to delete album");
    }
  };

  const handleSubmit = async (data) => {
    if (editingAlbum) {
      await updateAlbum(editingAlbum._id, data);
    } else {
      await createAlbum(data);
    }
    setShowAlbumForm(false);
    setEditingAlbum(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading albums..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Albums</h1>
          <p className="text-stone-500">
            {albums.length} {albums.length === 1 ? "album" : "albums"} to
            organize your memories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SearchBar
            placeholder="Search albums..."
            onSearch={setSearchQuery}
            className="w-64"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingAlbum(null);
              setShowAlbumForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 rounded-xl font-semibold text-sm hover:from-amber-500 hover:to-amber-600 transition-all"
          >
            <FiPlus className="w-5 h-5" />
            Create Album
          </motion.button>
        </div>
      </div>

      {/* Content */}
      {albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <FiImage className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">
            No albums yet
          </h3>
          <p className="text-stone-500 max-w-md mb-6">
            Create albums to organize your memories into collections.
          </p>
          <button onClick={() => setShowAlbumForm(true)} className="btn-gold">
            Create Your First Album
          </button>
        </div>
      ) : searchQuery && filteredAlbums.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone-500">No albums found for "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAlbums.map((album) => (
            <AlbumCard
              key={album._id}
              album={{
                ...album,
                memoryCount:
                  albumMemoryCounts[album._id] ??
                  album.memoryCount ??
                  album.memory_count ??
                  album.memories_count ??
                  0,
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Album Form Modal */}
      <AlbumForm
        isOpen={showAlbumForm}
        onClose={() => {
          setShowAlbumForm(false);
          setEditingAlbum(null);
        }}
        onSubmit={handleSubmit}
        album={editingAlbum}
      />
    </div>
  );
};

export default Albums;
