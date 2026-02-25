import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useMemory } from "../context/MemoryContext";
import MilestoneHeader from "../components/milestone/MilestoneHeader";
import MilestoneStats from "../components/milestone/MilestoneStats";
import NextAnniversaryHighlight from "../components/milestone/NextAnniversaryHighlight";
import MilestoneFilterChips from "../components/milestone/MilestoneFilterChips";
import MilestoneTimeline from "../components/milestone/MilestoneTimeline";
import MilestoneEmptyState from "../components/milestone/MilestoneEmptyState";
import MemoryReflectionModal from "../components/milestone/MemoryReflectionModal";
import ConfettiAnimation from "../components/milestone/ConfettiAnimation";
import { formatDateForInput } from "../utils/formatDate";

export default function MilestonesPage() {
  const navigate = useNavigate();
  const {
    milestones,
    fetchMilestones,
    fetchTodayReminders,
    loading,
    error,
    createMilestone,
    memories = [],
  } = useMemory();

  const [todayReminders, setTodayReminders] = useState([]);
  const [nextAnniversary, setNextAnniversary] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    memory_id: "",
    celebration_date: formatDateForInput(new Date()),
    reminder_enabled: true,
  });

  useEffect(() => {
    const loadMilestones = async () => {
      await fetchMilestones();
      const todayResult = await fetchTodayReminders();
      if (todayResult.success && todayResult.data?.length > 0) {
        setTodayReminders(todayResult.data);
        setShowConfetti(true);
        // Stop confetti after 5 seconds
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
      }
    };

    loadMilestones();
  }, [fetchMilestones, fetchTodayReminders]);

  // Calculate next upcoming anniversary
  useEffect(() => {
    if (!milestones || milestones.length === 0) return;

    const today = new Date();
    const currentYear = today.getFullYear();

    let nextMilestone = null;
    let earliestDate = null;

    milestones.forEach((milestone) => {
      const celebrationDate = new Date(milestone.celebration_date);
      let nextDate = new Date(
        currentYear,
        celebrationDate.getMonth(),
        celebrationDate.getDate(),
        0,
        0,
        0,
      );

      // If anniversary already passed this year, use next year
      if (nextDate < today) {
        nextDate = new Date(
          currentYear + 1,
          celebrationDate.getMonth(),
          celebrationDate.getDate(),
          0,
          0,
          0,
        );
      }

      if (!earliestDate || nextDate < earliestDate) {
        earliestDate = nextDate;
        nextMilestone = milestone;
      }
    });

    setNextAnniversary(nextMilestone);
  }, [milestones]);

  const handleMilestoneCardClick = (milestone) => {
    setSelectedMilestone(milestone);
    setIsReflectionModalOpen(true);
  };

  const handleOpenMemory = (memoryId) => {
    navigate("/photos", {
      state: {
        focusMemoryId: memoryId,
      },
    });
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!formData.memory_id) {
      toast.error("Please select a memory");
      return;
    }
    try {
      const result = await createMilestone(formData);
      if (result.success) {
        toast.success("Milestone created successfully!");
        setShowCreateModal(false);
        setFormData({
          memory_id: "",
          celebration_date: formatDateForInput(new Date()),
          reminder_enabled: true,
        });
      } else {
        toast.error(result.error || "Failed to create milestone");
      }
    } catch (err) {
      toast.error("Error creating milestone");
    }
  };

  const filteredMilestones =
    activeFilters.length === 0
      ? milestones
      : milestones.filter((milestone) => {
          const title = String(milestone?.title || "").toLowerCase();
          const description = String(
            milestone?.description || "",
          ).toLowerCase();
          const type = String(milestone?.type || "").toLowerCase();

          return activeFilters.some((filter) => {
            if (type.includes(filter)) {
              return true;
            }
            return title.includes(filter) || description.includes(filter);
          });
        });

  return (
    <div className="min-h-screen premiere-light-bg">
      {/* Confetti Animation */}
      <ConfettiAnimation isActive={showConfetti} />

      {/* Background blur effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-50 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-50 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Create Button - Top Right */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 rounded-xl font-semibold text-sm hover:from-amber-500 hover:to-amber-600 transition-all shadow-md"
          >
            <FiPlus className="w-5 h-5" />
            Create Milestone
          </motion.button>
        </div>

        {/* Header */}
        <MilestoneHeader />

        {/* Stats Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12 md:mb-16">
          <MilestoneStats milestones={filteredMilestones} />
        </section>

        {/* Next Anniversary Highlight */}
        {nextAnniversary && (
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
            <NextAnniversaryHighlight milestone={nextAnniversary} />
          </section>
        )}

        {/* Filter Chips */}
        {milestones && milestones.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
            <MilestoneFilterChips onFilterChange={handleFilterChange} />
          </section>
        )}

        {/* Milestones Timeline or Empty State */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
          {filteredMilestones && filteredMilestones.length > 0 ? (
            <MilestoneTimeline
              milestones={filteredMilestones}
              loading={loading}
              onCardClick={handleMilestoneCardClick}
            />
          ) : (
            <MilestoneEmptyState loading={loading} />
          )}
        </section>

        {/* Error State */}
        {error && (
          <div className="fixed bottom-6 right-6 bg-red-50 border border-red-200 rounded-lg px-6 py-4 shadow-lg">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Reflection Modal */}
      <MemoryReflectionModal
        milestone={selectedMilestone}
        isOpen={isReflectionModalOpen}
        onClose={() => {
          setIsReflectionModalOpen(false);
          setSelectedMilestone(null);
        }}
        onOpenMemory={handleOpenMemory}
      />

      {/* Create Milestone Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-stone-900">
                Create Milestone
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-500 hover:text-stone-700 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="p-6 space-y-6">
              {/* Memory Selection */}
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-2">
                  Select Memory
                </label>
                <select
                  value={formData.memory_id}
                  onChange={(e) =>
                    setFormData({ ...formData, memory_id: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                >
                  <option value="">Choose a memory...</option>
                  {memories && memories.length > 0 ? (
                    memories.map((memory) => (
                      <option key={memory._id} value={memory._id}>
                        {memory.title ||
                          `Memory - ${new Date(memory.date).toLocaleDateString()}`}
                      </option>
                    ))
                  ) : (
                    <option disabled>No memories available</option>
                  )}
                </select>
              </div>

              {/* Celebration Date */}
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-2">
                  Celebration Date
                </label>
                <input
                  type="date"
                  value={formData.celebration_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      celebration_date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                />
              </div>

              {/* Reminder Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={formData.reminder_enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reminder_enabled: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                />
                <label
                  htmlFor="reminder"
                  className="text-sm font-medium text-stone-900"
                >
                  Enable reminders
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-stone-200 text-stone-900 rounded-lg font-semibold hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 rounded-lg font-semibold hover:from-amber-500 hover:to-amber-600 transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
