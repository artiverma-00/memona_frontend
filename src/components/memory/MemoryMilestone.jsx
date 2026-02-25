import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MilestoneStoryCard } from "./PremiumCards";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        group relative
        ${variant === "featured" ? "col-span-2" : ""}
      `}
    >
      <Link to="/milestones" onClick={onClick} className="block">
        <MilestoneStoryCard
          milestone={milestone}
          memoriesCount={memoriesCount}
          variant={variant}
          aspectRatio={
            variant === "featured"
              ? "aspect-[2/1]"
              : variant === "compact"
                ? "aspect-square sm:aspect-video"
                : "aspect-[4/5]"
          }
        />
      </Link>
    </motion.div>
  );
};

export default MemoryMilestone;
