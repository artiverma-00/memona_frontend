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
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiCheck,
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
  previewItems,
  previewIndex = 0,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(previewIndex);

  const getMainMediaFromMemory = (memoryItem) =>
    memoryItem.media?.find((m) => m.type === "image") ||
    memoryItem.media?.find((m) => m.type === "video") ||
    memoryItem.media?.[0] || { type: "image" };

  const getVideoThumbnailFromUrl = (url) => {
    const value = String(url || "");
    if (!value) return null;

    if (
      value.includes("res.cloudinary.com") &&
      value.includes("/video/upload/")
    ) {
      return value.replace("/video/upload/", "/video/upload/so_1,f_jpg/");
    }

    return null;
  };

  const mainMedia = getMainMediaFromMemory(memory);
  const videoThumbnail =
    memory.media?.find((m) => m.type === "video")?.thumbnail ||
    getVideoThumbnailFromUrl(
      memory.media?.find((m) => m.type === "video")?.url,
    );

  const mediaType = mainMedia.type || "image";

  const albumId =
    memory.album_id ||
    memory.albumId ||
    memory.album?.id ||
    memory.album?._id ||
    null;

  const contentLink = albumId ? `/albums/${albumId}` : `/memory/${memory._id}`;

  const previewSource =
    Array.isArray(previewItems) && previewItems.length > 0
      ? previewItems
      : [memory];

  const activeMemory = previewSource[currentPreviewIndex] || memory;
  const activeMainMedia = getMainMediaFromMemory(activeMemory);
  const activeMediaType = activeMainMedia.type || "image";
  const activeAlbumId =
    activeMemory.album_id ||
    activeMemory.albumId ||
    activeMemory.album?.id ||
    activeMemory.album?._id ||
    null;
  const activeContentLink = activeAlbumId
    ? `/albums/${activeAlbumId}`
    : `/memory/${activeMemory._id}`;

  // Get the base URL for share links
  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "";
  };

  // Handle share functionality with Web Share API or clipboard fallback
  const handleShare = async () => {
    const shareData = {
      title: memory.title || "Memory",
      text: memory.description || "Check out this memory!",
      url: `${getBaseUrl()}${contentLink}`,
    };

    // Try native Web Share API first (works on mobile)
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelled or error - fall through to clipboard
        if (err.name !== "AbortError") {
          console.log("Share cancelled or failed:", err);
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Show alert as last resort
      prompt("Copy this link to share:", shareData.url);
    }
  };

  // Handle download functionality
  const handleDownload = async (e) => {
    e.stopPropagation();

    if (!mainMedia.url) return;

    try {
      // If it's a Cloudinary URL, use our server endpoint
      if (mainMedia.url.includes("cloudinary.com")) {
        const encodedUrl = encodeURIComponent(mainMedia.url);
        const filename = memory.title || "memory";
        const downloadUrl = `/api/exports/download?url=${encodedUrl}&filename=${encodeURIComponent(filename)}`;
        window.open(downloadUrl, "_blank");
      } else {
        // For non-Cloudinary URLs, try direct download
        const link = document.createElement("a");
        link.href = mainMedia.url;
        link.download = memory.title || "memory";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Download failed:", err);
    }
    setShowMenu(false);
  };

  const handleAction = (e, callback) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
    setShowMenu(false);
  };

  const handleEditNarrative = () => {
    if (typeof onEdit === "function") {
      onEdit(memory);
      return;
    }

    navigate("/timeline", {
      state: {
        editMemory: memory,
      },
    });
  };

  const handleCardClick = (e) => {
    // If it's a photo, video, or audio, show preview instead of navigating
    if (
      mediaType === "image" ||
      mediaType === "video" ||
      mediaType === "audio"
    ) {
      setCurrentPreviewIndex(previewIndex);
      setShowPreview(true);
    } else {
      navigate(contentLink);
    }
  };

  const movePreview = (direction) => {
    if (previewSource.length <= 1) {
      return;
    }

    setCurrentPreviewIndex((prev) => {
      const next =
        (prev + direction + previewSource.length) % previewSource.length;
      return next;
    });
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
                      onClick={(e) => handleAction(e, handleEditNarrative)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={(e) => handleAction(e, () => handleShare())}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      {copied ? (
                        <>
                          <FiCheck className="w-4 h-4" /> Link Copied!
                        </>
                      ) : (
                        <>
                          <FiShare2 className="w-4 h-4" /> Share Moment
                        </>
                      )}
                    </button>
                    {mainMedia.url && (
                      <button
                        onClick={handleDownload}
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
                {previewSource.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        movePreview(-1);
                      }}
                      className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all z-[10000]"
                      aria-label="Previous media"
                    >
                      <FiChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        movePreview(1);
                      }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all z-[10000]"
                      aria-label="Next media"
                    >
                      <FiChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {activeMediaType === "video" ? (
                  <video
                    src={activeMainMedia.url}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                  />
                ) : activeMediaType === "audio" ? (
                  <div className="bg-stone-900/60 backdrop-blur-2xl p-12 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center gap-8 min-w-[400px]">
                    <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                      <FiMic className="w-10 h-10 text-stone-900" />
                    </div>
                    <audio
                      src={activeMainMedia.url}
                      controls
                      autoPlay
                      className="w-full"
                    />
                  </div>
                ) : (
                  <img
                    src={activeMainMedia.url}
                    alt={activeMemory.title}
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Immersive Cinematic Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="max-w-4xl mx-auto text-center pointer-events-auto">
                    <h2 className="text-5xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">
                      {activeMemory.title}
                    </h2>
                    <p className="text-white/70 text-xl font-medium line-clamp-2 mb-8 drop-shadow-lg">
                      {activeMemory.description || "Every pixel tells a story."}
                    </p>
                    <div className="flex items-center justify-center gap-5">
                      <button
                        onClick={() => navigate(activeContentLink)}
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
      <div className="relative w-12 h-12 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
        {(mediaType === "image" || mediaType === "video") &&
          (mediaType === "image" ? mainMedia.url : videoThumbnail) && (
            <img
              src={mediaType === "image" ? mainMedia.url : videoThumbnail}
              className="w-full h-full object-cover"
              alt=""
            />
          )}
        {mediaType === "video" && videoThumbnail && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-6 h-6 rounded-full bg-black/55 flex items-center justify-center">
              <FiPlay className="w-3 h-3 text-white ml-0.5" />
            </div>
          </div>
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
