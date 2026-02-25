import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHeart,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiShare2,
  FiMic,
  FiPlay,
} from "react-icons/fi";
import {
  PhotoStoryCard,
  VideoStoryCard,
  AudioStoryCard,
  MilestoneStoryCard,
} from "./PremiumCards";

const MemoryCard = ({
  memory,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShare,
  showActions = true,
  variant = "default", // 'default', 'compact', 'featured'
  aspectRatio,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const mainMedia = memory.media?.find((m) => m.type === "image") ||
    memory.media?.find((m) => m.type === "video") ||
    memory.media?.[0] || { type: "image" };

  const mediaType = mainMedia.type || "image";

  const albumId =
    memory.album_id ||
    memory.albumId ||
    memory.album?.id ||
    memory.album?._id ||
    null;

  const contentLink = albumId ? `/albums/${albumId}` : `/memory/${memory._id}`;

  const handleAction = (e, callback) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
    setShowMenu(false);
  };

  const handleCardClick = (e) => {
    // If it's a photo, video, or audio, show preview instead of navigating
    if (
      mediaType === "image" ||
      mediaType === "video" ||
      mediaType === "audio"
    ) {
      setShowPreview(true);
    } else {
      navigate(contentLink);
    }
  };

  // Premium Grid UI
  if (variant === "default" || variant === "featured") {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -10 }}
          className="relative group cursor-pointer"
          onClick={handleCardClick}
        >
          {/* Render the specific Premium Card */}
          {memory.isMilestone ? (
            <MilestoneStoryCard
              milestone={memory}
              aspectRatio={aspectRatio}
              memoriesCount={memory.memoriesCount || 0}
            />
          ) : mediaType === "video" ? (
            <VideoStoryCard memory={memory} aspectRatio={aspectRatio} />
          ) : mediaType === "audio" ? (
            <AudioStoryCard memory={memory} aspectRatio={aspectRatio} />
          ) : (
            <PhotoStoryCard memory={memory} aspectRatio={aspectRatio} />
          )}

          {/* Favorite Overlay Trigger */}
          <button
            onClick={(e) =>
              handleAction(e, () => onToggleFavorite?.(memory._id))
            }
            className="absolute top-4 right-12 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-amber-500 hover:border-amber-400 z-20"
          >
            <FiHeart
              className={`w-4 h-4 ${memory.isFavorite ? "fill-current text-red-500" : ""}`}
            />
          </button>

          {/* Action Menu Trigger */}
          {showActions && (
            <div className="absolute top-4 right-4 z-30">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-amber-500 z-30 shadow-xl"
              >
                <FiMoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden z-[60] py-1"
                  >
                    <button
                      onClick={(e) => handleAction(e, () => onEdit?.(memory))}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4" /> Edit Narrative
                    </button>
                    <button
                      onClick={(e) => handleAction(e, () => onShare?.(memory))}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      <FiShare2 className="w-4 h-4" /> Share Moment
                    </button>
                    {mainMedia.url && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement("a");
                          link.href = mainMedia.url;
                          link.download = memory.title || "memory";
                          link.click();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                      >
                        <FiDownload className="w-4 h-4" /> Save File
                      </button>
                    )}
                    <div className="h-px bg-stone-100 mx-2" />
                    <button
                      onClick={(e) =>
                        handleAction(e, () => onDelete?.(memory._id))
                      }
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" /> Delete Memory
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Full Screen Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black backdrop-blur-3xl"
              onClick={() => setShowPreview(false)}
            >
              <button
                className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[10000] border border-white/20 shadow-2xl"
                onClick={() => setShowPreview(false)}
              >
                <FiMoreVertical className="w-6 h-6 rotate-45" />
              </button>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full h-full flex items-center justify-center select-none relative group/preview"
                onClick={(e) => e.stopPropagation()}
              >
                {mediaType === "video" ? (
                  <video
                    src={mainMedia.url}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                  />
                ) : mediaType === "audio" ? (
                  <div className="bg-stone-900/60 backdrop-blur-2xl p-12 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center gap-8 min-w-[400px]">
                    <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                      <FiMic className="w-10 h-10 text-stone-900" />
                    </div>
                    <audio
                      src={mainMedia.url}
                      controls
                      autoPlay
                      className="w-full"
                    />
                  </div>
                ) : (
                  <img
                    src={mainMedia.url}
                    alt={memory.title}
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Immersive Cinematic Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="max-w-4xl mx-auto text-center pointer-events-auto">
                    <h2 className="text-5xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">
                      {memory.title}
                    </h2>
                    <p className="text-white/70 text-xl font-medium line-clamp-2 mb-8 drop-shadow-lg">
                      {memory.description || "Every pixel tells a story."}
                    </p>
                    <div className="flex items-center justify-center gap-5">
                      <button
                        onClick={() => navigate(contentLink)}
                        className="px-10 py-4 bg-amber-500 text-stone-900 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                      >
                        Explore Diary
                      </button>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="px-10 py-4 bg-white/10 backdrop-blur-md text-white rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-white/20 transition-all border border-white/20"
                      >
                        Close View
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Compact fallback (for lists etc)
  return (
    <div
      className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-100 hover:border-amber-200 transition-all cursor-pointer"
      onClick={() => navigate(contentLink)}
    >
      <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
        {mediaType === "image" && mainMedia.url && (
          <img
            src={mainMedia.url}
            className="w-full h-full object-cover"
            alt=""
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-stone-800 truncate">
          {memory.title}
        </h4>
        <p className="text-[10px] text-stone-400 font-bold uppercase">
          {new Date(memory.date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default MemoryCard;
