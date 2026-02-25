import React from "react";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiPlay,
  FiMic,
  FiHeart,
  FiShare2,
  FiStar,
} from "react-icons/fi";

const formatIST = (dateString) => {
  const date = dateString ? new Date(dateString) : new Date();
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

// Aspect ratio for "equal size" look
const CARD_ASPECT = "aspect-[4/5]";

export const PhotoStoryCard = ({
  memory,
  onToggleFavorite,
  aspectRatio = CARD_ASPECT,
}) => {
  const mainImage =
    memory.media?.find((m) => m.type === "image")?.url ||
    "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?auto=format&fit=crop&w=800&q=80";

  const hasAudio =
    memory.media?.some((m) => m.type === "audio") || memory.hasAudioNote;

  return (
    <div
      className={`relative ${aspectRatio} rounded-3xl overflow-hidden group shadow-lg transition-all duration-500 hover:shadow-2xl`}
    >
      {/* Background with Ken Burns */}
      <img
        src={mainImage}
        alt={memory.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
      />

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Mic Badge */}
      {hasAudio && (
        <div className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white animate-pulse">
          <FiMic className="w-3 h-3" />
        </div>
      )}

      {/* Floating Meta: IST */}
      <div className="absolute top-4 right-4 text-[9px] font-bold text-white/50 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 uppercase tracking-widest">
        {formatIST(memory.date).split(",")[1]}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <p className="text-amber-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">
          {formatIST(memory.date).split(",")[0]}
        </p>
        <h3 className="text-lg font-bold leading-tight mb-1 truncate">
          {memory.title || "Untold Story"}
        </h3>
        <p className="text-white/60 text-xs line-clamp-1 font-medium mb-3">
          {memory.description || "Captured moment in time..."}
        </p>

        {memory.location?.name && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
            <FiMapPin className="w-3 h-3 text-amber-500" />
            <span className="truncate">{memory.location.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const VideoStoryCard = ({ memory, aspectRatio = CARD_ASPECT }) => {
  const thumbnail =
    memory.media?.find((m) => m.type === "video")?.thumbnail ||
    memory.media?.find((m) => m.type === "image")?.url ||
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80";

  return (
    <div
      className={`relative ${aspectRatio} rounded-3xl overflow-hidden group bg-stone-900 shadow-lg transition-all duration-500`}
    >
      <img
        src={thumbnail}
        alt={memory.title}
        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700"
      />

      {/* Glassmorphism Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-500 group-hover:bg-amber-500 group-hover:border-amber-400">
          <FiPlay className="w-5 h-5 text-white fill-current ml-1" />
        </div>
      </div>

      {/* Duration Badge */}
      <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[10px] font-mono font-bold text-amber-500 border border-white/10">
        {memory.duration || "0:45"}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-lg font-bold text-white truncate mb-1">
          {memory.title || "Motion Memory"}
        </h3>
        <div className="flex items-center gap-3 text-white/40 text-[9px] font-bold tracking-widest uppercase">
          <span>{formatIST(memory.date).split(",")[0]}</span>
          {memory.location?.name && (
            <>
              <span className="w-1 h-1 bg-amber-500 rounded-full" />
              <span>{memory.location.name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const AudioStoryCard = ({ memory, aspectRatio = CARD_ASPECT }) => {
  return (
    <div
      className={`relative ${aspectRatio} rounded-3xl p-6 bg-[#FCFBF8] border border-stone-100 group flex flex-col justify-between shadow-lg transition-all duration-500`}
    >
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-1 group-hover:rotate-0 transition-transform">
          <FiMic className="w-5 h-5 text-white" />
        </div>
        <div className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
          {memory.duration || "02:14"}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-black text-stone-900 leading-tight truncate">
            {memory.title || "Voice Note"}
          </h3>
          {memory.location?.name && (
            <p className="text-stone-400 text-[10px] font-bold flex items-center gap-1 mt-1 uppercase">
              <FiMapPin className="w-3 h-3 text-amber-500" />{" "}
              {memory.location.name}
            </p>
          )}
        </div>

        {/* Minimal Animated Waveform */}
        <div className="flex items-end gap-1 h-10 px-1">
          {[0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 0.5, 0.8, 0.4, 0.6, 0.9, 0.3].map(
            (h, i) => (
              <motion.div
                key={i}
                initial={{ height: "20%" }}
                animate={{ height: `${h * 100}%` }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: i * 0.1,
                  repeatType: "reverse",
                }}
                className="flex-1 bg-amber-200 rounded-full group-hover:bg-amber-400 transition-colors"
              />
            ),
          )}
        </div>

        {/* Gold Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full w-[40%] bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
          </div>
          <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">
            Recorded {formatIST(memory.date).split(",")[0]}
          </p>
        </div>
      </div>
    </div>
  );
};

export const MilestoneStoryCard = ({
  milestone,
  aspectRatio = CARD_ASPECT,
  memoriesCount = 0,
  variant = "default", // 'default' or 'compact'
}) => {
  const isCompact = variant === "compact";

  return (
    <div
      className={`relative ${aspectRatio} rounded-2xl overflow-hidden group shadow-sm transition-all duration-500 hover:shadow-[0_15px_35px_-5px_rgba(245,158,11,0.15)] border ${isCompact ? "border-amber-100/50 bg-[#FFFDFB]" : "border-stone-100 bg-[#FCFAF7]"} flex flex-col`}
    >
      {/* Abstract Background Art */}
      <div
        className={`absolute top-0 right-0 ${isCompact ? "w-24 h-24 blur-[30px]" : "w-40 h-40 blur-[40px]"} bg-amber-50 rounded-full -mr-16 -mt-16 opacity-60 group-hover:opacity-100 transition-opacity duration-1000`}
      />
      <div
        className={`absolute bottom-0 left-0 ${isCompact ? "w-20 h-20 blur-[30px]" : "w-32 h-32 blur-[40px]"} bg-stone-100/50 rounded-full -ml-16 -mb-16`}
      />

      {/* Luxury Top Line */}
      <div
        className={`absolute top-0 left-0 w-full ${isCompact ? "h-[3px]" : "h-[4px]"} bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 opacity-40`}
      />

      {/* Main Content Area */}
      <div
        className={`relative z-10 ${isCompact ? "p-4" : "p-6"} flex-1 flex flex-col justify-between`}
      >
        {/* Top Row */}
        <div className="flex justify-between items-start">
          <div
            className={`${isCompact ? "w-10 h-10 rounded-xl" : "w-12 h-12 rounded-2xl"} bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_5px_15px_rgba(245,158,11,0.25)] group-hover:scale-110 transition-transform duration-700`}
          >
            <FiStar
              className={`${isCompact ? "w-5 h-5" : "w-6 h-6"} text-white fill-current`}
            />
          </div>
          {!isCompact && (
            <div className="text-right">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1 shadow-sm">
                {formatIST(milestone.date).split(",")[0].split(" ")[1]} SERIES
              </p>
              <p className="text-[8px] font-bold text-stone-400 uppercase tracking-tighter opacity-60">
                EST. {formatIST(milestone.date).split(",")[0]}
              </p>
            </div>
          )}
          {isCompact && (
            <div className="px-2 py-0.5 bg-amber-50 rounded-full border border-amber-100">
              <p className="text-[7px] font-black text-amber-600 uppercase tracking-widest leading-none">
                CH.{milestone.type?.substring(0, 2).toUpperCase() || "EV"}
              </p>
            </div>
          )}
        </div>

        {/* Center: Typography */}
        <div className={`${isCompact ? "my-3" : "my-6"} space-y-1`}>
          <div className="flex items-center gap-1.5 text-stone-400">
            <span
              className={`w-1 h-1 bg-amber-500 rounded-full ${!isCompact && "shadow-[0_0_8px_rgba(245,158,11,0.8)]"}`}
            />
            <span className="text-[8px] font-black uppercase tracking-[0.25em] opacity-80">
              {isCompact
                ? "PRESTIGE CHAPTER"
                : milestone.type?.replace("_", " ") || "CHRONICLE EVENT"}
            </span>
          </div>
          <h3
            className={`${isCompact ? "text-[14px]" : "text-lg"} font-black text-stone-900 leading-tight tracking-tight group-hover:text-amber-600 transition-colors duration-500 truncate`}
          >
            {milestone.title}
          </h3>
          {!isCompact && (
            <p className="text-[11px] text-stone-500 font-medium line-clamp-2 leading-relaxed opacity-70 italic">
              "
              {milestone.description ||
                "An essential chapter worth documenting and preserving."}
              "
            </p>
          )}
        </div>

        {/* Bottom: Progress */}
        {milestone.targetCount && (
          <div
            className={`${isCompact ? "pt-3 border-t border-amber-50" : "pt-5 border-t border-stone-100/80"} space-y-3`}
          >
            {!isCompact && (
              <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-black text-stone-300 uppercase tracking-[0.25em]">
                  Collection Goals
                </span>
                <span className="text-xs font-mono font-black text-amber-600">
                  {Math.round((memoriesCount / milestone.targetCount) * 100)}%
                </span>
              </div>
            )}

            <div
              className={`${isCompact ? "h-2" : "h-[3px]"} w-full bg-stone-100 rounded-full overflow-hidden p-[1px]`}
            >
              <div className="h-full bg-white/50 rounded-full w-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, (memoriesCount / milestone.targetCount) * 100)}%`,
                  }}
                  className={`h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full ${isCompact ? "shadow-[0_0_8px_rgba(245,158,11,0.5)]" : ""}`}
                />
              </div>
            </div>

            {isCompact && (
              <div className="flex justify-between items-center px-0.5">
                <p className="text-[7px] font-bold text-stone-400 uppercase tracking-widest leading-none">
                  Growth Status
                </p>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.1em] leading-none">
                  {Math.round((memoriesCount / milestone.targetCount) * 100)}%
                </p>
              </div>
            )}

            {!isCompact && (
              <div className="flex justify-between items-center px-1">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full bg-stone-50 border-2 border-white shadow-sm"
                    />
                  ))}
                </div>
                <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest opacity-60">
                  {memoriesCount} / {milestone.targetCount}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
