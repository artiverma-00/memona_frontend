import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHeart,
  FiShare2,
  FiMoreVertical,
  FiMapPin,
  FiCalendar,
  FiImage,
  FiStar,
} from "react-icons/fi";
import { formatDate } from "../../utils/formatDate";
import MemoryCard from "../memory/MemoryCard";

const TimelineItem = ({
  memory,
  index,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShare,
  alignment = "left", // 'left' or 'right'
}) => {
  const isMilestone = memory.isMilestone;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`
        relative flex gap-6 mb-12
        ${alignment === "right" ? "flex-row-reverse" : ""}
        lg:flex-row
      `}
      >
        {/* Timeline Line */}
        <div className="hidden lg:block absolute left-[19px] top-10 bottom-[-50px] w-0.5 bg-[var(--color-surface-border)]" />

        {/* Timeline Dot */}
        <div className="relative z-10 flex-shrink-0">
          <div
            className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${
            isMilestone
              ? "bg-gradient-to-br from-amber-400 to-amber-500"
              : "bg-gradient-to-br from-amber-300 to-amber-400"
          }
          ${isMilestone ? "shadow-[0_0_0_4px_rgba(244,180,0,0.2)]" : ""}
        `}
          >
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
          {isMilestone && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
              <FiStar className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        {/* Content Card container */}
        <div
          className={`
        flex-1 max-w-sm
        ${alignment === "right" ? "text-right" : "text-left"}
      `}
        >
          {/* Date and Time Row */}
          <div className="mb-2 flex w-fit items-center gap-4 rounded-full bg-[var(--color-surface-bg)]/80 px-4 py-1 text-xs text-[var(--color-text-secondary)] backdrop-blur-sm border border-[var(--color-surface-border)]">
            <div className="inline-flex items-center gap-1.5">
              <FiCalendar className="w-3 h-3 text-amber-600" />
              <span className="font-semibold">
                {formatDate(memory.date, "short")}
              </span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)]" />
            <span className="text-[10px] font-medium text-stone-500 tabular-nums">
              {formatDate(memory.date, "time")}
            </span>
          </div>

          {/* Memory Card */}
          <MemoryCard
            memory={memory}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
            onShare={onShare}
            aspectRatio="aspect-video"
          />
        </div>
      </motion.div>
    </>
  );
};

export default TimelineItem;
