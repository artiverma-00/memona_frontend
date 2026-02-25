import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiClock,
  FiImage,
  FiStar,
  FiPlus,
  FiSun,
  FiHeart,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { useMemory } from "../context/MemoryContext";
import { confirmDelete } from "../components/shared/ConfirmToast";
import MemoryCard from "../components/memory/MemoryCard";
import MemoryMilestone from "../components/memory/MemoryMilestone";
import AlbumCard from "../components/album/AlbumCard";
import MemoryForm from "../components/memory/MemoryForm";
import ReminisceModal from "../components/modal/ReminisceModal";
import Loader from "../components/shared/Loader";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    memories = [],
    albums = [],
    milestones = [],
    sharedMemories = [],
    loading,
    fetchMemories,
    fetchAlbums,
    fetchMilestones,
    fetchSharedMemories,
    createMemory,
    deleteMemory,
    toggleFavorite,
    deleteAlbum,
  } = useMemory();
  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [showReminisce, setShowReminisce] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMemories();
      fetchAlbums();
      fetchMilestones();
      fetchSharedMemories();
    }
  }, [user, fetchMemories, fetchAlbums, fetchMilestones, fetchSharedMemories]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      fetchSharedMemories();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user, fetchSharedMemories]);

  // Redirect to login if no user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  // Create a combined list of albums and memories for the "Your Library" section
  const combinedLibraryItems = [
    ...albums.map((a) => ({ ...a, type: "album" })),
    ...memories.map((m) => ({ ...m, type: "memory" })),
  ].sort((a, b) => {
    const dateA = new Date(a.date || a.created_at || a.createdAt || 0);
    const dateB = new Date(b.date || b.created_at || b.createdAt || 0);
    return dateB - dateA;
  });

  // Get recent items (last 8 for 4-column grid)
  const recentItems = combinedLibraryItems.slice(0, 8);

  // Get favorite memories
  const favoriteMemories = memories.filter((m) => m.isFavorite);

  const getMemoryAlbumId = (memory) => {
    return (
      memory?.album_id ||
      memory?.albumId ||
      memory?.album?.id ||
      memory?.album?._id ||
      (Array.isArray(memory?.album_memories) &&
        memory.album_memories.length > 0 &&
        memory.album_memories[0].album_id) ||
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

  const getMemoryRedirectPath = (memory) => {
    const directAlbumId = getMemoryAlbumId(memory);
    if (directAlbumId) {
      return `/albums/${directAlbumId}`;
    }

    const mappedAlbumId = getAlbumIdFromDescription(memory);
    if (mappedAlbumId) {
      return `/albums/${mappedAlbumId}`;
    }

    return "/photos";
  };

  const mapMemoryWithAlbumId = (memory) => {
    const mappedAlbumId =
      getMemoryAlbumId(memory) || getAlbumIdFromDescription(memory);
    if (!mappedAlbumId) {
      return memory;
    }

    return {
      ...memory,
      album_id: memory.album_id || mappedAlbumId,
      albumId: memory.albumId || mappedAlbumId,
    };
  };

  const recentItemsWithAlbumData = recentItems.map((item) => {
    if (item.type === "album") return item;
    return mapMemoryWithAlbumId(item);
  });

  const handleDeleteAlbum = async (id) => {
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

  const handleDeleteMemory = async (id) => {
    const confirmed = await confirmDelete("Delete this memory?");
    if (!confirmed) {
      return;
    }

    const result = await deleteMemory(id);
    if (result?.success) {
      toast.success("Memory deleted successfully!");
    } else {
      toast.error(result?.error || "Failed to delete memory");
    }
  };

  const thisMonthMemories = memories.filter((m) => {
    const memoryDate = new Date(m.date);
    const now = new Date();
    return (
      memoryDate.getMonth() === now.getMonth() &&
      memoryDate.getFullYear() === now.getFullYear()
    );
  });

  const thisMonthAlbums = albums.filter((a) => {
    const albumDate = new Date(a.created_at || a.date);
    const now = new Date();
    return (
      albumDate.getMonth() === now.getMonth() &&
      albumDate.getFullYear() === now.getFullYear()
    );
  });

  const monthBreakdown = thisMonthMemories.reduce(
    (acc, m) => {
      const type = m.media_type || m.media?.[0]?.type || "image";
      if (type === "video") acc.video++;
      else if (type === "audio") acc.audio++;
      else acc.photo++;
      return acc;
    },
    { photo: 0, video: 0, audio: 0 },
  );

  const stats = [
    {
      label: "Albums",
      value: albums.length,
      icon: FiImage,
      gradient: "from-amber-300 to-amber-400",
      link: "/albums",
      color: "from-amber-400 to-amber-500",
    },
    {
      label: "Photos total",
      value: memories.length,
      icon: FiImage,
      gradient: "from-amber-300 to-amber-400",
      link: "/timeline",
      color: "from-amber-300 to-amber-400",
    },
    {
      label: "Milestones",
      value: milestones.length,
      icon: FiStar,
      gradient: "from-amber-300 to-amber-400",
      link: "/milestones",
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "This Month",
      value: thisMonthMemories.length + thisMonthAlbums.length,
      subValue: `${thisMonthAlbums.length}alb • ${monthBreakdown.photo}ph • ${monthBreakdown.video}vid • ${monthBreakdown.audio}aud`,
      icon: FiSun,
      gradient: "from-amber-300 to-amber-400",
      link: "/timeline",
      color: "from-indigo-400 to-indigo-500",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading your memories..." />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={item} className="premium-header p-3 md:p-5">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text-primary)] mb-1">
              Welcome back, {user?.username || "there"}! 👋
            </h1>
            <p className="text-[var(--color-text-secondary)] text-sm md:text-base">
              You have{" "}
              <span className="font-semibold text-amber-600">
                {memories.length} memories
              </span>{" "}
              to cherish. Keep preserving your journey!
            </p>
          </div>

          {/* Reminisce Button */}
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 30px rgba(244, 180, 0, 0.4)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowReminisce(true)}
            className="btn-reminisce px-4 py-2 text-sm"
          >
            <FiSun className="w-4 h-4" />
            Reminisce
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="group rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-bg)] p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-medium">
                {stat.label}
              </p>
              <div
                className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-[var(--color-text-primary)] leading-tight">
                {stat.value}
              </p>
              {stat.subValue && (
                <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                  {stat.subValue}
                </p>
              )}
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Horizontal Favorites Section */}
      <motion.div variants={item} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <FiHeart className="text-rose-500 fill-current" />
            Favorite Highlights
          </h2>
          {favoriteMemories.length > 0 && (
            <Link
              to="/timeline?favorite=true"
              className="text-[var(--color-text-secondary)] text-sm hover:text-amber-600 transition-colors"
            >
              See all favorites →
            </Link>
          )}
        </div>

        {favoriteMemories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {favoriteMemories.slice(0, 6).map((memory) => (
              <Link
                key={memory._id}
                to={getMemoryRedirectPath(memory)}
                className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--color-surface-border)] shadow-sm hover:shadow-md transition-all"
              >
                {memory.media?.[0]?.type === "image" ? (
                  <img
                    src={memory.media[0].url}
                    alt={memory.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                    <FiStar className="w-6 h-6 text-amber-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] font-medium text-white truncate">
                    {memory.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--color-surface-bg)] border border-dashed border-[var(--color-surface-border)] rounded-2xl p-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Your favorite memories will appear here. Heart some memories to
              see them!
            </p>
          </div>
        )}
      </motion.div>

      {/* Your Milestones Section */}
      {milestones.length > 0 && (
        <motion.div variants={item} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <FiStar className="text-amber-500" />
              Your Milestones
            </h2>
            <Link
              to="/milestones"
              className="text-amber-600 text-sm font-semibold hover:underline flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full"
            >
              Manage All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {milestones.slice(0, 5).map((milestone) => (
              <MemoryMilestone
                key={milestone._id}
                milestone={milestone}
                variant="compact"
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Horizontal Photo Grid Section (Renamed from Recent Memories) */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <FiImage className="text-amber-500" />
            Your Library
          </h2>
          <Link
            to="/timeline"
            className="text-amber-600 text-sm font-semibold hover:underline flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full"
          >
            View All →
          </Link>
        </div>

        {recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentItemsWithAlbumData
              .filter((item) => item.type === "album" || !item.isMilestone)
              .slice(0, 8)
              .map((item) =>
                item.type === "album" ? (
                  <AlbumCard
                    key={item._id}
                    album={item}
                    onDelete={handleDeleteAlbum}
                    showActions={true}
                  />
                ) : (
                  <MemoryCard
                    key={item._id}
                    memory={item}
                    onToggleFavorite={toggleFavorite}
                    onDelete={handleDeleteMemory}
                  />
                ),
              )}
          </div>
        ) : (
          <div className="bg-[var(--color-surface-bg)] rounded-2xl p-8 text-center border border-[var(--color-surface-border)] shadow-sm">
            <div className="w-16 h-16 rounded-full bg-amber-50/50 flex items-center justify-center mx-auto mb-4">
              <FiClock className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
              No memories yet
            </h3>
            <p className="text-stone-500 mb-4 max-w-xs mx-auto">
              Capture your first moment and start your digital memory lane
              today.
            </p>
            <button
              onClick={() =>
                navigate("/photos", { state: { openMemoryForm: true } })
              }
              className="btn-gold px-8 py-3"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Create Your First Memory
            </button>
          </div>
        )}
      </motion.div>

      {/* Shared Memories Section */}
      {sharedMemories.length > 0 && (
        <motion.div variants={item} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <FiImage className="text-amber-500" />
              Shared with Me
            </h3>
            <Link
              to="/shared"
              className="text-amber-600 text-sm font-semibold hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedMemories.slice(0, 3).map((memory) => (
              <Link
                key={memory._id || memory.id}
                to={getMemoryRedirectPath(memory)}
                className="flex items-center gap-3 bg-[var(--color-surface-bg)] p-3 rounded-xl border border-[var(--color-surface-border)] shadow-sm hover:shadow-md transition-all group"
              >
                {memory.media?.[0]?.type === "image" ? (
                  <img
                    src={memory.media[0].url}
                    alt={memory.title}
                    className="h-14 w-14 rounded-lg object-cover shadow-inner"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-amber-50">
                    <FiImage className="h-7 w-7 text-amber-400" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate group-hover:text-amber-600 transition-colors">
                    {memory.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    By {memory.user?.name || "Shared User"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Memory Creation Modal */}
      <MemoryForm
        isOpen={showMemoryForm}
        onClose={() => setShowMemoryForm(false)}
        onSubmit={async (data) => {
          const result = await createMemory(data);
          if (result?.success) {
            toast.success("Memory created successfully!");
            setShowMemoryForm(false);
          } else {
            toast.error(result?.error || "Failed to create memory");
          }
        }}
      />

      {/* Reminisce Modal */}
      <ReminisceModal
        isOpen={showReminisce}
        onClose={() => setShowReminisce(false)}
        memories={memories}
      />
    </motion.div>
  );
};

export default Dashboard;
