import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiStar, FiCalendar, FiChevronRight, FiBell } from "react-icons/fi";
import { formatDate } from "../../utils/formatDate";
import {
  MILESTONE_TYPE_ICONS,
  MILESTONE_COLORS,
} from "../../utils/milestoneUtils";
import { daysUntilMilestone, isUpcoming } from "../../utils/notificationUtils";

const MemoryMilestone = ({
  milestone,
  onClick,
  variant = "default", // 'default', 'compact', 'featured'
}) => {
  const memoryList = Array.isArray(milestone.memories)
    ? milestone.memories
    : milestone.memories
      ? [milestone.memories]
      : [];
  const memoriesCount = memoryList.length;
  const typeIcon = MILESTONE_TYPE_ICONS[milestone.type] || "🎯";
  const colorGradient =
    MILESTONE_COLORS[milestone.type] || "from-indigo-500 to-purple-600";
  const daysLeft = milestone.date ? daysUntilMilestone(milestone.date) : null;
  const isUpcomingSoon = milestone.date && isUpcoming(milestone.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden 
        shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1
        border border-gray-100 dark:border-gray-700
        ${variant === "featured" ? "col-span-2" : ""}
      `}
    >
      <Link to="/milestones" onClick={onClick} className="block">
        {/* Banner Image */}
        {milestone.coverImage && (
          <div className="relative aspect-[3/1] overflow-hidden">
            <img
              src={milestone.coverImage}
              alt={milestone.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* Type Badge with Upcoming Indicator */}
        {(milestone.type || isUpcomingSoon) && (
          <div
            className={`h-12 bg-gradient-to-r ${colorGradient} relative overflow-hidden`}
          >
            <div className="absolute inset-0 opacity-10 mix-blend-multiply">
              <div className="absolute inset-0 bg-white/10"></div>
            </div>
            <div className="h-full flex items-center justify-between px-4">
              <span className="text-lg">{typeIcon}</span>
              {isUpcomingSoon && daysLeft !== null && (
                <div className="flex items-center gap-1 bg-white/95 px-2 py-1 rounded-lg text-xs font-bold text-stone-900">
                  <FiBell className="w-3 h-3" />
                  {daysLeft === 0 ? "Today!" : `${daysLeft}d`}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className={`
              w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${colorGradient}
              ${variant === "featured" ? "w-16 h-16" : ""}
            `}
            >
              <span
                className={`${variant === "featured" ? "text-3xl" : "text-2xl"}`}
              >
                {typeIcon}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {milestone.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {milestone.type
                    ? milestone.type.replace(/_/g, " ")
                    : "Milestone"}
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                {milestone.description}
              </p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                {formatDate(milestone.date)}
              </div>

              {milestone.targetDate && (
                <div className="flex items-center gap-1">
                  <span className="text-xs">Target:</span>
                  {formatDate(milestone.targetDate)}
                </div>
              )}
            </div>

            {/* Reminder indicator */}
            {milestone.reminderOption &&
              milestone.reminderOption !== "none" && (
                <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg w-fit">
                  <FiBell className="w-3 h-3" />
                  <span className="capitalize">
                    {milestone.reminderOption.replace(/_/g, " ")}
                  </span>
                </div>
              )}
          </div>

          {/* Progress */}
          {milestone.targetCount && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  {memoriesCount} / {milestone.targetCount} memories
                </span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {Math.round((memoriesCount / milestone.targetCount) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, (memoriesCount / milestone.targetCount) * 100)}%`,
                  }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex -space-x-2">
              {memoryList.slice(0, 3).map((memory, index) => {
                const image = memory.media?.find((m) => m.type === "image");
                return image ? (
                  <img
                    key={index}
                    src={image.url}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                  />
                ) : null;
              })}
              {memoriesCount > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                  +{memoriesCount - 3}
                </div>
              )}
            </div>

            <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MemoryMilestone;
