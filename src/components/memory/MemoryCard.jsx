import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHeart,
  FiShare2,
  FiMoreVertical,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiImage,
  FiEdit2,
  FiTrash2,
  FiStar,
  FiDownload,
} from "react-icons/fi";
import { formatDate } from "../../utils/formatDate";

const MemoryCard = ({
  memory,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShare,
  showActions = true,
  variant = "default", // 'default', 'compact', 'featured'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const mainMedia =
    memory.media?.find((m) => m.type === "image") || memory.media?.[0];
  const mainImage = mainMedia?.type === "image" ? mainMedia : null;
  const isMilestone = memory.isMilestone;
  const canDownload = Boolean(mainMedia?.url);
  const albumId =
    memory.album_id ||
    memory.albumId ||
    memory.album?.id ||
    memory.album?._id ||
    null;
  const isAlbumUploadedMemory =
    Boolean(albumId) ||
    /^uploaded from album/i.test(String(memory.description || "").trim());
  const contentLink = albumId
    ? `/albums/${albumId}`
    : isAlbumUploadedMemory
      ? "/albums"
      : `/memory/${memory._id}`;

  const variants = {
    default: "",
    compact: "flex-row",
    featured: "col-span-2 row-span-2",
  };

  const isMilestonePage = location.pathname === "/milestones";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
        group bg-[var(--color-surface-bg)] rounded-2xl overflow-hidden 
        border border-[var(--color-surface-border)] shadow-sm hover:shadow-xl 
        transition-all duration-300 hover:-translate-y-1
        ${variants[variant]}
        ${isMilestone && isMilestonePage ? "ring-2 ring-amber-200" : ""}
      `}
      >
        {/* Image */}
        <div
          className={`relative aspect-[4/3] overflow-hidden cursor-pointer`}
          onClick={() => {
            if (mainMedia?.url) {
              setShowPreview(true);
            }
          }}
        >
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={memory.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center">
              <FiImage className="w-12 h-12 text-amber-300" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Milestone Badge - Restored visibility on all pages as requested */}
          {isMilestone && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg z-10">
              <FiStar className="w-3 h-3" />
              Milestone
            </div>
          )}

          {/* Tag Badges (Overlay on left side as requested) */}
          <div className="absolute top-12 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {memory.tags
              ?.filter((tag) => tag.toLowerCase().includes("milestone"))
              .map((tag, index) => (
                <div
                  key={index}
                  className="px-2 py-0.5 bg-amber-400/90 text-stone-900 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-amber-500/50 shadow-sm"
                >
                  {tag}
                </div>
              ))}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite?.(memory._id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          >
            <FiHeart
              className={`w-4 h-4 ${memory.isFavorite ? "text-red-500 fill-current" : "text-stone-600"}`}
            />
          </button>

          {/* Actions Menu */}
          {showActions && (
            <div className="absolute bottom-3 right-3 opacity-100 transition-opacity duration-300 z-20">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-2 rounded-full bg-[var(--color-surface-bg)]/90 backdrop-blur-sm hover:bg-[var(--color-surface-bg)] transition-colors"
                >
                  <FiMoreVertical className="w-4 h-4 text-[var(--color-text-primary)]" />
                </button>

                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 bottom-full mb-2 w-44 bg-[var(--color-surface-bg)] rounded-xl shadow-lg border border-[var(--color-surface-border)] overflow-hidden z-30"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit?.(memory);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-page-bg)]"
                    >
                      <FiEdit2 className="w-4 h-4 text-[var(--color-text-secondary)]" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onShare?.(memory);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-page-bg)]"
                    >
                      <FiShare2 className="w-4 h-4 text-[var(--color-text-secondary)]" />
                      Share
                    </button>
                    {(albumId || isAlbumUploadedMemory) && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (albumId) {
                            navigate(`/albums/${albumId}`);
                          } else {
                            navigate("/albums");
                          }
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-page-bg)]"
                      >
                        <FiImage className="w-4 h-4 text-[var(--color-text-secondary)]" />
                        {albumId ? "Open Album" : "Open Albums"}
                      </button>
                    )}
                    {canDownload && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const link = document.createElement("a");
                          link.href = mainMedia.url;
                          link.download = `${memory.title || "memory"}`;
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-page-bg)]"
                      >
                        <FiDownload className="w-4 h-4 text-[var(--color-text-secondary)]" />
                        Download
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete?.(memory._id);
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

          {/* Media Count */}
          {memory.media?.length > 0 && (
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 rounded-full text-white text-xs flex items-center gap-1">
              <FiImage className="w-3 h-3" />
              {memory.media.length}
            </div>
          )}
        </div>

        {/* Content */}
        <Link to={contentLink} className="block p-4">
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">
            {memory.title}
          </h3>

          {memory.description && (
            <p className="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">
              {memory.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-1">
              <FiCalendar className="w-3.5 h-3.5" />
              {formatDate(memory.date)}
            </div>

            <div className="flex items-center gap-1">
              <FiClock className="w-3.5 h-3.5" />
              Uploaded {formatDate(
                memory.uploaded_at || memory.created_at,
              )}{" "}
              {formatDate(memory.uploaded_at || memory.created_at, "time")}
            </div>

            {memory.location?.name && (
              <div className="flex items-center gap-1">
                <FiMapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">
                  {memory.location.name}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {memory.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {memory.tags.map((tag, index) => {
                const isMilestoneTag = tag.toLowerCase().includes("milestone");
                return (
                  <span
                    key={index}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      isMilestoneTag
                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-[var(--color-page-bg)] text-[var(--color-text-secondary)]"
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

      {showPreview && mainMedia?.url ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 md:p-6 backdrop-blur-md"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="max-h-full max-w-5xl w-full flex flex-col items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="fixed top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md z-[10000]"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {mainMedia.type === "image" ? (
              <img
                src={mainMedia.url}
                alt={memory.title}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            ) : mainMedia.type === "video" ? (
              <video
                src={mainMedia.url}
                className="w-full max-h-[90vh] rounded-lg shadow-2xl"
                controls
                autoPlay
              />
            ) : (
              <div className="bg-stone-900 p-8 rounded-2xl w-full max-w-md shadow-2xl">
                <audio src={mainMedia.url} className="w-full" controls />
              </div>
            )}

            {memory.title && (
              <div className="mt-4 text-center">
                <h3 className="text-white text-xl font-medium">
                  {memory.title}
                </h3>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default MemoryCard;
