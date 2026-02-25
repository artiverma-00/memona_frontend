import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiImage,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiShare2,
  FiLock,
  FiGlobe,
} from "react-icons/fi";
import { useState } from "react";

const AlbumCard = ({
  album,
  onEdit,
  onDelete,
  onShare,
  showActions = true,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const coverImage =
    album.memories?.[0]?.media?.find((m) => m.type === "image")?.url ||
    album.coverImage ||
    null;

  const memoryCount = Number(
    album.memoryCount ??
      album.memory_count ??
      album.memories_count ??
      (Array.isArray(album.memories) ? album.memories.length : 0),
  );
  const safeMemoryCount = Number.isFinite(memoryCount) ? memoryCount : 0;
  const privacyLabel = album.isPrivate ? "Private" : "Public";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover Image */}
      <Link
        to={`/albums/${album._id}`}
        className="block relative aspect-[4/3] overflow-hidden album-cover"
      >
        {coverImage ? (
          <img
            src={coverImage}
            alt={album.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center">
            <FiImage className="w-12 h-12 text-amber-300" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Privacy Badge */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 text-xs font-medium text-stone-700 backdrop-blur-sm z-10">
          {album.isPrivate ? (
            <>
              <FiLock className="w-3 h-3" />
              Private
            </>
          ) : (
            <>
              <FiGlobe className="w-3 h-3" />
              Public
            </>
          )}
        </div>

        {/* Tag Badges (Overlay on left side as requested) */}
        <div className="absolute top-12 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {album.tags
            ?.filter((tag) => tag.toLowerCase().includes("milestone"))
            .map((tag, index) => (
              <div
                key={index}
                className="px-2 py-0.5 bg-amber-400/90 text-stone-900 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-amber-500/50 shadow-sm"
              >
                #{tag}
              </div>
            ))}
        </div>

        {/* Memory Count */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-amber-500 rounded-full text-sm font-medium text-white z-10">
          {safeMemoryCount} {safeMemoryCount === 1 ? "memory" : "memories"}
        </div>

        {/* Actions Menu */}
        {showActions && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowMenu(!showMenu);
                }}
                className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
              >
                <FiMoreVertical className="w-4 h-4 text-stone-700" />
              </button>

              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden z-10"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit?.(album);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onShare?.(album);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                  >
                    <FiShare2 className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete?.(album._id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </Link>

      {/* Content */}
      <Link to={`/albums/${album._id}`} className="block p-4">
        <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-amber-700 transition-colors">
          {album.name}
        </h3>

        <p className="mb-2 text-xs font-medium text-stone-500">
          {privacyLabel} • {safeMemoryCount}{" "}
          {safeMemoryCount === 1 ? "memory" : "memories"}
        </p>

        {album.description && (
          <p className="text-sm text-stone-600 line-clamp-2">
            {album.description}
          </p>
        )}

        {/* Tags */}
        {album.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {album.tags.map((tag, index) => {
              const isMilestoneTag = tag.toLowerCase().includes("milestone");
              return (
                <span
                  key={index}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                    isMilestoneTag
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  #{tag}
                </span>
              );
            })}
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default AlbumCard;
