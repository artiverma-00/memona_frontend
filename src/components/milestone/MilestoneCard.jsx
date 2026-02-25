import { Bell, BellOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useMemory } from "../../context/MemoryContext";
import { confirmDelete } from "../../components/shared/ConfirmToast";

export default function MilestoneCard({
  milestone,
  onCardClick,
  onOpenMemory,
}) {
  const { updateMilestone, deleteMilestone } = useMemory();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(
    milestone.reminder_enabled || false,
  );

  const calculateYearsAgo = (date) => {
    if (!date) return 0;
    const targetDate = new Date(date);
    const today = new Date();
    return today.getFullYear() - targetDate.getFullYear();
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleToggleReminder = async (e) => {
    e.stopPropagation();
    try {
      await updateMilestone(milestone._id, {
        ...milestone,
        reminder_enabled: !reminderEnabled,
      });
      setReminderEnabled(!reminderEnabled);
    } catch (error) {
      console.error("Failed to update reminder:", error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmed = await confirmDelete(
      "Are you sure you want to delete this milestone? This action cannot be undone.",
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteMilestone(milestone._id);
      toast.success("Milestone deleted successfully!");
    } catch (error) {
      console.error("Failed to delete milestone:", error);
      toast.error("Failed to delete milestone");
      setIsDeleting(false);
    }
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (onCardClick) {
      onCardClick(milestone);
    }
  };

  const yearsAgo = calculateYearsAgo(milestone.celebration_date);

  return (
    <div
      className="group h-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col border border-gold-100 ${
          isHovered ? "shadow-2xl -translate-y-2 border-gold-300" : "shadow-lg"
        } ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
        onClick={handleCardClick}
      >
        {/* Thumbnail Section */}
        <div className="relative w-full h-56 bg-gradient-to-br from-gold-50 to-amber-50 overflow-hidden flex items-center justify-center">
          {milestone.memory_thumbnail ? (
            <img
              src={milestone.memory_thumbnail}
              alt={milestone.memory_title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-2">📸</div>
              <p className="text-gray-400 text-sm font-light">
                Memory Milestone
              </p>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <span className="text-white font-semibold">Click to Reflect</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col">
          {/* Title */}
          <div className="mb-2">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-900 group-hover:text-gold-600 transition-colors line-clamp-2">
              {milestone.memory_title}
            </h3>
          </div>

          {/* Description */}
          {milestone.memory_description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 font-light italic">
              "{milestone.memory_description}"
            </p>
          )}

          {/* Date */}
          <p className="text-xs text-gray-500 mb-2 font-light uppercase tracking-wide">
            {formatDate(milestone.celebration_date)}
          </p>

          {/* Years Badge */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-gold-100 text-gold-700 text-xs font-bold rounded-full">
              {yearsAgo} {yearsAgo === 1 ? "Year" : "Years"} Ago
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
            {/* Reflect Button */}
            <button
              onClick={handleCardClick}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 text-white rounded-lg font-medium text-sm hover:shadow-md transform transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>💭</span>
              <span>Reflect</span>
            </button>

            {/* Reminder Toggle */}
            <button
              onClick={handleToggleReminder}
              title={reminderEnabled ? "Disable reminder" : "Enable reminder"}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                reminderEnabled
                  ? "bg-gold-100 text-gold-600 hover:bg-gold-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {reminderEnabled ? <Bell size={18} /> : <BellOff size={18} />}
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete milestone"
              className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-300 disabled:opacity-50"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
