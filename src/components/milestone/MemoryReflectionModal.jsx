import { useState } from "react";
import { X, Heart, Share2 } from "lucide-react";
import Modal from "../shared/Modal";

export default function MemoryReflectionModal({
  milestone,
  isOpen,
  onClose,
  onOpenMemory,
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateYearsSince = (date) => {
    if (!date) return 0;
    const targetDate = new Date(date);
    const today = new Date();
    return today.getFullYear() - targetDate.getFullYear();
  };

  const handleSaveReflection = async () => {
    setIsSaving(true);
    // TODO: Save reflection to backend
    setTimeout(() => {
      setIsSaving(false);
      setReflectionText("");
      onClose();
    }, 1000);
  };

  if (!milestone) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnBackdropClick={false}
    >
      <div className="bg-white rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header with image */}
        <div className="relative h-64 sm:h-96 bg-gradient-to-br from-gray-200 to-gray-100 overflow-hidden">
          {milestone.memory_thumbnail && (
            <img
              src={milestone.memory_thumbnail}
              alt={milestone.memory_title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
          >
            <X size={24} className="text-gray-900" />
          </button>

          {/* Years badge - bottom right */}
          <div className="absolute bottom-6 right-6">
            <span className="inline-flex items-center px-4 py-2 bg-gold-500 text-white rounded-full font-bold shadow-lg">
              {calculateYearsSince(milestone.celebration_date)}{" "}
              {calculateYearsSince(milestone.celebration_date) === 1
                ? "year"
                : "years"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-10">
          {/* Title section */}
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-2">
              {milestone.memory_title}
            </h2>
            <p className="text-gray-600 font-light">
              {formatDate(milestone.celebration_date)}
            </p>
          </div>

          {/* Description */}
          {milestone.memory_description && (
            <p className="text-gray-700 leading-relaxed mb-8 font-light">
              {milestone.memory_description}
            </p>
          )}

          {/* Reflection prompt */}
          <div className="mb-8">
            <label className="block mb-3">
              <span className="text-lg font-semibold text-gray-900 mb-2 block">
                📝 Reflect on this memory
              </span>
              <span className="text-sm text-gray-600 font-light">
                How has this moment shaped you? What does it mean to you now?
              </span>
            </label>

            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Write your thoughts, feelings, and reflections about this milestone..."
              className="w-full h-32 p-4 border-2 border-gold-100 rounded-xl focus:border-gold-400 focus:outline-none resize-none font-light text-gray-700 bg-gold-50 placeholder-gray-400"
            />
            <p className="text-xs text-gray-500 mt-2 font-light">
              Your reflections are private and saved only to you.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Like button */}
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300
                ${
                  isLiked
                    ? "bg-rose-100 text-rose-600 border border-rose-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }
              `}
            >
              <Heart size={20} className={isLiked ? "fill-current" : ""} />
              {isLiked ? "Liked" : "Like this memory"}
            </button>

            {/* Share button */}
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all duration-300">
              <Share2 size={20} />
              Share
            </button>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Save reflection button */}
            <button
              onClick={handleSaveReflection}
              disabled={isSaving || !reflectionText.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white rounded-xl font-semibold hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Reflection"}
            </button>
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-gray-200" />

          {/* Additional info */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gold-50 rounded-xl">
              <p className="text-2xl font-bold text-gold-600 mb-1">
                {calculateYearsSince(milestone.celebration_date)}
              </p>
              <p className="text-xs text-gray-600 font-light">Years Ago</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600 mb-1">
                {milestone.reminder_enabled ? "✓" : "○"}
              </p>
              <p className="text-xs text-gray-600 font-light">
                {milestone.reminder_enabled ? "Reminders On" : "No Reminders"}
              </p>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl">
              <p className="text-2xl font-bold text-rose-600 mb-1">★</p>
              <p className="text-xs text-gray-600 font-light">Treasured</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
