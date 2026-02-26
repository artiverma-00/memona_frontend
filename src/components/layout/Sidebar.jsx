import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiClock,
  FiImage,
  FiStar,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiMic,
} from "react-icons/fi";

const Sidebar = ({ collapsed = false, onToggle }) => {
  const location = useLocation();

  const mainLinks = [
    { path: "/dashboard", label: "Dashboard", icon: FiHome },
    { path: "/timeline", label: "Timeline", icon: FiClock },
    { path: "/albums", label: "Albums", icon: FiImage },
    { path: "/milestones", label: "Milestones", icon: FiStar },
    { path: "/voice-reflections", label: "Voice Reflections", icon: FiMic },
  ];

  const secondaryLinks = [
    { path: "/shared", label: "Shared", icon: FiUsers },
    { path: "/trending", label: "Trending", icon: FiTrendingUp },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="fixed left-0 top-16 bottom-0 bg-white border-r border-stone-200 z-30 flex flex-col"
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 w-6 h-6 bg-white border border-stone-200 rounded-full flex items-center justify-center shadow-sm hover:bg-stone-100 transition-colors"
      >
        {collapsed ? (
          <FiChevronRight className="w-4 h-4 text-stone-500" />
        ) : (
          <FiChevronLeft className="w-4 h-4 text-stone-500" />
        )}
      </button>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        {/* Main Links */}
        <nav className="space-y-1">
          {mainLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 group relative
                ${
                  isActive(link.path)
                    ? "bg-amber-50 text-amber-700"
                    : "text-stone-600 hover:bg-stone-100"
                }
              `}
            >
              {isActive(link.path) && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-8 bg-amber-500 rounded-r-full"
                />
              )}
              <link.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="my-4 border-t border-stone-200" />

        {/* Secondary Links */}
        <nav className="space-y-1">
          {secondaryLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200
                ${
                  isActive(link.path)
                    ? "bg-amber-50 text-amber-700"
                    : "text-stone-600 hover:bg-stone-100"
                }
              `}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>
      </div>

      {/* Quick Stats */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-stone-200"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
              <p className="text-xs opacity-80 mb-1">This Month</p>
              <p className="text-2xl font-bold">12 Memories</p>
              <p className="text-xs opacity-80 mt-2">
                ↑ 3 more than last month
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

export default Sidebar;
