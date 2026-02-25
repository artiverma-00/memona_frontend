import { Trash2 } from "lucide-react";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(
    milestone.reminder_enabled || false,
  );

  const milestoneTitle = milestone.title || "Untitled Milestone";
  const milestoneDescription = milestone.description || "";
  const milestoneImage =
    milestone.media?.[0]?.url ||
    milestone.media_url ||
    milestone.memory_thumbnail ||
    null;

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
      const nextValue = !reminderEnabled;
      const result = await updateMilestone(milestone._id, {
        reminder_enabled: nextValue,
      });

      if (result?.success) {
        setReminderEnabled(nextValue);
      } else {
        toast.error(result?.error || "Failed to update reminder");
      }
    } catch (error) {
      console.error("Failed to update reminder:", error);
      toast.error("Failed to update reminder");
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
    <div className="group h-full cursor-pointer">
      <div
        className={`relative h-full overflow-hidden rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-bg)] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
          isDeleting ? "pointer-events-none opacity-50" : ""
        }`}
        onClick={handleCardClick}
      >
        <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-amber-50 to-stone-100">
          {milestoneImage ? (
            <img
              src={milestoneImage}
              alt={milestoneTitle}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center">
              <div>
                <div className="mb-2 text-4xl">📸</div>
                <p className="text-sm text-stone-400">Memory Milestone</p>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center rounded-full bg-[#F4B400] px-3 py-1 text-xs font-semibold text-stone-900 shadow-sm">
              {yearsAgo} {yearsAgo === 1 ? "Year" : "Years"} Ago
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="line-clamp-2 text-lg font-bold text-[var(--color-text-primary)] sm:text-xl">
            {milestoneTitle}
          </h3>

          {milestoneDescription ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {milestoneDescription}
            </p>
          ) : (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              A cherished chapter worth revisiting.
            </p>
          )}

          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-stone-500">
            {formatDate(milestone.celebration_date)}
          </p>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--color-surface-border)] pt-4">
            <button
              onClick={handleToggleReminder}
              aria-label={
                reminderEnabled ? "Disable reminder" : "Enable reminder"
              }
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
                reminderEnabled ? "bg-[#F4B400]" : "bg-stone-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  reminderEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete milestone"
              className="rounded-lg p-2 text-stone-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <button
            onClick={handleCardClick}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#F4B400] px-4 py-2.5 text-sm font-semibold text-stone-900 transition-all duration-200 hover:shadow-md"
          >
            Relive This Moment
          </button>
        </div>
      </div>
    </div>
  );
}
