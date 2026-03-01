import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiX, FiImage, FiUpload, FiTag, FiLock, FiGlobe } from "react-icons/fi";
import Modal from "../shared/Modal";

const AlbumForm = ({
  isOpen,
  onClose,
  onSubmit,
  album = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: [],
    isPrivate: true,
    coverImage: null,
    coverFile: null,
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (album) {
      setFormData({
        name: album.name || "",
        description: album.description || "",
        tags: album.tags || [],
        isPrivate: album.isPrivate !== undefined ? album.isPrivate : true,
        coverImage: album.coverImage || null,
        coverFile: null,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        tags: [],
        isPrivate: true,
        coverImage: null,
        coverFile: null,
      });
    }
    setTagInput("");
    setErrors({});
  }, [album, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
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

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        coverImage: URL.createObjectURL(file),
        coverFile: file,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Album name is required";
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
      title={album ? "Edit Album" : "Create Album"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Cover Image
          </label>
          <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-(--color-surface-border)">
            {formData.coverImage ? (
              <img
                src={formData.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary">
                <FiImage className="w-10 h-10 mb-2" />
                <span className="text-sm">Upload cover image</span>
              </div>
            )}
            <label className="absolute inset-0 cursor-pointer hover:bg-black/20 transition-colors flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <FiUpload className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
            </label>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Album Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`
              w-full px-4 py-2.5 rounded-xl border-2 
              bg-page-bg
              text-text-primary
              focus:ring-2 focus:ring-amber-100
              focus:border-(--color-accent-gold) outline-none transition-all
              ${errors.name ? "border-red-500" : "border-transparent"}
            `}
            placeholder="Enter album name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent bg-page-bg text-text-primary focus:ring-2 focus:ring-amber-100 focus:border-(--color-accent-gold) outline-none transition-all resize-none"
            placeholder="Describe this album..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Tags
          </label>
          <div className="relative">
            <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-transparent bg-page-bg text-text-primary focus:ring-2 focus:ring-amber-100 focus:border-(--color-accent-gold) outline-none transition-all"
              placeholder="Press Enter to add tags"
            />
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-accent-gold-dark rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-(--color-accent-gold)"
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
                  ? "bg-amber-100 text-accent-gold-dark"
                  : "bg-page-bg text-text-secondary"
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
                  ? "bg-amber-100 text-accent-gold-dark"
                  : "bg-page-bg text-text-secondary"
              }
            `}
          >
            <FiGlobe className="w-4 h-4" />
            Public
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-(--color-surface-border)">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-text-secondary hover:bg-page-bg hover:text-text-primary rounded-xl transition-colors"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 bg-(--color-accent-gold) hover:bg-accent-gold-dark text-stone-900 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : album ? "Update Album" : "Create Album"}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default AlbumForm;
