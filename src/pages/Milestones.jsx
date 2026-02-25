import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiStar,
  FiTarget,
  FiCheck,
  FiFilter,
  FiBell,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useMemory } from "../context/MemoryContext";
import { confirmDelete } from "../components/shared/ConfirmToast";
import MemoryMilestone from "../components/memory/MemoryMilestone";
import ReflectionPromptModal from "../components/memory/ReflectionPromptModal";
import Modal from "../components/shared/Modal";
import SearchBar from "../components/shared/SearchBar";
import { formatDateForInput } from "../utils/formatDate";
import Loader from "../components/shared/Loader";
import {
  MILESTONE_TYPES,
  MILESTONE_TYPE_ICONS,
  REMINDER_OPTIONS,
} from "../utils/milestoneUtils";
import {
  getUpcomingReminders,
  daysUntilMilestone,
  formatDaysUntil,
  showMilestoneCreated,
  showMilestoneUpdated,
  showMilestoneDeleted,
} from "../utils/notificationUtils";

const Milestones = () => {
  const {
    milestones,
    memories,
    loading,
    fetchMemories,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  } = useMemory();

  const [showForm, setShowForm] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [selectedMilestoneForReflection, setSelectedMilestoneForReflection] =
    useState(null);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: formatDateForInput(new Date()),
    type: "life_event",
    targetDate: "",
    targetCount: 10,
    reminderOption: "1_week_before",
    isPrivate: false,
  });

  useEffect(() => {
    fetchMilestones();
    fetchMemories();
  }, [fetchMilestones, fetchMemories]);

  const normalizeSearchText = (value) => String(value || "").toLowerCase();

  const filteredBySearch = searchQuery
    ? milestones.filter(
        (m) =>
          normalizeSearchText(m.title).includes(
            normalizeSearchText(searchQuery),
          ) ||
          normalizeSearchText(m.description).includes(
            normalizeSearchText(searchQuery),
          ),
      )
    : milestones;

  const filteredByCategory =
    selectedCategory === "all"
      ? filteredBySearch
      : filteredBySearch.filter((m) => m.type === selectedCategory);

  const filteredMilestones = filteredByCategory;

  const upcomingMilestones = useMemo(
    () => getUpcomingReminders(milestones, 30),
    [milestones],
  );

  const handleEdit = (milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      title: milestone.title,
      description: milestone.description || "",
      date: formatDateForInput(milestone.date),
      type: milestone.type || "life_event",
      targetDate: milestone.targetDate
        ? formatDateForInput(milestone.targetDate)
        : "",
      targetCount: milestone.targetCount || 10,
      reminderOption: milestone.reminderOption || "1_week_before",
      isPrivate: milestone.isPrivate || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete(
      "Are you sure you want to delete this milestone?",
    );
    if (!confirmed) return;

    const result = await deleteMilestone(id);
    if (result?.success) {
      showMilestoneDeleted({ title: "Milestone" });
    } else {
      toast.error(result?.error || "Failed to delete milestone");
    }
  };

  const handleOpenReflection = (milestone) => {
    setSelectedMilestoneForReflection(milestone);
    setShowReflection(true);
  };

  const handleSaveReflection = async (reflectionData) => {
    // This would save the reflection to the database
    // For now, we'll just show a notification
    console.log("Reflection saved:", reflectionData);
    setShowReflection(false);
    setSelectedMilestoneForReflection(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingMilestone) {
      await updateMilestone(editingMilestone._id, formData);
      showMilestoneUpdated(formData);
    } else {
      await createMilestone(formData);
      showMilestoneCreated(formData);
    }
    setShowForm(false);
    setEditingMilestone(null);
    setFormData({
      title: "",
      description: "",
      date: formatDateForInput(new Date()),
      type: "life_event",
      targetDate: "",
      targetCount: 10,
      reminderOption: "1_week_before",
      isPrivate: false,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading milestones..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Milestones</h1>
          <p className="text-stone-500">
            Track your achievements and special moments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SearchBar
            placeholder="Search milestones..."
            onSearch={setSearchQuery}
            className="w-64"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingMilestone(null);
              setFormData({
                title: "",
                description: "",
                date: formatDateForInput(new Date()),
                type: "life_event",
                targetDate: "",
                targetCount: 10,
                reminderOption: "1_week_before",
                isPrivate: false,
              });
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 rounded-xl font-semibold text-sm hover:from-amber-500 hover:to-amber-600 transition-all"
          >
            <FiPlus className="w-5 h-5" />
            Create Milestone
          </motion.button>
        </div>
      </div>

      {/* Upcoming Reminders */}
      {upcomingMilestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-l-4 border-amber-400"
        >
          <div className="flex items-start gap-3">
            <FiBell className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900">
                Upcoming Milestones
              </p>
              <p className="text-sm text-amber-800 mt-1">
                You have {upcomingMilestones.length} milestone
                {upcomingMilestones.length !== 1 ? "s" : ""} coming up in the
                next 30 days
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {upcomingMilestones.slice(0, 3).map((m) => (
                  <span
                    key={m._id}
                    className="text-xs bg-white px-2 py-1 rounded-full text-amber-900"
                  >
                    {m.title} ({formatDaysUntil(daysUntilMilestone(m.date))})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <FiStar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">
                {milestones.length}
              </p>
              <p className="text-sm text-stone-500">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FiCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">
                {milestones.filter((m) => m.isCompleted).length}
              </p>
              <p className="text-sm text-stone-500">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FiBell className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">
                {upcomingMilestones.length}
              </p>
              <p className="text-sm text-stone-500">Upcoming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
            selectedCategory === "all"
              ? "bg-amber-400 text-stone-900"
              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
          }`}
        >
          All Types
        </motion.button>

        {Object.entries(MILESTONE_TYPES).map(([key, label]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(key)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedCategory === key
                ? "bg-indigo-400 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {MILESTONE_TYPE_ICONS[key]} {label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      {milestones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <FiStar className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">
            No milestones yet
          </h3>
          <p className="text-stone-500 max-w-md mb-6">
            Create milestones to track your achievements and special moments.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-gold">
            Create Your First Milestone
          </button>
        </div>
      ) : filteredMilestones.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone-500">
            No milestones found
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== "all" &&
              ` in ${MILESTONE_TYPES[selectedCategory]}`}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMilestones.map((milestone) => (
            <div key={milestone._id} className="flex flex-col">
              <MemoryMilestone
                milestone={milestone}
                onClick={() => handleEdit(milestone)}
              />
              <div className="flex gap-2 mt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOpenReflection(milestone)}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-indigo-400 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-indigo-500 hover:to-indigo-600 transition-all"
                >
                  💭 Reflect
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(milestone._id)}
                  className="px-3 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition-all"
                >
                  🗑️
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reflection Modal */}
      <ReflectionPromptModal
        isOpen={showReflection}
        onClose={() => {
          setShowReflection(false);
          setSelectedMilestoneForReflection(null);
        }}
        milestone={selectedMilestoneForReflection}
        onSaveReflection={handleSaveReflection}
      />

      {/* Milestone Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingMilestone(null);
        }}
        title={editingMilestone ? "Edit Milestone" : "Create Milestone"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent bg-stone-50 text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
              placeholder="Milestone title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent bg-stone-50 text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            >
              {Object.entries(MILESTONE_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {MILESTONE_TYPE_ICONS[key]} {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent bg-stone-50 text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none"
              placeholder="Describe this milestone..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent bg-stone-50 text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) =>
                  setFormData({ ...formData, targetDate: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent bg-stone-50 text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Target Memories
            </label>
            <input
              type="number"
              min="1"
              value={formData.targetCount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetCount: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent bg-stone-50 text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Reminder
            </label>
            <select
              value={formData.reminderOption}
              onChange={(e) =>
                setFormData({ ...formData, reminderOption: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent bg-stone-50 text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            >
              {REMINDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingMilestone(null);
              }}
              className="px-6 py-2.5 text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 rounded-xl font-semibold transition-colors"
            >
              {editingMilestone ? "Update" : "Create"} Milestone
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Milestones;
