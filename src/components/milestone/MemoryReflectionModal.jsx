import { X, MapPin, Tag } from "lucide-react";
import Modal from "../shared/Modal";
import ConfettiAnimation from "./ConfettiAnimation";

export default function MemoryReflectionModal({
  milestone,
  isOpen,
  onClose,
  onOpenMemory,
}) {
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

  if (!milestone) return null;

  const milestoneTitle = milestone.title || "Untitled Milestone";
  const milestoneDescription = milestone.description || "";
  const milestoneImage =
    milestone.media?.[0]?.url ||
    milestone.media_url ||
    milestone.memory_thumbnail ||
    null;
  const linkedMemoryId = milestone.memory_id || null;
  const locationName =
    milestone.location?.name ||
    milestone.location_name ||
    milestone.location ||
    "";
  const tags = Array.isArray(milestone.tags) ? milestone.tags : [];

  const isAnniversaryToday = (() => {
    if (!milestone.celebration_date) return false;
    const celebration = new Date(milestone.celebration_date);
    const today = new Date();
    return (
      celebration.getMonth() === today.getMonth() &&
      celebration.getDate() === today.getDate()
    );
  })();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnBackdropClick={false}
    >
      <div className="relative max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--color-surface-bg)]">
        <ConfettiAnimation isActive={isAnniversaryToday && isOpen} />

        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-amber-50 to-stone-100 sm:h-96">
          {milestoneImage && (
            <img
              src={milestoneImage}
              alt={milestoneTitle}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

          <button
            onClick={onClose}
            className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-900 transition-colors duration-200 hover:bg-stone-100"
          >
            <X size={24} className="text-gray-900" />
          </button>

          <div className="absolute bottom-6 right-6">
            <span className="inline-flex items-center rounded-full bg-[#F4B400] px-4 py-2 text-sm font-semibold text-stone-900 shadow-md">
              {calculateYearsSince(milestone.celebration_date)}{" "}
              {calculateYearsSince(milestone.celebration_date) === 1
                ? "year"
                : "years"}
            </span>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-10">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
              {milestoneTitle}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] sm:text-base">
              {formatDate(milestone.celebration_date)}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-surface-border)] bg-white/70 p-5">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
              Full Story
            </h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              {milestoneDescription ||
                "This moment marks a meaningful chapter in your memory timeline."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-amber-50 p-4 text-center">
              <p className="text-2xl font-bold text-[#F4B400]">
                {calculateYearsSince(milestone.celebration_date)}
              </p>
              <p className="text-xs uppercase tracking-wide text-stone-600">
                Years Since
              </p>
            </div>

            <div className="rounded-xl bg-stone-50 p-4 text-center sm:col-span-2">
              <div className="flex items-center justify-center gap-2 text-stone-600">
                <MapPin size={15} />
                <span className="text-sm font-medium">
                  {locationName || "No location added"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-surface-border)] bg-white/70 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-700">
              <Tag size={14} /> Tags
            </div>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-secondary)]">
                No tags added
              </p>
            )}
          </div>

          {linkedMemoryId && (
            <button
              onClick={() => onOpenMemory?.(linkedMemoryId)}
              className="w-full rounded-xl bg-[#F4B400] px-6 py-3 text-sm font-semibold text-stone-900 transition-all duration-200 hover:shadow-md"
            >
              Open Full Memory Page
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full rounded-xl border border-[var(--color-surface-border)] px-6 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-colors duration-200 hover:bg-stone-50"
          >
            Close
          </button>
          {isAnniversaryToday && (
            <p className="text-center text-xs font-medium text-[#F4B400]">
              Anniversary today ✨
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
