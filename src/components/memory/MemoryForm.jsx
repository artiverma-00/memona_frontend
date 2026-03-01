import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiX,
  FiImage,
  FiMic,
  FiPlay,
  FiMapPin,
  FiCalendar,
  FiTag,
  FiSmile,
  FiUpload,
  FiTrash2,
  FiLock,
  FiGlobe,
} from "react-icons/fi";
import { formatDateForInput } from "../../utils/formatDate";
import { MEMORY_CATEGORIES, EMOTIONS } from "../../utils/constants";
import Modal from "../shared/Modal";

const MemoryForm = ({
  isOpen,
  onClose,
  onSubmit,
  memory = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: formatDateForInput(new Date()),
    location: { name: "", coordinates: null },
    media: [],
    tags: [],
    emotions: [],
    category: "moment",
    isPrivate: true,
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (memory) {
      setFormData({
        title: memory.title || "",
        description: memory.description || "",
        date: formatDateForInput(memory.date) || formatDateForInput(new Date()),
        location: memory.location || { name: "", coordinates: null },
        media: memory.media || [],
        tags: memory.tags || [],
        emotions: memory.emotions || [],
        category: memory.category || "moment",
        isPrivate: memory.isPrivate !== undefined ? memory.isPrivate : true,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        date: formatDateForInput(new Date()),
        location: { name: "", coordinates: null },
        media: [],
        tags: [],
        emotions: [],
        category: "moment",
        isPrivate: true,
      });
    }
    setTagInput("");
    setErrors({});
  }, [memory, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleLocationCoordinateChange = (field, value) => {
    setFormData((prev) => {
      const nextCoordinates = {
        ...(prev.location?.coordinates || {}),
        [field]: value === "" ? null : Number(value),
      };

      return {
        ...prev,
        location: {
          ...(prev.location || { name: "" }),
          coordinates:
            nextCoordinates.lat === null && nextCoordinates.lng === null
              ? null
              : nextCoordinates,
        },
      };
    });
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleToggleEmotion = (emotion) => {
    setFormData((prev) => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter((e) => e !== emotion)
        : [...prev.emotions, emotion],
    }));
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map((file) => ({
      type: file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : "audio",
      url: URL.createObjectURL(file),
      file,
    }));
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, ...newMedia],
    }));
  };

  const handleRemoveMedia = (index) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memory ? "Edit Memory" : "Create Memory"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`
              w-full px-4 py-2.5 rounded-xl border-2 
              bg-gray-50 
              text-gray-900
              focus:ring-2 focus:ring-indigo-500/20 
              focus:border-indigo-500 outline-none transition-all
              ${errors.title ? "border-red-500" : "border-transparent"}
            `}
            placeholder="What's this memory about?"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
            placeholder="Tell us more about this memory..."
          />
        </div>

        {/* Date & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`
                  w-full pl-10 pr-4 py-2.5 rounded-xl border-2 
                  bg-gray-50 
                  text-gray-900
                  focus:ring-2 focus:ring-indigo-500/20 
                  focus:border-indigo-500 outline-none transition-all
                  ${errors.date ? "border-red-500" : "border-transparent"}
                `}
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            >
              {MEMORY_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <div className="relative">
            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="locationName"
              value={formData.location.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location: { ...prev.location, name: e.target.value },
                }))
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-transparent bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="Where did this happen?"
            />
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="number"
              step="any"
              min={-90}
              max={90}
              value={formData.location?.coordinates?.lat ?? ""}
              onChange={(e) =>
                handleLocationCoordinateChange("lat", e.target.value)
              }
              className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="Latitude (e.g. 28.6139)"
            />

            <input
              type="number"
              step="any"
              min={-180}
              max={180}
              value={formData.location?.coordinates?.lng ?? ""}
              onChange={(e) =>
                handleLocationCoordinateChange("lng", e.target.value)
              }
              className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="Longitude (e.g. 77.2090)"
            />
          </div>
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photos & Videos
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
            {formData.media.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {formData.media.map((item, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden"
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : item.type === "audio" ? (
                      <div className="w-full h-full bg-indigo-50 text-indigo-700 flex flex-col items-center justify-center gap-2 p-2">
                        <FiMic className="w-5 h-5" />
                        <span className="text-[10px] font-medium text-center line-clamp-2 break-all">
                          {item.file?.name || "Audio file"}
                        </span>
                        <audio src={item.url} controls className="w-full h-7" />
                      </div>
                    ) : item.type === "video" ? (
                      <div className="relative w-full h-full">
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                          <div className="w-9 h-9 rounded-full bg-white/80 text-stone-900 flex items-center justify-center">
                            <FiPlay className="w-4 h-4 ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <label className="flex items-center justify-center gap-2 cursor-pointer py-2 text-gray-500 hover:text-gray-700 transition-colors">
              <FiUpload className="w-5 h-5" />
              <span className="text-sm">
                Upload photos, videos, or audio (multiple at once)
              </span>
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Emotions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How did you feel?
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map((emotion) => (
              <button
                key={emotion.value}
                type="button"
                onClick={() => handleToggleEmotion(emotion.value)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${
                    formData.emotions.includes(emotion.value)
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                {emotion.icon} {emotion.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="relative">
            <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-transparent bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="Press Enter to add tags"
            />
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-indigo-800"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Privacy */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, isPrivate: true }))
            }
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all
              ${
                formData.isPrivate
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-gray-100 text-gray-600"
              }
            `}
          >
            <FiLock className="w-4 h-4" />
            Private
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, isPrivate: false }))
            }
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all
              ${
                !formData.isPrivate
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-gray-100 text-gray-600"
              }
            `}
          >
            <FiGlobe className="w-4 h-4" />
            Public
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : memory ? "Update Memory" : "Create Memory"}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default MemoryForm;
