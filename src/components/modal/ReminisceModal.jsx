import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiCalendar,
  FiImage,
  FiStar,
} from "react-icons/fi";
import { formatDate } from "../../utils/formatDate";

const ReminisceModal = ({ isOpen, onClose, memories = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const visualMemories = memories.filter((memory) => {
    if (memory?.media_type === "image" || memory?.media_type === "video") {
      return true;
    }

    return memory?.media?.some(
      (item) => item?.type === "image" || item?.type === "video",
    );
  });

  // Reset to random memory when opened
  useEffect(() => {
    if (isOpen && visualMemories.length > 0) {
      const randomIndex = Math.floor(Math.random() * visualMemories.length);
      setCurrentIndex(randomIndex);
    }
  }, [isOpen, visualMemories.length]);

  useEffect(() => {
    if (currentIndex >= visualMemories.length && visualMemories.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, visualMemories.length]);

  useEffect(() => {
    if (!isOpen || visualMemories.length <= 1) return;

    const autoSlideInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visualMemories.length);
    }, 5000);

    return () => clearInterval(autoSlideInterval);
  }, [isOpen, visualMemories.length]);

  const currentMemory = visualMemories[currentIndex];

  const handleNext = () => {
    if (!visualMemories.length) return;
    setCurrentIndex((prev) => (prev + 1) % visualMemories.length);
  };

  const handlePrev = () => {
    if (!visualMemories.length) return;
    setCurrentIndex(
      (prev) => (prev - 1 + visualMemories.length) % visualMemories.length,
    );
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  if (!currentMemory) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-3xl bg-[var(--color-surface-bg)] p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-page-bg)]"
            >
              <FiX className="h-5 w-5" />
            </button>

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <FiStar className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
              No memories yet
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Add a photo or video memory to start reminiscing.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-stone-900 transition-colors hover:bg-amber-300"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const mainVisual =
    currentMemory.media?.find((m) => m.type === "image") ||
    currentMemory.media?.find((m) => m.type === "video");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-[var(--color-surface-bg)] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[var(--color-surface-bg)]/80 backdrop-blur-sm hover:bg-[var(--color-surface-bg)] transition-colors"
          >
            <FiX className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>

          {/* Hero Image */}
          <div className="relative h-72 sm:h-96 overflow-hidden">
            {mainVisual?.type === "image" ? (
              <img
                src={mainVisual.url}
                alt={currentMemory.title}
                className="w-full h-full object-cover"
              />
            ) : mainVisual?.type === "video" ? (
              <video
                src={mainVisual.url}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-amber-300 to-amber-500 flex items-center justify-center">
                <FiStar className="w-16 h-16 text-white" />
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

            {/* Header Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-amber-500 rounded-full text-xs font-semibold flex items-center gap-1">
                  ✨ Reminisce
                </span>
                {currentMemory.isMilestone && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                    Milestone
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                {currentMemory.title}
              </h2>

              {/* Date & Location */}
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                <div className="flex items-center gap-1">
                  <FiCalendar className="w-4 h-4" />
                  {formatDate(currentMemory.date)}
                </div>
                {currentMemory.location?.name && (
                  <div className="flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    {currentMemory.location.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Tags */}
            {currentMemory.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {currentMemory.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Emotions */}
            {currentMemory.emotions?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {currentMemory.emotions.map((emotion, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-sm"
                  >
                    {emotion}
                  </span>
                ))}
              </div>
            )}

            {/* Media Count */}
            {currentMemory.media?.length > 1 && (
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm mb-6">
                <FiImage className="w-4 h-4" />
                {currentMemory.media.length} memories in this moment
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-[var(--color-surface-border)] pt-4">
              <button
                onClick={handlePrev}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-page-bg)] transition-colors"
              >
                <FiChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {visualMemories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`
                      w-2 h-2 rounded-full transition-all
                      ${
                        index === currentIndex
                          ? "bg-amber-500 w-6"
                          : "bg-[var(--color-surface-border)] hover:bg-[var(--color-text-secondary)]"
                      }
                    `}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-page-bg)] transition-colors"
              >
                Next
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReminisceModal;
